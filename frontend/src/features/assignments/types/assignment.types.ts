export type AssignmentStatus = 'queued' | 'active' | 'paused' | 'completed'

export interface Assignment {
  id: string
  caseId: string
  caseCode: string
  mechanicId: string
  mechanicName: string
  status: AssignmentStatus
  assignedAt: string
}
