import { asyncHandler } from '../../shared/http/async-handler.js'
import { sendResponse } from '../../shared/http/send-response.js'
import { gpsService } from './gps.service.js'

function defaultDay() {
  const now = new Date()
  const day = now.toISOString().slice(0, 10)
  return { tsStart: `${day} 00:00:00`, tsEnd: `${day} 23:59:59` }
}

export const gpsController = {
  lastPositions: asyncHandler(async (request, response) => {
    const data = await gpsService.getLastPositions()
    sendResponse(response, { data })
  }),

  history: asyncHandler(async (request, response) => {
    const fallback = defaultDay()
    const plate = String(request.query.plate || request.query.patente || '').trim()
    const tsStart = String(request.query.ts_start || request.query.tsStart || fallback.tsStart)
    const tsEnd = String(request.query.ts_end || request.query.tsEnd || fallback.tsEnd)

    const data = await gpsService.getHistory({ plate, tsStart, tsEnd })
    sendResponse(response, { data })
  }),
}
