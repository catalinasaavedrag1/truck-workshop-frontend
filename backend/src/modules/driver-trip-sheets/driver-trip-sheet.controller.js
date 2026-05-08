import { asyncHandler } from '../../shared/http/async-handler.js'
import { sendResponse } from '../../shared/http/send-response.js'
import { DriverTripSheetService } from './driver-trip-sheet.service.js'

const service = new DriverTripSheetService()

export const driverTripSheetController = {
  create: asyncHandler(async (request, response) => {
    const sheet = await service.create(request.body, getActorName(request))

    sendResponse(response, { data: sheet }, 201)
  }),

  get: asyncHandler(async (request, response) => {
    const sheet = await service.get(request.params.id)

    sendResponse(response, { data: sheet })
  }),

  list: asyncHandler(async (request, response) => {
    const result = await service.list(request.query)

    sendResponse(response, result)
  }),

  preview: asyncHandler(async (request, response) => {
    const sheet = await service.preview(request.body, getActorName(request))

    sendResponse(response, { data: sheet })
  }),

  remove: asyncHandler(async (request, response) => {
    const sheet = await service.remove(request.params.id, getActorName(request))

    sendResponse(response, { data: sheet })
  }),

  update: asyncHandler(async (request, response) => {
    const sheet = await service.update(request.params.id, request.body, getActorName(request))

    sendResponse(response, { data: sheet })
  }),
}

function getActorName(request) {
  return request.get('x-user-name') || request.body.updatedBy || request.body.createdBy || 'Sistema'
}
