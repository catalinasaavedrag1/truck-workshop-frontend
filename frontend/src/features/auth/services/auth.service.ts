import type { AuthSession, LoginCredentials } from '../types/auth.types'
import { httpClient } from '../../../shared/services/httpClient'
import type { ApiResponse } from '../../../shared/types/api.types'

// Autenticacion demo para despliegues sin backend (ej. GitHub Pages). Permite
// iniciar sesion con credenciales de demostracion cuando la API no responde.
const DEMO_AUTH = import.meta.env.VITE_DEMO_AUTH === 'true'

interface DemoAccount {
  email: string
  password: string
  user: AuthSession['user']
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'admin',
    password: '1234',
    user: {
      id: 'user-fernando-gonzalez',
      name: 'Fernando González',
      email: 'admin',
      role: 'ADMIN',
      roleName: 'Administrador',
      permissions: ['*'],
    },
  },
]

function resolveDemoSession(credentials: LoginCredentials): AuthSession | null {
  const email = String(credentials.email || '').trim().toLowerCase()
  const account = DEMO_ACCOUNTS.find((item) => item.email === email && item.password === credentials.password)

  if (!account) {
    return null
  }

  return {
    token: `demo-${account.user.id}`,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    user: account.user,
  }
}

export async function login(credentials: LoginCredentials) {
  try {
    const response = await httpClient.post<ApiResponse<AuthSession>>('/auth/login', credentials)

    return response.data.data
  } catch (error) {
    // Sin backend (demo publico): aceptamos las credenciales de demostracion.
    if (DEMO_AUTH) {
      const demoSession = resolveDemoSession(credentials)

      if (demoSession) {
        return demoSession
      }
    }

    throw error
  }
}

export const isDemoAuthEnabled = DEMO_AUTH
