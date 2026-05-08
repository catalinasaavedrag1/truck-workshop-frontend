import { FreightAssignmentService } from './freight-assignment.service.js'
import { asyncHandler } from '../../shared/http/async-handler.js'
import { sendResponse } from '../../shared/http/send-response.js'

const service = new FreightAssignmentService()

export const createFreightAssignment = asyncHandler(async (request, response) => {
  const assignment = await service.create(request.body, getActorName(request))

  sendResponse(response, { data: assignment }, 201)
})

export const updateFreightAssignment = asyncHandler(async (request, response) => {
  const assignment = await service.update(request.params.id, request.body, getActorName(request))

  sendResponse(response, { data: assignment })
})

export const deleteFreightAssignment = asyncHandler(async (request, response) => {
  const assignment = await service.remove(request.params.id, getActorName(request))

  sendResponse(response, { data: assignment })
})

function getActorName(request) {
  return request.get('x-user-name') || request.body.updatedBy || request.body.createdBy || request.body.assignedBy || 'Sistema'
}
