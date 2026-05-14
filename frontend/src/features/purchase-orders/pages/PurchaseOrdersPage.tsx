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
import { SupplyPurchaseOrderTable } from '../../warehouse/components/SupplyPurchaseOrderTable'
import styles from '../../warehouse/components/InventoryModule.module.css'
import { getProcurementPurchaseOrders } from '../../warehouse/services/procurementInsights.service'
import { purchaseOrdersMock } from '../mocks/purchaseOrders.mock'
import type { PurchaseOrder } from '../types/purchaseOrder.types'

export function PurchaseOrdersPage() {
  const { data: purchaseOrders } = useResourceList<PurchaseOrder>('/purchase-orders', purchaseOrdersMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const activeStatuses = new Set([
    'DRAFT',
    'REQUESTED',
    'PENDING_APPROVAL',
    'APPROVED',
    'ORDERED',
    'PARTIALLY_RECEIVED',
    'OVERDUE',
    'WITH_DIFFERENCE',
    'DOCUMENT_BLOCKED',
  ])
  const activePurchaseOrders = purchaseOrders.filter((order) => activeStatuses.has(order.status))
  const receivedPurchaseOrders = purchaseOrders.filter((order) => order.status === 'RECEIVED')
  const procurementOrders = getProcurementPurchaseOrders(purchaseOrders)
  const overduePurchaseOrders = procurementOrders.filter((order) => order.status === 'OVERDUE' || order.overdueDays > 0)
  const receivablePurchaseOrders = activePurchaseOrders.filter((order) =>
    ['ORDERED', 'PARTIALLY_RECEIVED', 'OVERDUE', 'WITH_DIFFERENCE'].includes(order.status),
  )
  const documentBlockedPurchaseOrders = activePurchaseOrders.filter((order) => order.status === 'DOCUMENT_BLOCKED')
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
              <Button icon={<Plus size={18} />}>Crear OC</Button>
            </Link>
          }
          description="Seguimiento de OC por proveedor, recepcion, documentos, casos que desbloquea y riesgo operacional."
          title="Ordenes de compra"
        />
        <InventoryModuleNav />
        <InventorySummaryStrip
          items={[
            { helper: 'borrador, solicitadas, aprobadas, ordenadas o bloqueadas', label: 'OC en gestion', tone: 'warning', value: activePurchaseOrders.length },
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
              description="Colas de ejecucion para entrar directo a lo que destraba recepcion, documentos y proveedores."
              title="Trabajo de hoy"
            />
            <div className={styles.actionGrid}>
              <Link className={styles.actionCard} to={`${ROUTES.purchaseOrders}?status=OVERDUE`}>
                <div className={styles.actionHeader}>
                  <strong>Reclamar atrasadas</strong>
                  <span>{overduePurchaseOrders.length} OC</span>
                </div>
                <span>Proveedor, fecha prometida y casos bloqueados.</span>
              </Link>
              <Link className={styles.actionCard} to={`${ROUTES.warehouse}?view=receipts`}>
                <div className={styles.actionHeader}>
                  <strong>Registrar recepcion</strong>
                  <span>{receivablePurchaseOrders.length} OC</span>
                </div>
                <span>Completa, parcial, diferencia o producto danado.</span>
              </Link>
              <Link className={styles.actionCard} to={`${ROUTES.warehouse}?view=documents`}>
                <div className={styles.actionHeader}>
                  <strong>Resolver documentos</strong>
                  <span>{documentBlockedPurchaseOrders.length} OC</span>
                </div>
                <span>Factura, guia, respaldo y diferencias contra recepcion.</span>
              </Link>
              <Link className={styles.actionCard} to={`${ROUTES.warehouse}?view=audit`}>
                <div className={styles.actionHeader}>
                  <strong>Auditar compra</strong>
                  <span>Riesgo</span>
                </div>
                <span>Duplicadas, caras, sin demanda o fuera de sugerencia.</span>
              </Link>
            </div>
          </div>
        </Card>
        <Card>
          <div className="stack">
            <SectionHeader
              description="Gestion diaria: seguir OC, recibir parcial, revisar documentos, reclamar proveedor o cancelar con motivo."
              title="Control operacional de OC"
            />
            <SupplyPurchaseOrderTable rows={procurementOrders} />
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
