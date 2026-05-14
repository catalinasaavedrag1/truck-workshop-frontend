import { useParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { EntityLink } from '../../../shared/components/EntityLink'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceItem } from '../../../shared/hooks/useResourceItem'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { InventoryModuleNav } from '../../warehouse/components/InventoryModuleNav'
import styles from '../../warehouse/components/InventoryModule.module.css'
import { PurchaseOrderItemsTable } from '../components/PurchaseOrderItemsTable'
import { PurchaseOrderStatusBadge } from '../components/PurchaseOrderStatusBadge'
import { purchaseOrdersMock } from '../mocks/purchaseOrders.mock'
import type { PurchaseOrder } from '../types/purchaseOrder.types'

export function PurchaseOrderDetailPage() {
  const { purchaseOrderId } = useParams()
  const { data: purchaseOrder } = useResourceItem<PurchaseOrder>('/purchase-orders', purchaseOrderId, purchaseOrdersMock)

  if (!purchaseOrder) {
    return (
      <PageContainer>
        <EmptyState
          description="Revisa el identificador o vuelve al listado de ordenes."
          icon={<AlertCircle size={22} />}
          title="Orden no encontrada"
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader description={purchaseOrder.supplierName} title={purchaseOrder.purchaseOrderNumber} />
        <InventoryModuleNav />
        <div className="two-column-grid">
          <div className="stack">
            <Card>
              <PurchaseOrderItemsTable items={purchaseOrder.items} />
            </Card>
          </div>
          <Card>
            <dl className="detail-list">
              <div>
                <dt>Estado</dt>
                <dd>
                  <PurchaseOrderStatusBadge status={purchaseOrder.status} />
                </dd>
              </div>
              <div>
                <dt>Caso</dt>
                <dd>
                  {purchaseOrder.relatedCaseId ? (
                    <EntityLink id={purchaseOrder.relatedCaseId} type="case">
                      {purchaseOrder.relatedCaseId}
                    </EntityLink>
                  ) : (
                    'Sin caso'
                  )}
                </dd>
              </div>
              <div>
                <dt>Solicitado por</dt>
                <dd>{purchaseOrder.requestedBy}</dd>
              </div>
              <div>
                <dt>Aprobado por</dt>
                <dd>{purchaseOrder.approvedBy || 'Pendiente'}</dd>
              </div>
              <div>
                <dt>Entrega esperada</dt>
                <dd>{formatDate(purchaseOrder.expectedDeliveryDate)}</dd>
              </div>
              <div>
                <dt>Total estimado</dt>
                <dd>{formatCurrency(purchaseOrder.totalEstimated)}</dd>
              </div>
              <div>
                <dt>Creado por</dt>
                <dd>
                  {purchaseOrder.createdBy || purchaseOrder.requestedBy || 'Sistema'}
                  {purchaseOrder.createdAt ? ` - ${formatDate(purchaseOrder.createdAt)}` : ''}
                </dd>
              </div>
              <div>
                <dt>Ultima modificacion</dt>
                <dd>
                  {purchaseOrder.updatedBy || purchaseOrder.createdBy || 'Sistema'}
                  {purchaseOrder.updatedAt ? ` - ${formatDate(purchaseOrder.updatedAt)}` : ''}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
