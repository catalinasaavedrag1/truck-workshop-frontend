import { SupplierService } from './supplier.service.js'
import { asyncHandler } from '../../shared/http/async-handler.js'
import { sendResponse } from '../../shared/http/send-response.js'

const service = new SupplierService()

export const createSupplier = asyncHandler(async (request, response) => {
  const supplier = await service.create(request.body, getActorName(request))

  sendResponse(response, { data: supplier }, 201)
})

export const updateSupplier = asyncHandler(async (request, response) => {
  const supplier = await service.update(request.params.id, request.body, getActorName(request))

  sendResponse(response, { data: supplier })
})

export const deleteSupplier = asyncHandler(async (request, response) => {
  const supplier = await service.remove(request.params.id, getActorName(request))

  sendResponse(response, { data: supplier })
})

function getActorName(request) {
  return request.get('x-user-name') || request.body.updatedBy || request.body.createdBy || 'Sistema'
}
