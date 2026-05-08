import { asyncHandler } from '../../shared/http/async-handler.js'
import { sendResponse } from '../../shared/http/send-response.js'
import { MechanicService } from './mechanic.service.js'

const service = new MechanicService()

export const mechanicController = {
  create: asyncHandler(async (request, response) => {
    const mechanic = await service.create(request.body)

    sendResponse(response, { data: mechanic }, 201)
  }),

  get: asyncHandler(async (request, response) => {
    const mechanic = await service.get(request.params.id)

    sendResponse(response, { data: mechanic })
  }),

  list: asyncHandler(async (request, response) => {
    const result = await service.list(request.query)

    sendResponse(response, result)
  }),

  remove: asyncHandler(async (request, response) => {
    const mechanic = await service.remove(request.params.id)

    sendResponse(response, { data: mechanic })
  }),

  update: asyncHandler(async (request, response) => {
    const mechanic = await service.update(request.params.id, request.body)

    sendResponse(response, { data: mechanic })
  }),
}
