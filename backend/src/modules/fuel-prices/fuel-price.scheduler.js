import { env } from '../../config/env.js'
import { fuelPriceService } from './fuel-price.service.js'

/**
 * Programa el scraping del precio de combustible una vez al dia a la hora
 * configurada (por defecto 06:00 hora de Chile). Tambien hace una corrida al
 * arrancar para no quedar con el fallback hasta el primer disparo diario.
 */
export function startFuelPriceScheduler() {
  if (env.nodeEnv === 'test') {
    return () => {}
  }

  let timeoutHandle

  const run = () => {
    fuelPriceService
      .getCurrentPrice()
      .then((snapshot) => {
        console.log(
          `Fuel price ready: ${snapshot.pricePerLiter} CLP/L via ${snapshot.provider} (${snapshot.status}).`,
        )
      })
      .catch((error) => {
        console.warn(`Fuel price refresh failed: ${error.message}`)
      })
  }

  const scheduleNext = () => {
    const delay = msUntilNextDailyRun(env.scraper.dailyHour, env.scraper.timeZone)
    timeoutHandle = setTimeout(() => {
      run()
      scheduleNext()
    }, delay)
    // setTimeout mantiene vivo el proceso; no es necesario en un servidor, pero
    // evitamos que bloquee un eventual cierre limpio en entornos de test/CLI.
    timeoutHandle?.unref?.()
  }

  // Calienta el cache al arrancar y luego dispara cada dia a la hora indicada.
  run()
  scheduleNext()

  return () => clearTimeout(timeoutHandle)
}

/**
 * Milisegundos hasta la proxima ocurrencia de `hour:00` en la zona horaria dada.
 * Lee la hora de pared actual en esa zona (via Intl), por lo que el horario de
 * verano de Chile queda contemplado automaticamente.
 */
export function msUntilNextDailyRun(hour, timeZone) {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(now)

  const read = (type) => Number(parts.find((part) => part.type === type)?.value ?? 0)
  // Intl puede devolver "24" para la medianoche en algunos entornos.
  const currentHour = read('hour') % 24
  const secondsNow = currentHour * 3600 + read('minute') * 60 + read('second')
  const targetSeconds = hour * 3600

  let deltaSeconds = targetSeconds - secondsNow

  if (deltaSeconds <= 0) {
    deltaSeconds += 24 * 3600
  }

  return deltaSeconds * 1000
}
