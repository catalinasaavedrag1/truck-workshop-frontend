import { env } from '../src/config/env.js'
import { buildSchemaStatements } from '../src/db/schema-builder.js'
import { sql } from '../src/db/sql-client.js'

async function ensureDatabase() {
  const masterConfig = {
    ...env.sql,
    database: 'master',
  }
  const pool = await sql.connect(masterConfig)

  try {
    await pool.request().input('databaseName', sql.NVarChar(128), env.sql.database).query(`
      IF DB_ID(@databaseName) IS NULL
      BEGIN
        DECLARE @sql NVARCHAR(MAX) = N'CREATE DATABASE [' + REPLACE(@databaseName, ']', ']]') + N']';
        EXEC(@sql);
      END;
    `)
  } finally {
    await pool.close()
  }
}

async function migrate() {
  await ensureDatabase()
  const pool = await sql.connect(env.sql)

  try {
    for (const statement of buildSchemaStatements()) {
      await pool.request().query(statement)
    }

    console.log(`SQL Server schema ready in database ${env.sql.database}.`)
  } finally {
    await pool.close()
  }
}

migrate().catch((error) => {
  console.error(error)
  process.exit(1)
})
