import { env } from '../../config/env.js'
import { fuelPriceSnapshotResource } from '../../config/resources.js'
import { createRepository } from '../../shared/data/repository-factory.js'
import { AppError } from '../../shared/errors/app-error.js'

const PROVIDER = 'CNE'
const SOURCE = 'CNE / Energia Abierta'

export class FuelPriceService {
  constructor() {
    this.repository = createRepository(fuelPriceSnapshotResource)
    this.lastSyncAttemptAt = 0
  }

  async getCurrentPrice(options = {}) {
    const normalizedFuelType = normalizeFuelType(options.fuelType || env.cne.defaultFuelType)
    const regionCode = String(options.regionCode || env.cne.defaultRegionCode).trim()
    const cached = await this.findLatest({ normalizedFuelType, regionCode })
    let syncError

    if (!env.cne.apiToken && !cached) {
      return this.buildFallbackSnapshot({
        normalizedFuelType,
        regionCode,
        syncError: new Error('CNE_API_TOKEN no configurado para consultar Energia Abierta.'),
      })
    }

    if (!cached || this.isStale(cached)) {
      try {
        await this.syncIfDue()
      } catch (error) {
        syncError = error
      }
    }

    const refreshed = await this.findLatest({ normalizedFuelType, regionCode })

    if (refreshed) {
      return toSnapshot(refreshed, syncError)
    }

    return this.buildFallbackSnapshot({ normalizedFuelType, regionCode, syncError })
  }

  async listHistory(query = {}) {
    return this.repository.findAll({
      limit: query.limit || 25,
      order: query.order || 'desc',
      page: query.page || 1,
      regionCode: query.regionCode || env.cne.defaultRegionCode,
      sort: query.sort || 'lastFetchedAt',
      status: query.status,
      normalizedFuelType: query.fuelType ? normalizeFuelType(query.fuelType) : undefined,
    })
  }

  async syncIfDue(options = {}) {
    const intervalMs = env.cne.syncIntervalMinutes * 60_000
    const now = Date.now()

    if (!options.force && this.lastSyncAttemptAt && now - this.lastSyncAttemptAt < intervalMs) {
      return { skipped: true, reason: 'recent-attempt' }
    }

    const latest = await this.findLatestAny()

    if (!options.force && latest?.lastFetchedAt && now - new Date(latest.lastFetchedAt).getTime() < intervalMs) {
      return { skipped: true, latest: toSnapshot(latest), reason: 'cache-fresh' }
    }

    return this.sync(options)
  }

  async sync(options = {}) {
    this.lastSyncAttemptAt = Date.now()

    if (!env.cne.apiToken) {
      throw new AppError('CNE_API_TOKEN no configurado para consultar Energia Abierta.', 503, {
        provider: SOURCE,
        requiredEnv: 'CNE_API_TOKEN',
      })
    }

    const now = new Date().toISOString()
    const payload = await this.fetchCneFuelPrices()
    const rows = extractRows(payload)
    const records = rows
      .map((row) => normalizeCneRecord(row, now))
      .filter(Boolean)

    if (records.length === 0) {
      throw new AppError('CNE no retorno precios de combustibles utilizables.', 502, {
        provider: SOURCE,
        totalRows: rows.length,
      })
    }

    const saved = await this.repository.upsertMany(records)

    return {
      provider: SOURCE,
      records: saved.map((record) => toSnapshot(record)),
      syncedAt: now,
      total: saved.length,
      triggeredBy: options.actorName || 'Sistema',
    }
  }

