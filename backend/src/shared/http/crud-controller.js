import { asyncHandler } from './async-handler.js'
import { sendResponse } from './send-response.js'

export function createCrudController(service) {
  return {
    create: asyncHandler(async (request, response) => {
      const record = await service.create(request.body)
      sendResponse(response, { data: record }, 201)
    }),
    get: asyncHandler(async (request, response) => {
      const record = await service.get(request.params.id)
      sendResponse(response, { data: record })
    }),
    list: asyncHandler(async (request, response) => {
      const result = await service.list(request.query)
      sendResponse(response, result)
    }),
    remove: asyncHandler(async (request, response) => {
      const record = await service.remove(request.params.id)
      sendResponse(response, { data: record })
    }),
    update: asyncHandler(async (request, response) => {
      const record = await service.update(request.params.id, request.body)
      sendResponse(response, { data: record })
    }),
  }
}
