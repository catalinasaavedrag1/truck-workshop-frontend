import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { env } from '../../config/env.js'
import { fuelPriceSnapshotResource } from '../../config/resources.js'
import { createRepository } from '../../shared/data/repository-factory.js'
import { scrapeFuelPrice } from './fuel-price.scraper.js'

const PROVIDER = 'SCRAPER'

// Archivo donde se guarda el ultimo precio scrapeado, para que sobreviva a los
// reinicios del backend (el repositorio en memoria se vacia al reiniciar).
const SNAPSHOT_FILE = resolve(dirname(fileURLToPath(import.meta.url)), '../../../data/fuel-price-snapshots.json')

function readSnapshotsFromDisk() {
  try {
    if (!existsSync(SNAPSHOT_FILE)) {
      return []
    }
    const parsed = JSON.parse(readFileSync(SNAPSHOT_FILE, 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeSnapshotsToDisk(records) {
  try {
    mkdirSync(dirname(SNAPSHOT_FILE), { recursive: true })
    writeFileSync(SNAPSHOT_FILE, JSON.stringify(records, null, 2))
  } catch (error) {
    console.warn(`No se pudo guardar el precio de combustible en disco: ${error.message}`)
  }
}

export class FuelPriceService {
  constructor() {
    this.repository = createRepository(fuelPriceSnapshotResource)
    this.lastScrapeAttemptAt = 0
  }

  /** Carga en el repositorio el ultimo precio guardado en disco (al arrancar). */
  async restoreFromDisk() {
    const records = readSnapshotsFromDisk()
    if (records.length > 0) {
      await this.repository.upsertMany(records)
    }
    return records.length
  }

  /** Persiste en disco todos los snapshots vigentes del repositorio. */
  async persistToDisk() {
    const all = await this.repository.findAll({ limit: 1000, order: 'desc', sort: 'lastFetchedAt' })
    writeSnapshotsToDisk(all.data)
  }

  async getCurrentPrice(options = {}) {
    const normalizedFuelType = normalizeFuelType(options.fuelType || env.scraper.defaultFuelType)
    const regionCode = String(options.regionCode || env.scraper.defaultRegionCode).trim()
    let syncError

    // Unica fuente: scraping web diario. Si el cache esta vencido (mas de 24 h)
    // intentamos refrescar bajo demanda; si falla, se devuelve el ultimo dato
    // cacheado y, si no hay ninguno, el fallback configurable.
    if (env.scraper.enabled) {
      const cached = await this.findLatest({ normalizedFuelType, regionCode })

      if (!cached || this.isStale(cached)) {
        try {
          await this.scrapeIfDue({ normalizedFuelType, regionCode })
        } catch (error) {
          syncError = error
        }
      }
    }

    const refreshed = await this.findLatest({ normalizedFuelType, regionCode })

    if (refreshed) {
      return toSnapshot(refreshed, syncError)
    }

    return this.buildFallbackSnapshot({ normalizedFuelType, regionCode, syncError })
  }

  /**
   * Refresco manual forzado (boton "Actualizar precio" del frontend): hace
   * scraping inmediato. Nunca lanza: devuelve el mejor snapshot disponible.
   */
  async forceRefresh(options = {}) {
    const normalizedFuelType = normalizeFuelType(options.fuelType || env.scraper.defaultFuelType)
    const regionCode = String(options.regionCode || env.scraper.defaultRegionCode).trim()
    let syncError

    if (env.scraper.enabled) {
      try {
        await this.scrape({ actorName: options.actorName, normalizedFuelType, regionCode })
      } catch (error) {
        syncError = error
      }
    }

    const snapshot = await this.getCurrentPrice({ fuelType: normalizedFuelType, regionCode })

    return {
      provider: snapshot.provider,
      snapshot,
      source: snapshot.source,
      syncError: syncError ? syncError.message : undefined,
      syncedAt: new Date().toISOString(),
    }
  }

  async scrapeIfDue(options = {}) {
    const now = Date.now()
    // No reintentar el scraping mas de una vez por minuto ante peticiones seguidas.
    const minGapMs = 60_000

    if (!options.force && this.lastScrapeAttemptAt && now - this.lastScrapeAttemptAt < minGapMs) {
      return { skipped: true, reason: 'recent-attempt' }
    }

    return this.scrape(options)
  }

  async scrape(options = {}) {
    this.lastScrapeAttemptAt = Date.now()
    const normalizedFuelType = normalizeFuelType(
      options.normalizedFuelType || options.fuelType || env.scraper.defaultFuelType,
    )
    const regionCode = String(options.regionCode || env.scraper.defaultRegionCode).trim()
    const fetchedAt = new Date().toISOString()
    const record = await scrapeFuelPrice({ normalizedFuelType, regionCode, fetchedAt })
    const saved = await this.repository.upsertMany([record])

    // Guardar en disco para que el precio sobreviva a reinicios del backend.
    await this.persistToDisk()

    return {
      provider: env.scraper.sourceLabel,
      record: toSnapshot(saved[0] || record),
      syncedAt: fetchedAt,
    }
  }

  async listHistory(query = {}) {
    return this.repository.findAll({
      limit: query.limit || 25,
      order: query.order || 'desc',
      page: query.page || 1,
      regionCode: query.regionCode || env.scraper.defaultRegionCode,
      sort: query.sort || 'lastFetchedAt',
      status: query.status,
      normalizedFuelType: query.fuelType ? normalizeFuelType(query.fuelType) : undefined,
    })
  }

  async findLatest(filters) {
    const result = await this.repository.findAll({
      limit: 1,
      normalizedFuelType: filters.normalizedFuelType,
      order: 'desc',
      regionCode: filters.regionCode,
      sort: 'lastFetchedAt',
      status: 'OK',
    })

    return result.data[0] || null
  }

  isStale(record) {
    if (!record?.lastFetchedAt) {
      return true
    }

    return Date.now() - new Date(record.lastFetchedAt).getTime() >= env.scraper.staleAfterMinutes * 60_000
  }

  buildFallbackSnapshot({ normalizedFuelType, regionCode, syncError }) {
    return {
      errorMessage: syncError ? syncError.message : 'Sin precio cacheado.',
      fuelType: normalizedFuelType,
      id: `fallback-${normalizedFuelType.toLowerCase()}-${regionCode}`,
      isOfficial: false,
      isStale: true,
      lastFetchedAt: null,
      minutesUntilNextSync: 0,
      normalizedFuelType,
      pricePerLiter: env.scraper.fallbackDieselPricePerLiter,
      provider: 'LOCAL',
      regionCode,
      regionName: regionCode === '13' ? 'Metropolitana de Santiago' : '',
      source: 'Fallback configurable',
      sourceDate: null,
      status: 'FALLBACK',
      syncIntervalMinutes: env.scraper.staleAfterMinutes,
    }
  }
}

export const fuelPriceService = new FuelPriceService()

function normalizeFuelType(value) {
  const text = String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()

  if (!text) {
    return ''
  }

  if (text.includes('DIESEL') || text.includes('PETROLEO')) {
    return 'DIESEL'
  }

  if (text.includes('GASOLINA') || text.includes('BENCINA')) {
    return 'GASOLINE'
  }

  if (text.includes('KEROSENE') || text.includes('PARAFINA')) {
    return 'KEROSENE'
  }

  if (text.includes('GAS')) {
    return 'GAS'
  }

  return text.replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

function toSnapshot(record, syncError) {
  const lastFetchedAt = record.lastFetchedAt || null
  const nextSyncAt = lastFetchedAt
    ? new Date(new Date(lastFetchedAt).getTime() + env.scraper.staleAfterMinutes * 60_000).toISOString()
    : null
  const minutesUntilNextSync = nextSyncAt
    ? Math.max(0, Math.ceil((new Date(nextSyncAt).getTime() - Date.now()) / 60_000))
    : 0

  return {
    errorMessage: syncError?.message || record.errorMessage || '',
    fuelType: record.fuelType,
    id: record.id,
    isOfficial: false,
    isStale: lastFetchedAt ? Date.now() - new Date(lastFetchedAt).getTime() >= env.scraper.staleAfterMinutes * 60_000 : true,
    lastFetchedAt,
    minutesUntilNextSync,
    month: record.month,
    nextSyncAt,
    normalizedFuelType: record.normalizedFuelType,
    pricePerLiter: Math.round(Number(record.pricePerLiter || 0)),
    provider: record.provider,
    regionCode: record.regionCode,
    regionName: record.regionName,
    source: record.source,
    sourceDate: record.sourceDate,
    status: record.status,
    syncIntervalMinutes: env.scraper.staleAfterMinutes,
    year: record.year,
  }
}
