import { createResource, updateResource } from '../../../shared/services/resourceApi'
import type { Quote, QuotePayload, QuoteStatus } from '../types/quote.types'

const QUOTES_PATH = '/quotes'

export function createWorkshopQuote(payload: QuotePayload) {
  return createResource<Quote, QuotePayload>(QUOTES_PATH, payload)
}

export function updateWorkshopQuote(quoteId: string, payload: Partial<Quote>) {
  return updateResource<Quote, Partial<Quote>>(QUOTES_PATH, quoteId, payload)
}

export function changeWorkshopQuoteStatus(quote: Quote, status: QuoteStatus, approvedBy?: string) {
  return updateWorkshopQuote(quote.id, {
    approvedBy,
    status,
  })
}
