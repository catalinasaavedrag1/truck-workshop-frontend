import { partsMock } from '../../../mocks/parts.mock'
import { httpClient } from '../../../shared/services/httpClient'
import { getResourceById, listResource } from '../../../shared/services/resourceApi'
import { getActorHeaders } from '../../../shared/services/sessionUser'
import type { ApiResponse } from '../../../shared/types/api.types'
import type { Part } from '../types/part.types'

export async function getParts() {
  return listResource<Part>('/parts', partsMock, { sort: 'sku', order: 'asc' })
}

export async function getPartById(partId: string) {
  return getResourceById<Part>('/parts', partId, partsMock)
}

export type PartPayload = Omit<Part, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'deletedBy'>

export async function createPart(payload: PartPayload) {
  const response = await httpClient.post<ApiResponse<Part>>('/parts', payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export async function updatePart(partId: string, payload: PartPayload) {
  const response = await httpClient.patch<ApiResponse<Part>>(`/parts/${partId}`, payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export async function deletePart(partId: string) {
  const response = await httpClient.delete<ApiResponse<Part>>(`/parts/${partId}`, {
    headers: getActorHeaders(),
  })

  return response.data.data
}
