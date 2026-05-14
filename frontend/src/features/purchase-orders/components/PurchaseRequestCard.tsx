import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { EntityLink } from '../../../shared/components/EntityLink'
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
            <EntityLink id={request.partId} type="part">
              {request.name}
            </EntityLink>
            <p className="muted-text">
              {request.sku} - cantidad {request.quantity}
            </p>
          </div>
          <Badge tone={request.status === 'open' ? 'warning' : 'info'}>{request.status.replaceAll('_', ' ')}</Badge>
        </div>
        <p className="muted-text">Solicitado por {request.requestedBy}</p>
        <p className="muted-text">
          Caso{' '}
          <EntityLink id={request.caseId} type="case" variant="subtle">
            {request.caseId}
          </EntityLink>
        </p>
        {request.purchaseOrderId ? (
          <Link to={ROUTES.purchaseOrderDetail(request.purchaseOrderId)}>
            <Button size="sm" variant="secondary">
              Trazabilidad OC
            </Button>
          </Link>
        ) : (
          <Link to={ROUTES.purchaseOrderNew}>
            <Button size="sm" variant="secondary">
              Convertir en OC
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
