import { QuoteService } from './quote.service.js'
import { asyncHandler } from '../../shared/http/async-handler.js'
import { sendResponse } from '../../shared/http/send-response.js'

const service = new QuoteService()

export const createQuote = asyncHandler(async (request, response) => {
  const quote = await service.create(request.body, getActorName(request))

  sendResponse(response, { data: quote }, 201)
})

export const updateQuote = asyncHandler(async (request, response) => {
  const quote = await service.update(request.params.id, request.body, getActorName(request))

  sendResponse(response, { data: quote })
})

export const deleteQuote = asyncHandler(async (request, response) => {
  const quote = await service.remove(request.params.id)

  sendResponse(response, { data: quote })
})

function getActorName(request) {
  return request.get('x-user-name') || request.body.updatedBy || request.body.createdBy || request.body.approvedBy || 'Sistema'
}
