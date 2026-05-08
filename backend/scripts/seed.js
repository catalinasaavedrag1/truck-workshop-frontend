import { allCrudResources } from '../src/config/resources.js'
import { closePool, getPool } from '../src/db/pool.js'
import { ResourceRepository } from '../src/shared/data/resource-repository.js'
import { seedRecordsByResource } from './seed-data.js'

async function seed() {
  await getPool()

  try {
    for (const resource of allCrudResources) {
      const records = seedRecordsByResource[resource.name]

      if (!records?.length) {
        continue
      }

      const repository = new ResourceRepository(resource)
      await repository.upsertMany(records)
      console.log(`Seeded ${records.length} records into ${resource.name}.`)
    }
  } finally {
    await closePool()
  }
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
