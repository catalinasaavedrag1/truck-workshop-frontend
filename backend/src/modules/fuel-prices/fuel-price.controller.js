import { asyncHandler } from '../../shared/http/async-handler.js'
import { getActorName } from '../../shared/http/request-actor.js'
import { sendResponse } from '../../shared/http/send-response.js'
import { fuelPriceService } from './fuel-price.service.js'

export const fuelPriceController = {
  current: asyncHandler(async (request, response) => {
    const snapshot = await fuelPriceService.getCurrentPrice({
      fuelType: request.query.fuelType,
      regionCode: request.query.regionCode,
    })

    sendResponse(response, { data: snapshot })
  }),

  history: asyncHandler(async (request, response) => {
    const result = await fuelPriceService.listHistory(request.query)

    sendResponse(response, { data: result.data, meta: result.meta })
  }),

  sync: asyncHandler(async (request, response) => {
    const result = await fuelPriceService.sync({
      actorName: getActorName(request, ['updatedBy', 'createdBy']),
      force: true,
    })

    sendResponse(response, { data: result })
  }),
}