  async fetchCneFuelPrices() {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), env.cne.requestTimeoutMs)
    const url = new URL(env.cne.fuelPricesPath, env.cne.baseUrl)

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${env.cne.apiToken}`,
        },
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new AppError(`CNE respondio HTTP ${response.status} al consultar precios de combustible.`, 502, {
          provider: SOURCE,
          status: response.status,
        })
      }

      return response.json()
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new AppError('CNE no respondio dentro del tiempo configurado.', 504, {
          provider: SOURCE,
          timeoutMs: env.cne.requestTimeoutMs,
        })
      }

      throw error
    } finally {
      clearTimeout(timeout)
    }
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

  async findLatestAny() {
    const result = await this.repository.findAll({
      limit: 1,
      order: 'desc',
      sort: 'lastFetchedAt',
      status: 'OK',
    })

    return result.data[0] || null
  }

  isStale(record) {
    if (!record?.lastFetchedAt) {
      return true
    }

    return Date.now() - new Date(record.lastFetchedAt).getTime() >= env.cne.syncIntervalMinutes * 60_000
  }

  buildFallbackSnapshot({ normalizedFuelType, regionCode, syncError }) {
    return {
      errorMessage: syncError ? syncError.message : 'Sin precio cacheado de CNE.',
      fuelType: normalizedFuelType,
      id: `fallback-${normalizedFuelType.toLowerCase()}-${regionCode}`,
      isOfficial: false,
      isStale: true,
      lastFetchedAt: null,
      minutesUntilNextSync: 0,
      normalizedFuelType,
      pricePerLiter: env.cne.fallbackDieselPricePerLiter,
      provider: 'LOCAL',
      regionCode,
      regionName: regionCode === '13' ? 'Metropolitana de Santiago' : '',
      source: 'Fallback configurable',
      sourceDate: null,
      status: 'FALLBACK',
      syncIntervalMinutes: env.cne.syncIntervalMinutes,
    }
  }
}

export const fuelPriceService = new FuelPriceService()

function extractRows(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload?.result)) {
    return payload.result
  }

  return []
}

function normalizeCneRecord(row, fetchedAt) {
  const fuelType = String(row.tipo_combustible ?? row.fuelType ?? row.combustible ?? '').trim()
  const normalizedFuelType = normalizeFuelType(fuelType)
  const regionCode = String(row.region_cod ?? row.regionCode ?? row.region_codigo ?? '').trim()
  const pricePerLiter = parsePrice(row.precio_por_litro ?? row.pricePerLiter ?? row.precio)

  if (!normalizedFuelType || !regionCode || pricePerLiter <= 0) {
    return null
  }

  const year = parseInteger(row.anio)
  const month = parseInteger(row.mes)

  return {
    errorMessage: '',
    fuelType,
    id: `cne-${normalizedFuelType.toLowerCase()}-${slug(regionCode)}`,
    lastFetchedAt: fetchedAt,
    month,
    normalizedFuelType,
    pricePerLiter,
    provider: PROVIDER,
    raw: row,
    regionCode,
    regionName: String(row.region_nombre ?? row.regionName ?? '').trim(),
    source: SOURCE,
    sourceDate: parseSourceDate(row.fecha, year, month),
    status: 'OK',
    year,
  }
}

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

function parsePrice(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.round(value) : 0
  }

  let normalized = String(value || '').replace(/[^\d,.-]/g, '')

  if (!normalized) {
    return 0
  }

  const dotCount = (normalized.match(/\./g) || []).length

  if (normalized.includes(',') && normalized.includes('.')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.')
  } else if (normalized.includes(',')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.')
  } else if (dotCount === 1 && normalized.split('.')[1]?.length === 3) {
    normalized = normalized.replace('.', '')
  } else if (dotCount > 1) {
    normalized = normalized.replace(/\./g, '')
  }

  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? Math.round(parsed) : 0
}

function parseSourceDate(value, year, month) {
  if (value) {
    const parsed = new Date(value)

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
  }

  if (year && month) {
    return new Date(Date.UTC(year, month - 1, 1)).toISOString()
  }

  return new Date().toISOString()
}

function parseInteger(value) {
  const parsed = Number(value)

  return Number.isFinite(parsed) ? Math.trunc(parsed) : null
}

function slug(value) {
  return String(value || 'all').replace(/[^a-zA-Z0-9_-]/g, '-')
}

function toSnapshot(record, syncError) {
  const lastFetchedAt = record.lastFetchedAt || null
  const nextSyncAt = lastFetchedAt
    ? new Date(new Date(lastFetchedAt).getTime() + env.cne.syncIntervalMinutes * 60_000).toISOString()
    : null
  const minutesUntilNextSync = nextSyncAt
    ? Math.max(0, Math.ceil((new Date(nextSyncAt).getTime() - Date.now()) / 60_000))
    : 0

  return {
    errorMessage: syncError?.message || record.errorMessage || '',
    fuelType: record.fuelType,
    id: record.id,
    isOfficial: record.provider === PROVIDER && record.status === 'OK',
    isStale: lastFetchedAt ? Date.now() - new Date(lastFetchedAt).getTime() >= env.cne.syncIntervalMinutes * 60_000 : true,
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
    syncIntervalMinutes: env.cne.syncIntervalMinutes,
    year: record.year,
  }
}
