import { WarehouseLocationService } from './warehouse-location.service.js'
import { asyncHandler } from '../../shared/http/async-handler.js'
import { sendResponse } from '../../shared/http/send-response.js'

const service = new WarehouseLocationService()

export const createWarehouseLocation = asyncHandler(async (request, response) => {
  const location = await service.create(request.body, getActorName(request))

  sendResponse(response, { data: location }, 201)
})

export const updateWarehouseLocation = asyncHandler(async (request, response) => {
  const location = await service.update(request.params.id, request.body, getActorName(request))

  sendResponse(response, { data: location })
})

export const deleteWarehouseLocation = asyncHandler(async (request, response) => {
  const location = await service.remove(request.params.id, getActorName(request))

  sendResponse(response, { data: location })
})

function getActorName(request) {
  return request.get('x-user-name') || request.body.updatedBy || request.body.createdBy || 'Sistema'
}
