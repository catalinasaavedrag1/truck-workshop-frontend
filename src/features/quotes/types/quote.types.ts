export type QuoteStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED'

export type QuoteLineType = 'part' | 'labor' | 'discount'

export interface QuoteLineItem {
  id: string
  type: QuoteLineType
  description: string
  quantity: number
  unitPrice: number
}

export interface Quote {
  id: string
  quoteNumber: string
  caseId: string
  caseNumber: string
  customerName: string
  diagnosisSummary: string
  status: QuoteStatus
  items: QuoteLineItem[]
  total: number
  createdAt: string
  expiresAt: string
  approvedBy?: string
  updatedAt?: string
}

export interface QuotePayload {
  caseId: string
  caseNumber?: string
  customerName?: string
  diagnosisSummary: string
  status?: QuoteStatus
  items: Array<Omit<QuoteLineItem, 'id'>>
  expiresAt?: string
}
