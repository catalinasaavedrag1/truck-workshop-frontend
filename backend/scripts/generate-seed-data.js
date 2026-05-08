import { randomUUID } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import * as esbuild from 'esbuild'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const tempDir = resolve(rootDir, 'backend/.generated')
const bundledSeedPath = resolve(tempDir, `frontend-mock-seed-${randomUUID()}.mjs`)
const seedDataPath = resolve(rootDir, 'backend/scripts/seed-data.js')
const seedSourcePath = resolve(rootDir, 'backend/scripts/frontend-mock-seed.source.ts')

await mkdir(tempDir, { recursive: true })

try {
  await esbuild.build({
    bundle: true,
    entryPoints: [seedSourcePath],
    format: 'esm',
    logLevel: 'silent',
    outfile: bundledSeedPath,
    platform: 'node',
    target: 'node22',
  })

  const { seedRecordsByResource } = await import(pathToFileURL(bundledSeedPath).href)
  const content = [
    '// Generated from frontend mocks. Do not edit manually.',
    '// Run `npm --prefix backend run seed:generate` after changing mock data.',
    '',
    `export const seedRecordsByResource = ${JSON.stringify(seedRecordsByResource, null, 2)}`,
    '',
  ].join('\n')

  await writeFile(seedDataPath, content, 'utf8')
  console.log(`Generated ${seedDataPath}`)
} finally {
  await rm(bundledSeedPath, { force: true })
}
