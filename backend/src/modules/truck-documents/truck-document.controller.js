import { TruckDocumentService } from './truck-document.service.js'
import { asyncHandler } from '../../shared/http/async-handler.js'
import { sendResponse } from '../../shared/http/send-response.js'

const service = new TruckDocumentService()

export const createTruckDocument = asyncHandler(async (request, response) => {
  const document = await service.create(request.body, getActorName(request))

  sendResponse(response, { data: document }, 201)
})

export const updateTruckDocument = asyncHandler(async (request, response) => {
  const document = await service.update(request.params.id, request.body, getActorName(request))

  sendResponse(response, { data: document })
})

export const deleteTruckDocument = asyncHandler(async (request, response) => {
  const document = await service.remove(request.params.id, getActorName(request))

  sendResponse(response, { data: document })
})

function getActorName(request) {
  return request.get('x-user-name') || request.body.updatedBy || request.body.createdBy || 'Sistema'
}
