import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { InventoryModuleNav } from '../../warehouse/components/InventoryModuleNav'
import { InventorySummaryStrip } from '../../warehouse/components/InventorySummaryStrip'
import styles from '../../warehouse/components/InventoryModule.module.css'
import { PurchaseOrderTable } from '../components/PurchaseOrderTable'
import { purchaseOrdersMock } from '../mocks/purchaseOrders.mock'
import type { PurchaseOrder } from '../types/purchaseOrder.types'

export function PurchaseOrdersPage() {
  const { data: purchaseOrders } = useResourceList<PurchaseOrder>('/purchase-orders', purchaseOrdersMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const activeStatuses = new Set(['DRAFT', 'REQUESTED', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED'])
  const activePurchaseOrders = purchaseOrders.filter((order) => activeStatuses.has(order.status))
  const receivedPurchaseOrders = purchaseOrders.filter((order) => order.status === 'RECEIVED')
  const openAmount = activePurchaseOrders.reduce((total, order) => total + order.totalEstimated, 0)
  const nextDelivery = activePurchaseOrders
    .filter((order) => order.expectedDeliveryDate)
    .sort(
      (first, second) =>
        new Date(first.expectedDeliveryDate).getTime() - new Date(second.expectedDeliveryDate).getTime(),
    )[0]

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <Link to={ROUTES.purchaseOrderNew}>
              <Button icon={<Plus size={18} />}>Nueva orden</Button>
            </Link>
          }
          description="Ordenes de compra conectadas a SKUs, proveedores, stock fisico y casos bloqueados."
          title="Compras de inventario"
        />
        <InventoryModuleNav />
        <InventorySummaryStrip
          items={[
            { helper: 'borrador, solicitadas u ordenadas', label: 'OC en gestion', tone: 'warning', value: activePurchaseOrders.length },
            { helper: 'cerradas con recepcion', label: 'Recibidas', tone: 'success', value: receivedPurchaseOrders.length },
            { helper: 'monto comprometido', label: 'Monto abierto', tone: 'info', value: formatCurrency(openAmount) },
            {
              helper: nextDelivery ? nextDelivery.supplierName : 'sin fecha pendiente',
              label: 'Proxima entrega',
              tone: nextDelivery ? 'neutral' : 'success',
              value: nextDelivery ? formatDate(nextDelivery.expectedDeliveryDate) : 'Sin pendientes',
            },
          ]}
        />
        <Card>
          <div className="stack">
            <SectionHeader
              description="Gestion diaria de compras: estado, proveedor, costo estimado y fecha esperada."
              title="Ordenes operativas"
            />
            <PurchaseOrderTable purchaseOrders={purchaseOrders} />
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
