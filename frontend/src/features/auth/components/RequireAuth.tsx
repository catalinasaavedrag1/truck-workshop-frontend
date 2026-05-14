import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'

interface RequireAuthProps {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()

  if (!hasActiveSession()) {
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
