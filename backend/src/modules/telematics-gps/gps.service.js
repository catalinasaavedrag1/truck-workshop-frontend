import { env } from '../../config/env.js'
import { AppError } from '../../shared/errors/app-error.js'

const SOURCE = 'DS-TMS'

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/** Normaliza un registro de posicion de DS-TMS a un shape estable y tipado. */
function normalizePosition(row) {
  return {
    plate: String(row.patente || '').trim(),
    lat: toNumber(row.lat),
    lng: toNumber(row.lng),
    location: String(row.ubicacion || '').trim(),
    fixedAt: String(row.fechahora || '').trim(),
    speed: toNumber(row.velocidad),
    heading: toNumber(row.sentido),
    engineOn: toNumber(row.motor) > 0,
    odometerKm: Math.round(toNumber(row.odometro) / 1000),
    voltage: toNumber(row.voltaje),
    satellites: toNumber(row.satelites || row.satellites),
    driver: String(row.conductor || '').trim(),
  }
}

async function fetchDsTms(url, token) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), env.dsTms.requestTimeoutMs)

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json', Authorization: token },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new AppError(`DS-TMS respondio HTTP ${response.status}.`, 502, { provider: SOURCE, status: response.status })
    }

    const payload = await response.json()

    if (payload?.error) {
      throw new AppError(`DS-TMS: ${payload.message || 'respuesta con error'}.`, 502, { provider: SOURCE })
    }

    return Array.isArray(payload?.data) ? payload.data : []
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new AppError('DS-TMS no respondio a tiempo.', 504, { provider: SOURCE })
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export const gpsService = {
  /** Ultima posicion de cada movil de la flota del cliente. */
  async getLastPositions() {
    if (!env.dsTms.enabled) {
      throw new AppError('Integracion DS-TMS deshabilitada.', 503, { provider: SOURCE })
    }

    const url = new URL(`/api/v1/getLastPosition/${encodeURIComponent(env.dsTms.client)}`, env.dsTms.baseUrl)
    const rows = await fetchDsTms(url, env.dsTms.lastPositionToken)

    return {
      provider: SOURCE,
      client: env.dsTms.client,
      fetchedAt: new Date().toISOString(),
      total: rows.length,
      positions: rows.map(normalizePosition),
    }
  },

  /** Historial de posiciones de una patente en un rango de fechas. */
  async getHistory({ plate, tsStart, tsEnd }) {
    if (!env.dsTms.enabled) {
      throw new AppError('Integracion DS-TMS deshabilitada.', 503, { provider: SOURCE })
    }

    if (!plate) {
      throw new AppError('Falta la patente para consultar el historial.', 422, { provider: SOURCE })
    }

    const url = new URL('/api/v1/getHistoryPosition', env.dsTms.baseUrl)
    url.searchParams.set('client', env.dsTms.client)
    url.searchParams.set('patente', plate)
    url.searchParams.set('ts_start', tsStart)
    url.searchParams.set('ts_end', tsEnd)

    const rows = await fetchDsTms(url, env.dsTms.historyToken)

    return {
      provider: SOURCE,
      client: env.dsTms.client,
      plate,
      tsStart,
      tsEnd,
      fetchedAt: new Date().toISOString(),
      total: rows.length,
      positions: rows.map(normalizePosition),
    }
  },
}
