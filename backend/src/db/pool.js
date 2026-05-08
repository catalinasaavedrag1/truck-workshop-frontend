import { env } from '../config/env.js'
import { sql } from './sql-client.js'

let poolPromise

export function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(env.sql)
  }

  return poolPromise
}

export async function closePool() {
  if (!poolPromise) {
    return
  }

  const pool = await poolPromise
  await pool.close()
  poolPromise = undefined
}

export { sql }
