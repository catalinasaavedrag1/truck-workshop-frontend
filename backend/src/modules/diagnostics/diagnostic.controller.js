import { DiagnosticService } from './diagnostic.service.js'
import { asyncHandler } from '../../shared/http/async-handler.js'
import { sendResponse } from '../../shared/http/send-response.js'

const service = new DiagnosticService()

export const createDiagnostic = asyncHandler(async (request, response) => {
  const diagnostic = await service.create(request.body, getActorName(request))

  sendResponse(response, { data: diagnostic }, 201)
})

export const updateDiagnostic = asyncHandler(async (request, response) => {
  const diagnostic = await service.update(request.params.id, request.body, getActorName(request))

  sendResponse(response, { data: diagnostic })
})

export const deleteDiagnostic = asyncHandler(async (request, response) => {
  const diagnostic = await service.remove(request.params.id, getActorName(request))

  sendResponse(response, { data: diagnostic })
})

function getActorName(request) {
  return request.get('x-user-name') || request.body.updatedBy || request.body.createdBy || 'Sistema'
}
