import { httpClient } from '../../../shared/services/httpClient'
import { getActorHeaders, getCurrentActorName as resolveCurrentActorName } from '../../../shared/services/sessionUser'
import type { ApiResponse, PaginatedApiResponse } from '../../../shared/types/api.types'
import type { Diagnostic } from '../types/diagnostic.types'

export type DiagnosticPayload = Omit<Diagnostic, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'deletedBy'>

export async function listDiagnosticsByCase(caseId: string) {
  const response = await httpClient.get<PaginatedApiResponse<Diagnostic>>('/diagnostics', {
    params: {
      caseId,
      limit: 20,
      order: 'desc',
      sort: 'createdAt',
    },
  })

  return response.data.data
}

export async function saveDiagnostic(payload: DiagnosticPayload) {
  const response = await httpClient.post<ApiResponse<Diagnostic>>('/diagnostics', payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export async function updateDiagnostic(id: string, payload: Partial<DiagnosticPayload>) {
  const response = await httpClient.patch<ApiResponse<Diagnostic>>(`/diagnostics/${id}`, payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export async function deleteDiagnostic(id: string) {
  const response = await httpClient.delete<ApiResponse<Diagnostic>>(`/diagnostics/${id}`, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export function getCurrentActorName() {
  return resolveCurrentActorName()
}
