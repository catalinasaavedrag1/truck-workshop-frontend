import { WorkshopCaseService } from './workshop-case.service.js'
import { asyncHandler } from '../../shared/http/async-handler.js'
import { getActorName } from '../../shared/http/request-actor.js'
import { sendResponse } from '../../shared/http/send-response.js'

const service = new WorkshopCaseService()

export const listWorkshopCases = asyncHandler(async (request, response) => {
  sendResponse(response, await service.list(request.query))
})

export const getWorkshopCase = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await service.get(request.params.id) })
})

export const createWorkshopCase = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await service.create(request.body, getActorName(request)) }, 201)
})

export const updateWorkshopCase = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await service.update(request.params.id, request.body) })
})

export const deleteWorkshopCase = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await service.remove(request.params.id) })
})

export const listEscalations = asyncHandler(async (request, response) => {
  sendResponse(response, await service.listEscalations(request.params.id))
})

export const escalateWorkshopCase = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await service.escalate(request.params.id, request.body) }, 201)
})

export const assignWorkshopCase = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await service.assign(request.params.id, request.body) }, 201)
})

export const closeWorkshopCase = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await service.close(request.params.id, request.body, getActorName(request)) })
})
