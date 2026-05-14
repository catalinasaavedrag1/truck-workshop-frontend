import type { AuthSession, LoginCredentials } from '../types/auth.types'
import { httpClient } from '../../../shared/services/httpClient'
import type { ApiResponse } from '../../../shared/types/api.types'

export async function login(credentials: LoginCredentials) {
  const response = await httpClient.post<ApiResponse<AuthSession>>('/auth/login', credentials)

  return response.data.data
}
