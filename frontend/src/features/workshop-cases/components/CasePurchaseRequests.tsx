import { purchaseOrdersMock, purchaseRequestsMock } from '../../purchase-orders/mocks/purchaseOrders.mock'
import { PurchaseOrderTable } from '../../purchase-orders/components/PurchaseOrderTable'
import { PurchaseRequestCard } from '../../purchase-orders/components/PurchaseRequestCard'
import { Card } from '../../../shared/components/Card/Card'
import type { WorkshopCase } from '../types/workshopCase.types'

interface CasePurchaseRequestsProps {
  workshopCase: WorkshopCase
}

export function CasePurchaseRequests({ workshopCase }: CasePurchaseRequestsProps) {
  const requests = purchaseRequestsMock.filter((request) => request.caseId === workshopCase.id)
  const orders = purchaseOrdersMock.filter((order) => order.relatedCaseId === workshopCase.id)

  return (
    <Card>
      <div className="stack">
        <h2 className="section-title">Solicitudes y ordenes de compra</h2>
        {requests.length > 0 ? (
          <div className="three-column-grid">
            {requests.map((request) => (
              <PurchaseRequestCard key={request.id} request={request} />
            ))}
          </div>
        ) : (
          <p className="muted-text">Sin solicitudes de compra asociadas.</p>
        )}
        <PurchaseOrderTable purchaseOrders={orders} />
      </div>
    </Card>
  )
}
