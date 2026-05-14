import { httpClient } from '../../../shared/services/httpClient'
import type { ApiResponse } from '../../../shared/types/api.types'
import type { Assignment } from '../types/assignment.types'

export async function assignCase(payload: Assignment) {
  const response = await httpClient.post<ApiResponse<Assignment>>('/assignments', payload)

  return response.data.data
}
