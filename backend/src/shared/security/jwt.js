import { createHmac, timingSafeEqual } from 'node:crypto'
import { AppError } from '../errors/app-error.js'

const HEADER = { alg: 'HS256', typ: 'JWT' }

export function signJwt(payload, { expiresInSeconds, secret }) {
  assertSecret(secret)

  const now = Math.floor(Date.now() / 1000)
  const normalizedPayload = {
    ...payload,
    exp: now + expiresInSeconds,
    iat: now,
  }
  const encodedHeader = base64UrlEncodeJson(HEADER)
  const encodedPayload = base64UrlEncodeJson(normalizedPayload)
  const signature = sign(`${encodedHeader}.${encodedPayload}`, secret)

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

export function verifyJwt(token, { secret }) {
  assertSecret(secret)

  const parts = String(token || '').split('.')

  if (parts.length !== 3) {
    throw new AppError('Token invalido', 401)
  }

  const [encodedHeader, encodedPayload, signature] = parts
  const expectedSignature = sign(`${encodedHeader}.${encodedPayload}`, secret)

  if (!safeEquals(signature, expectedSignature)) {
    throw new AppError('Token invalido', 401)
  }

  const header = parseBase64UrlJson(encodedHeader)
  const payload = parseBase64UrlJson(encodedPayload)

  if (header.alg !== HEADER.alg || header.typ !== HEADER.typ) {
    throw new AppError('Token invalido', 401)
  }

  const now = Math.floor(Date.now() / 1000)

  if (Number(payload.exp || 0) <= now) {
    throw new AppError('Sesion expirada', 401)
  }

  return payload
}

function assertSecret(secret) {
  if (!secret || String(secret).length < 16) {
    throw new AppError('JWT_SECRET debe tener al menos 16 caracteres', 500)
  }
}

function base64UrlEncodeJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function parseBase64UrlJson(value) {
  try {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))
  } catch {
    throw new AppError('Token invalido', 401)
  }
}

function sign(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url')
}

function safeEquals(first, second) {
  const firstBuffer = Buffer.from(first)
  const secondBuffer = Buffer.from(second)

  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer)
}
