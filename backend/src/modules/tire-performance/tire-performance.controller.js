import { TirePerformanceService } from './tire-performance.service.js'
import { asyncHandler } from '../../shared/http/async-handler.js'
import { getActorName } from '../../shared/http/request-actor.js'
import { sendResponse } from '../../shared/http/send-response.js'

const service = new TirePerformanceService()

export const createTireLifecycle = asyncHandler(async (request, response) => {
  const tire = await service.create(request.body, getActorName(request, ['updatedBy', 'createdBy']))

  sendResponse(response, { data: tire }, 201)
})

export const intakeTireLifecycles = asyncHandler(async (request, response) => {
  const tires = await service.intake(request.body, getActorName(request, ['updatedBy', 'createdBy']))

  sendResponse(response, { data: tires }, 201)
})

export const installTireLifecycle = asyncHandler(async (request, response) => {
  const tire = await service.install(request.params.id, request.body, getActorName(request, ['updatedBy', 'createdBy']))

  sendResponse(response, { data: tire })
})

export const removeTireLifecycle = asyncHandler(async (request, response) => {
  const tire = await service.remove(request.params.id, request.body, getActorName(request, ['updatedBy', 'createdBy']))

  sendResponse(response, { data: tire })
})

export const updateTireLifecycle = asyncHandler(async (request, response) => {
  const tire = await service.update(request.params.id, request.body, getActorName(request, ['updatedBy', 'createdBy']))

  sendResponse(response, { data: tire })
})

export const deleteTireLifecycle = asyncHandler(async (request, response) => {
  const tire = await service.removeRecord(request.params.id, getActorName(request, ['updatedBy', 'createdBy']))

  sendResponse(response, { data: tire })
})
