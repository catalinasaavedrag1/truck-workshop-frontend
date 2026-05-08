import { asyncHandler } from '../../shared/http/async-handler.js'
import { sendResponse } from '../../shared/http/send-response.js'
import { FreightPricingService } from './freight-pricing.service.js'

const service = new FreightPricingService()

export const freightPricingController = {
  activeSettings: asyncHandler(async (_request, response) => {
    const settings = await service.getActiveSettings()

    sendResponse(response, { data: settings })
  }),

  calculate: asyncHandler(async (request, response) => {
    const calculation = await service.calculate(request.body)

    sendResponse(response, { data: calculation })
  }),

  updateActiveSettings: asyncHandler(async (request, response) => {
    const settings = await service.updateActiveSettings(request.body, getActorName(request))

    sendResponse(response, { data: settings })
  }),
}

function getActorName(request) {
  return request.get('x-user-name') || request.body.updatedBy || request.body.createdBy || 'Sistema'
}
