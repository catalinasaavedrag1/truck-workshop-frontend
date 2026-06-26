import tediousSql from 'mssql'
import { env } from '../config/env.js'

// El driver msnodesqlv8 es un modulo nativo solo necesario para conexiones
// Windows (trusted). Se importa de forma perezosa para que el backend pueda
// arrancar en entornos Linux/serverless (o en modo memoria) sin compilarlo.
async function resolveSqlClient() {
  if (env.sql.driver === 'msnodesqlv8') {
    const module = await import('mssql/msnodesqlv8.js')
    return module.default
  }

  return tediousSql
}

export const sql = await resolveSqlClient()
