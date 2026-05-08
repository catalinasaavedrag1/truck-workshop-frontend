import { httpClient } from '../../../shared/services/httpClient'
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

export async function updateFreightAssignment(assignmentId: string, payload: Partial<FreightAssignmentPayload>) {
  const response = await httpClient.patch<ApiResponse<FreightAssignment>>(`/freight/assignments/${assignmentId}`, payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export async function deleteFreightAssignment(assignmentId: string) {
  const response = await httpClient.delete<ApiResponse<FreightAssignment>>(`/freight/assignments/${assignmentId}`, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export function getCurrentActorName() {
  return getSessionUser().name
}

function getActorHeaders() {
  const user = getSessionUser()

  return {
    'x-user-id': user.id,
    'x-user-name': user.name,
  }
}

function getSessionUser() {
  if (typeof window === 'undefined') {
    return { id: 'system', name: 'Sistema' }
  }

  try {
    const session = JSON.parse(localStorage.getItem('truck-workshop-session') || '{}')

    return {
      id: session.user?.id || 'system',
      name: session.user?.name || 'Sistema',
    }
  } catch {
    return { id: 'system', name: 'Sistema' }
  }
}
