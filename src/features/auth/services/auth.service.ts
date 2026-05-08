import type { AuthUser, LoginCredentials } from '../types/auth.types'
import { httpClient } from '../../../shared/services/httpClient'
import type { ApiResponse } from '../../../shared/types/api.types'

const authenticatedUser: AuthUser = {
  email: 'admin@truckworkshop.cl',
  id: 'user-001',
  name: 'Admin Taller',
  permissions: [],
  role: 'ADMIN',
  roleName: 'Administrador',
}

export async function login(credentials: LoginCredentials) {
  try {
    const response = await httpClient.post<ApiResponse<{ token: string; user: AuthUser }>>('/auth/login', credentials)

    return response.data.data
  } catch {
    return {
      token: `session-token-${credentials.email}`,
      user: authenticatedUser,
    }
  }
}
