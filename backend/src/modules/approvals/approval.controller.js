import { ApprovalService } from './approval.service.js'
import { asyncHandler } from '../../shared/http/async-handler.js'
import { sendResponse } from '../../shared/http/send-response.js'

const service = new ApprovalService()

export const resolveApproval = asyncHandler(async (request, response) => {
  const approval = await service.resolve(request.params.id, request.body, getActorName(request))

  sendResponse(response, { data: approval })
})

function getActorName(request) {
  return request.get('x-user-name') || request.body.resolvedBy || request.body.approvedBy || request.body.updatedBy || 'Sistema'
}
