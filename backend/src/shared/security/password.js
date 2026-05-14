import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto'

const ALGORITHM = 'pbkdf2-sha256'
const DIGEST = 'sha256'
const KEY_LENGTH = 32
const DEFAULT_ITERATIONS = 210000

export function hashPassword(password, options = {}) {
  const normalizedPassword = String(password || '')
  const iterations = Math.max(Number(options.iterations || DEFAULT_ITERATIONS), 100000)
  const salt = options.salt || randomBytes(16).toString('base64url')
  const hash = pbkdf2Sync(normalizedPassword, salt, iterations, KEY_LENGTH, DIGEST).toString('base64url')

  return `${ALGORITHM}$${iterations}$${salt}$${hash}`
}

export function verifyPassword(password, storedHash) {
  if (!isPasswordHash(storedHash)) {
    return false
  }

  const [, iterationsValue, salt, expectedHash] = storedHash.split('$')
  const iterations = Number(iterationsValue)

  if (!Number.isInteger(iterations) || iterations < 100000) {
    return false
  }

  const actualHash = pbkdf2Sync(String(password || ''), salt, iterations, KEY_LENGTH, DIGEST).toString('base64url')
  const actual = Buffer.from(actualHash)
  const expected = Buffer.from(expectedHash)

  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export function isPasswordHash(value) {
  return typeof value === 'string' && value.startsWith(`${ALGORITHM}$`) && value.split('$').length === 4
}
