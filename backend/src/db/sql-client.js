import tediousSql from 'mssql'
import msnodesqlv8Sql from 'mssql/msnodesqlv8.js'
import { env } from '../config/env.js'

export const sql = env.sql.driver === 'msnodesqlv8' ? msnodesqlv8Sql : tediousSql
