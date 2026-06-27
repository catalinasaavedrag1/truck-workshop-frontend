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

function parseDurationSeconds(value, fallback) {
  if (!value) {
    return fallback
  }

  const match = String(value).trim().match(/^(\d+)([smhd])?$/i)

  if (!match) {
    return fallback
  }

  const amount = Number(match[1])
  const unit = String(match[2] || 's').toLowerCase()
  const multiplier = unit === 'd' ? 86400 : unit === 'h' ? 3600 : unit === 'm' ? 60 : 1

  return amount * multiplier
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

const nodeEnv = process.env.NODE_ENV || 'development'
const jwtSecret = process.env.JWT_SECRET || 'development-only-secret'

if (nodeEnv === 'production' && jwtSecret === 'development-only-secret') {
  throw new Error('JWT_SECRET es obligatorio en produccion')
}

export const env = {
  apiPrefix: process.env.API_PREFIX || '/api',
  auth: {
    allowDevelopmentLogin: parseBoolean(process.env.AUTH_ALLOW_DEVELOPMENT_LOGIN, nodeEnv !== 'production'),
    devLoginEmail: process.env.DEV_LOGIN_EMAIL || 'admin@truckworkshop.cl',
    devLoginPasswordHash: process.env.DEV_LOGIN_PASSWORD_HASH || '',
    enforcePermissions: parseBoolean(process.env.AUTH_ENFORCE_PERMISSIONS, nodeEnv === 'production'),
    jwtExpiresInSeconds: Math.max(60, parseDurationSeconds(process.env.JWT_EXPIRES_IN, 8 * 60 * 60)),
    requireAuth: parseBoolean(process.env.AUTH_REQUIRED, nodeEnv === 'production'),
  },
  // Precio de combustible: scraping de un sitio publico (sin token), una vez al
  // dia a la hora configurada en la zona horaria de Chile.
  scraper: {
    enabled: parseBoolean(process.env.FUEL_SCRAPER_ENABLED, true),
    url: process.env.FUEL_SCRAPER_URL || 'https://preciocombustible.cl/',
    sourceLabel: process.env.FUEL_SCRAPER_SOURCE_LABEL || 'preciocombustible.cl',
    requestTimeoutMs: Math.max(1000, parseNumber(process.env.FUEL_SCRAPER_REQUEST_TIMEOUT_MS, 12000)),
    userAgent: process.env.FUEL_SCRAPER_USER_AGENT || 'Mozilla/5.0 (compatible; TruckWorkshop/1.0)',
    // Programacion diaria: hora local (0-23) y zona horaria.
    dailyHour: Math.min(23, Math.max(0, parseNumber(process.env.FUEL_SCRAPER_DAILY_HOUR, 3))),
    timeZone: process.env.FUEL_SCRAPER_TIMEZONE || 'America/Santiago',
    // Un snapshot se considera vencido tras 24 h (cadencia diaria).
    staleAfterMinutes: Math.max(1, parseNumber(process.env.FUEL_SCRAPER_STALE_AFTER_MINUTES, 24 * 60)),
    defaultFuelType: process.env.FUEL_DEFAULT_FUEL_TYPE || 'DIESEL',
    defaultRegionCode: process.env.FUEL_DEFAULT_REGION_CODE || '13',
    fallbackDieselPricePerLiter: Math.max(0, parseNumber(process.env.FUEL_FALLBACK_DIESEL_PRICE_PER_LITER, 1050)),
  },
  // GPS / telematica DS-TMS (posicion en vivo de la flota). Tokens server-side,
  // se leen desde variables de entorno (backend/.env). Nunca hardcodear secretos.
  dsTms: {
    enabled: parseBoolean(process.env.DSTMS_ENABLED, true),
    baseUrl: process.env.DSTMS_BASE_URL || 'https://www.ds-tms.com',
    client: process.env.DSTMS_CLIENT || 'mimbral',
    lastPositionToken: process.env.DSTMS_LAST_POSITION_TOKEN || '',
    historyToken: process.env.DSTMS_HISTORY_TOKEN || '',
    requestTimeoutMs: Math.max(1000, parseNumber(process.env.DSTMS_REQUEST_TIMEOUT_MS, 15000)),
  },
  corsOrigins: parseList(process.env.CORS_ORIGIN, [
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5174',
    'http://localhost:5174',
    'http://127.0.0.1:5175',
    'http://localhost:5175',
    'http://127.0.0.1:5176',
    'http://localhost:5176',
    'http://127.0.0.1:5177',
    'http://localhost:5177',
    'http://127.0.0.1:5178',
    'http://localhost:5178',
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
  jwtSecret,
  nodeEnv,
  port: Number(process.env.PORT || 4000),
  sql: buildSqlConfig(),
}
