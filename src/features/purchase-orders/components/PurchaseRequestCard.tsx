import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import type { PurchaseRequest } from '../types/purchaseOrder.types'

interface PurchaseRequestCardProps {
  request: PurchaseRequest
}

export function PurchaseRequestCard({ request }: PurchaseRequestCardProps) {
  return (
    <div className="surface-panel">
      <div className="stack">
        <div className="split-row">
          <div>
            <strong>{request.name}</strong>
            <p className="muted-text">
              {request.sku} - cantidad {request.quantity}
            </p>
          </div>
          <Badge tone={request.status === 'open' ? 'warning' : 'info'}>{request.status.replaceAll('_', ' ')}</Badge>
        </div>
        <p className="muted-text">Solicitado por {request.requestedBy}</p>
        {request.purchaseOrderId ? (
          <Link to={ROUTES.purchaseOrderDetail(request.purchaseOrderId)}>
            <Button size="sm" variant="secondary">
              Ver orden
            </Button>
          </Link>
        ) : (
          <Link to={ROUTES.purchaseOrderNew}>
            <Button size="sm" variant="secondary">
              Crear orden
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
