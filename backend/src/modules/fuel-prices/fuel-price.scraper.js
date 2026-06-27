import { env } from '../../config/env.js'
import { AppError } from '../../shared/errors/app-error.js'

const SCRAPER_PROVIDER = 'SCRAPER'

// preciocombustible.cl publica el promedio nacional por combustible con la forma
// "<icono> <Etiqueta> $1.382 /lt". Anclamos al icono+etiqueta para no confundir
// el diesel con la bencina, el kerosene ni con cifras del texto descriptivo.
const FUEL_ANCHORS = {
  DIESEL: [/oil_barrel\s+Diesel\s*\$\s*([0-9][0-9.,]*)\s*\/\s*lt/i, /Valor\s+petr[oó]leo\s*\(diesel\)\s*hoy\s*\$\s*([0-9][0-9.,]*)/i],
  GASOLINE: [/gas_meter\s+Bencina\s*93\s*\$\s*([0-9][0-9.,]*)\s*\/\s*lt/i],
  KEROSENE: [/fireplace\s+Kerosene\s*\$\s*([0-9][0-9.,]*)\s*\/\s*lt/i],
}

const FUEL_DISPLAY = {
  DIESEL: 'Diesel',
  GASOLINE: 'Bencina 93',
  KEROSENE: 'Kerosene',
}

/**
 * Fuente unica del precio de combustible: scraping de un sitio publico (por
 * defecto preciocombustible.cl, que publica el promedio nacional de
 * bencina/diesel/kerosene en CLP por litro). El servicio lo ejecuta una vez al
 * dia (06:00 hora de Chile) y bajo demanda si el cache esta vencido.
 */
export async function scrapeFuelPrice({ normalizedFuelType, regionCode, fetchedAt }) {
  const anchors = FUEL_ANCHORS[normalizedFuelType]

  if (!anchors) {
    throw new AppError(`Scraping no soporta el combustible ${normalizedFuelType}.`, 422, {
      provider: SCRAPER_PROVIDER,
      normalizedFuelType,
    })
  }

  const html = await fetchHtml(env.scraper.url)
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  const pricePerLiter = extractPricePerLiter(text, anchors)

  if (!pricePerLiter) {
    throw new AppError('No se pudo extraer un precio valido del sitio publico.', 502, {
      provider: SCRAPER_PROVIDER,
      url: env.scraper.url,
    })
  }

  const sourceDate = extractSourceDate(html)
  const now = fetchedAt || new Date().toISOString()

  return {
    errorMessage: '',
    fuelType: FUEL_DISPLAY[normalizedFuelType] || normalizedFuelType,
    id: `scraper-${normalizedFuelType.toLowerCase()}-${regionCode}`,
    lastFetchedAt: now,
    month: sourceDate ? new Date(sourceDate).getUTCMonth() + 1 : null,
    normalizedFuelType,
    pricePerLiter,
    provider: SCRAPER_PROVIDER,
    raw: { url: env.scraper.url },
    regionCode,
    regionName: 'Chile (promedio nacional)',
    source: env.scraper.sourceLabel,
    sourceDate: sourceDate || now,
    status: 'OK',
    year: sourceDate ? new Date(sourceDate).getUTCFullYear() : null,
  }
}

async function fetchHtml(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), env.scraper.requestTimeoutMs)

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': env.scraper.userAgent,
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new AppError(`La fuente de scraping respondio HTTP ${response.status}.`, 502, {
        provider: SCRAPER_PROVIDER,
        status: response.status,
      })
    }

    return response.text()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new AppError('La fuente de scraping no respondio a tiempo.', 504, {
        provider: SCRAPER_PROVIDER,
        timeoutMs: env.scraper.requestTimeoutMs,
      })
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

/** Prueba cada ancla del combustible y devuelve el primer precio plausible. */
function extractPricePerLiter(text, anchors) {
  for (const anchor of anchors) {
    const match = text.match(anchor)

    if (match) {
      const value = parseChileanPrice(match[1])

      if (value >= 200 && value <= 3000) {
        return value
      }
    }
  }

  return 0
}

function extractSourceDate(html) {
  // preciocombustible.cl expone la fecha en el JSON-LD como "dateModified".
  const match = html.match(/"dateModified"\s*:\s*"([^"]+)"/i)

  if (!match) {
    return ''
  }

  const parsed = new Date(match[1])

  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString()
}

/** Formato chileno: "$1.382" = 1382 (el punto separa miles). */
function parseChileanPrice(value) {
  const normalized = String(value || '')
    .replace(/\./g, '') // quitar separador de miles
    .replace(',', '.') // coma decimal -> punto (raro en combustible, por robustez)
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? Math.round(parsed) : 0
}
