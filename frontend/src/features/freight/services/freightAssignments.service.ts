import { httpClient } from '../../../shared/services/httpClient'
import {
  getActorHeaders,
  getCurrentActorName as resolveCurrentActorName,
} from '../../../shared/services/sessionUser'
import type { ApiResponse } from '../../../shared/types/api.types'
import type { FreightAssignment, FreightAssignmentStatus } from '../types/freight.types'

export interface FreightAssignmentPayload {
  requestId: string
  quoteId?: string
  truckId: string
  driverId: string
  assignedBy?: string
  pickupDate: string
  deliveryDate?: string
  status?: FreightAssignmentStatus
  notes?: string
}

export async function createFreightAssignment(payload: FreightAssignmentPayload) {
  const response = await httpClient.post<ApiResponse<FreightAssignment>>('/freight/assignments', payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export function getCurrentActorName() {
  return resolveCurrentActorName()
}
