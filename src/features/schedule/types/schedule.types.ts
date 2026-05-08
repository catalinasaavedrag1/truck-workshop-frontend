import type { WorkshopCasePriority } from '../../workshop-cases/types/workshopCase.types'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import type { SlaStatus } from '../../sla/types/sla.types'

export type ScheduleEventStatus = 'scheduled' | 'in_progress' | 'waiting_parts' | 'done' | 'blocked'

export type ScheduleViewMode = 'day' | 'week'

export interface ScheduleEvent {
  id: string
  caseId: string
  caseNumber: string
  title: string
  customerName: string
  truckPlate: string
  date: string
  startsAt: string
  endsAt: string
  estimatedHours: number
  priority: WorkshopCasePriority
  slaStatus: SlaStatus
  hasPartsBlock: boolean
  mechanicId: string
  mechanicName: string
  bayId: string
  bayName: string
  status: ScheduleEventStatus
}

export interface WaitingQueueItem {
  id: string
  caseId: string
  caseNumber: string
  customerName: string
  priority: WorkshopCasePriority
  truckPlate: string
  slaStatus: SlaStatus
  hasPartsBlock: boolean
  requestedAt: string
  reason: string
  estimatedHours: number
}

export interface ScheduleFilters {
  date: string
  bayId: string
  mechanicId: string
  status: ScheduleEventStatus | 'all'
  query: string
  viewMode: ScheduleViewMode
}

export interface SchedulePlanRequest {
  caseId: string
  queueItemId?: string
  date: string
  startsAt: string
  estimatedHours: number
  bayId: string
  mechanicId: string
}

export interface SchedulePlanResponse {
  scheduleEvent: ScheduleEvent
  workshopCase: WorkshopCase
  removedQueueItem?: WaitingQueueItem | null
}
