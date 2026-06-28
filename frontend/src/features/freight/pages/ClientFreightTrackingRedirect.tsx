import { Navigate, useParams } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'

/**
 * Redirige el esquema antiguo /portal/freight/tracking/:trackingNumber al
 * canonico /freight/client-portal/tracking/:trackingNumber conservando el
 * numero de seguimiento.
 */
export function ClientFreightTrackingRedirect() {
  const { trackingNumber } = useParams()

  return <Navigate replace to={ROUTES.freightClientPortalTracking(trackingNumber)} />
}
