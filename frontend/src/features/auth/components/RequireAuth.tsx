import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'

interface RequireAuthProps {
  children: ReactNode
}

// TEMP: bypass de login para desarrollo. Quitar antes de produccion.
const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === 'true'

export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()

  if (!BYPASS_AUTH && !hasActiveSession()) {
    return <Navigate replace state={{ from: location }} to={ROUTES.login} />
  }

  return children
}

function hasActiveSession() {
  try {
    const session = JSON.parse(localStorage.getItem('truck-workshop-session') || '{}') as { expiresAt?: string; token?: string }

    if (!session.token) {
      return false
    }

    return !session.expiresAt || new Date(session.expiresAt).getTime() > Date.now()
  } catch {
    return false
  }
}
