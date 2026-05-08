import { updateResource } from '../../../shared/services/resourceApi'
import type { Approval, ApprovalStatus } from '../types/approval.types'

const APPROVALS_PATH = '/approvals'

export function resolveApproval(approvalId: string, status: Extract<ApprovalStatus, 'approved' | 'rejected'>) {
  return updateResource<Approval, { status: ApprovalStatus }>(APPROVALS_PATH, approvalId, { status })
}
