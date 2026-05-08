export type ApprovalType = 'purchase' | 'quote' | 'repair' | 'discount' | 'forced_close'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface Approval {
  id: string
  type: ApprovalType
  status: ApprovalStatus
  relatedEntityId: string
  caseId?: string
  title: string
  requestedBy: string
  approverRole: string
  amount?: number
  createdAt: string
  resolvedAt?: string
}
