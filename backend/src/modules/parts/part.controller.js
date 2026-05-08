import { PartService } from './part.service.js'
import { asyncHandler } from '../../shared/http/async-handler.js'
import { sendResponse } from '../../shared/http/send-response.js'

const service = new PartService()

export const createPart = asyncHandler(async (request, response) => {
  const part = await service.create(request.body, getActorName(request))

  sendResponse(response, { data: part }, 201)
})

export const updatePart = asyncHandler(async (request, response) => {
  const part = await service.update(request.params.id, request.body, getActorName(request))

  sendResponse(response, { data: part })
})

export const deletePart = asyncHandler(async (request, response) => {
  const part = await service.remove(request.params.id, getActorName(request))

  sendResponse(response, { data: part })
})

function getActorName(request) {
  return request.get('x-user-name') || request.body.updatedBy || request.body.createdBy || 'Sistema'
}
