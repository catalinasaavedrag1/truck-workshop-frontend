import { PurchaseOrderService } from './purchase-order.service.js'
import { asyncHandler } from '../../shared/http/async-handler.js'
import { sendResponse } from '../../shared/http/send-response.js'

const service = new PurchaseOrderService()

export const createPurchaseOrder = asyncHandler(async (request, response) => {
  const purchaseOrder = await service.create(request.body, getActorName(request))

  sendResponse(response, { data: purchaseOrder }, 201)
})

export const updatePurchaseOrder = asyncHandler(async (request, response) => {
  const purchaseOrder = await service.update(request.params.id, request.body, getActorName(request))

  sendResponse(response, { data: purchaseOrder })
})

export const deletePurchaseOrder = asyncHandler(async (request, response) => {
  const purchaseOrder = await service.remove(request.params.id, getActorName(request))

  sendResponse(response, { data: purchaseOrder })
})

function getActorName(request) {
  return request.get('x-user-name') || request.body.updatedBy || request.body.createdBy || request.body.requestedBy || 'Sistema'
}
