import { createApp } from './app.js'
import { env } from './config/env.js'
import { closePool } from './db/pool.js'
import { startFuelPriceScheduler } from './modules/fuel-prices/fuel-price.scheduler.js'

const app = createApp()
const stopFuelPriceScheduler = startFuelPriceScheduler()

const server = app.listen(env.port, () => {
  console.log(`Truck Workshop API listening on http://localhost:${env.port}${env.apiPrefix}`)
})

async function shutdown(signal) {
  console.log(`${signal} received. Closing HTTP server and SQL pool.`)
  stopFuelPriceScheduler()
  server.close(async () => {
    await closePool()
    process.exit(0)
  })
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))
