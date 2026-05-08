import { config } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const configDir = dirname(fileURLToPath(import.meta.url))

config({ path: resolve(configDir, '../../../.env'), quiet: true })
config({ path: resolve(configDir, '../../.env'), quiet: true })

function parseBoolean(value, fallback) {
  if (value === undefined) {
    return fallback
  }

  return ['true', '1', 'yes', 'y'].includes(String(value).toLowerCase())
}

function parseList(value, fallback) {
  if (!value) {
    return fallback
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseNumber(value, fallback) {
  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : fallback
}

function buildSqlConfig() {
  const authType = String(process.env.SQL_AUTH_TYPE || 'sql').toLowerCase()
  const options = {
    encrypt: parseBoolean(process.env.SQL_ENCRYPT, false),
    trustServerCertificate: parseBoolean(process.env.SQL_TRUST_SERVER_CERTIFICATE, true),
  }
  const baseConfig = {
    database: process.env.SQL_DATABASE || 'TruckWorkshop',
    options,
    pool: {
      idleTimeoutMillis: 30000,
      max: 10,
      min: 0,
    },
    server: process.env.SQL_SERVER || 'localhost',
  }

  if (process.env.SQL_PORT) {
    baseConfig.port = Number(process.env.SQL_PORT)
  } else if (!['trusted', 'windows-trusted'].includes(authType)) {
    baseConfig.port = 1433
  }

  if (['trusted', 'windows-trusted'].includes(authType)) {
    return {
      ...baseConfig,
      driver: 'msnodesqlv8',
      options: {
        ...options,
        trustedConnection: true,
      },
    }
  }

  if (['ntlm', 'windows', 'integrated'].includes(authType)) {
    return {
      ...baseConfig,
      authentication: {
        options: {
          domain: process.env.SQL_DOMAIN || process.env.USERDOMAIN || '',
          password: process.env.SQL_PASSWORD || '',
          userName: process.env.SQL_USER || process.env.USERNAME || '',
        },
        type: 'ntlm',
      },
    }
  }

  return {
    ...baseConfig,
    password: process.env.SQL_PASSWORD || '',
    user: process.env.SQL_USER || 'sa',
  }
}

export const env = {
  apiPrefix: process.env.API_PREFIX || '/api',
  cne: {
    apiToken: process.env.CNE_API_TOKEN || process.env.ENERGIA_ABIERTA_API_TOKEN || '',
    baseUrl: process.env.CNE_API_BASE_URL || 'https://api.cne.cl',
    defaultFuelType: process.env.CNE_DEFAULT_FUEL_TYPE || 'DIESEL',
    defaultRegionCode: process.env.CNE_DEFAULT_REGION_CODE || '13',
    fallbackDieselPricePerLiter: Math.max(0, parseNumber(process.env.CNE_FALLBACK_DIESEL_PRICE_PER_LITER, 1050)),
    fuelPricesPath: process.env.CNE_FUEL_PRICES_PATH || '/api/ea/precio/combustibleliquido',
    requestTimeoutMs: Math.max(1000, parseNumber(process.env.CNE_REQUEST_TIMEOUT_MS, 12000)),
    syncIntervalMinutes: Math.max(1, parseNumber(process.env.CNE_SYNC_INTERVAL_MINUTES, 15)),
  },
  corsOrigins: parseList(process.env.CORS_ORIGIN, [
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5181',
    'http://localhost:5181',
    'http://127.0.0.1:5183',
    'http://localhost:5183',
  ]),
  dataDriver: process.env.DATA_DRIVER || 'sqlserver',
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    country: process.env.GOOGLE_MAPS_COUNTRY || 'cl',
    language: process.env.GOOGLE_MAPS_LANGUAGE || 'es-419',
    regionCode: process.env.GOOGLE_MAPS_REGION_CODE || 'CL',
  },
  openMaps: {
    nominatimUrl: process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org',
    osrmUrl: process.env.OSRM_BASE_URL || 'https://router.project-osrm.org',
    userAgent: process.env.MAPS_USER_AGENT || 'truck-workshop-api/1.0',
  },
  jwtSecret: process.env.JWT_SECRET || 'development-only-secret',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  sql: buildSqlConfig(),
}
