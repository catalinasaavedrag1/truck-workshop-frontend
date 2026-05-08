import { asyncHandler } from '../../shared/http/async-handler.js'
import { sendResponse } from '../../shared/http/send-response.js'
import { FleetHealthScoreService } from './fleet-health-score.service.js'

const service = new FleetHealthScoreService()

export const fleetHealthScoreController = {
  overview: asyncHandler(async (request, response) => {
    const overview = await service.getOverview()

    sendResponse(response, { data: overview })
  }),
  recalculate: asyncHandler(async (request, response) => {
    const actorName = request.body?.updatedBy || request.body?.actorName || 'Sistema'
    const overview = await service.recalculate(actorName)

    sendResponse(response, { data: overview })
  }),
}
