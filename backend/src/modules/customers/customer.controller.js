import { CustomerService } from './customer.service.js'
import { asyncHandler } from '../../shared/http/async-handler.js'
import { sendResponse } from '../../shared/http/send-response.js'

const service = new CustomerService()

export const customerController = {
  create: asyncHandler(async (request, response) => {
    const customer = await service.create(request.body, getActorName(request))

    sendResponse(response, { data: customer }, 201)
  }),

  get: asyncHandler(async (request, response) => {
    const customer = await service.get(request.params.id)

    sendResponse(response, { data: customer })
  }),

  list: asyncHandler(async (request, response) => {
    const result = await service.list(request.query)

    sendResponse(response, result)
  }),

  remove: asyncHandler(async (request, response) => {
    const customer = await service.remove(request.params.id, getActorName(request))

    sendResponse(response, { data: customer })
  }),

  update: asyncHandler(async (request, response) => {
    const customer = await service.update(request.params.id, request.body, getActorName(request))

    sendResponse(response, { data: customer })
  }),
}

function getActorName(request) {
  return request.get('x-user-name') || request.body.updatedBy || request.body.createdBy || 'Sistema'
}
