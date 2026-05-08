import { env } from '../../config/env.js'
import { fuelPriceService } from './fuel-price.service.js'

export function startFuelPriceScheduler() {
  if (env.nodeEnv === 'test') {
    return () => {}
  }

  const intervalMs = env.cne.syncIntervalMinutes * 60_000

  const run = () => {
    fuelPriceService.syncIfDue()
      .then((result) => {
        if (!result?.skipped) {
          console.log(`CNE fuel prices synced: ${result.total} records.`)
        }
      })
      .catch((error) => {
        console.warn(`CNE fuel price sync skipped: ${error.message}`)
      })
  }

  run()
  const handle = setInterval(run, intervalMs)

  return () => clearInterval(handle)
}
