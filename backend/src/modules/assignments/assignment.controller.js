import { AssignmentService } from './assignment.service.js'
import { asyncHandler } from '../../shared/http/async-handler.js'
import { sendResponse } from '../../shared/http/send-response.js'

const service = new AssignmentService()

export const listAssignments = asyncHandler(async (request, response) => {
  sendResponse(response, await service.list(request.query))
})

export const createAssignment = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await service.create(request.body) }, 201)
})
