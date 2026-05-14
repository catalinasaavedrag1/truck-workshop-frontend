import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { partsMock } from '../../../mocks/parts.mock'
import { Button } from '../../../shared/components/Button/Button'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { purchaseOrdersMock } from '../../purchase-orders/mocks/purchaseOrders.mock'
import type { PurchaseOrder, PurchaseRequest } from '../../purchase-orders/types/purchaseOrder.types'
import { purchaseRequestsMock } from '../../purchase-orders/mocks/purchaseOrders.mock'
import type { Part } from '../../parts/types/part.types'
import { suppliersMock } from '../../suppliers/mocks/suppliers.mock'
import type { Supplier } from '../../suppliers/types/supplier.types'
import { InventoryModuleNav } from '../components/InventoryModuleNav'
import styles from '../components/InventoryModule.module.css'
import { ProcurementCommandCenter } from '../components/ProcurementCommandCenter'
import { warehouseStockMock } from '../mocks/warehouse.mock'
import type { WarehouseStockItem } from '../types/warehouse.types'

export function WarehouseDashboardPage() {
  const { data: purchaseOrders, isLoading } = useResourceList<PurchaseOrder>('/purchase-orders', purchaseOrdersMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: purchaseRequests, isLoading: requestsLoading } = useResourceList<PurchaseRequest>(
    '/purchase-requests',
    purchaseRequestsMock,
    { order: 'desc', sort: 'createdAt' },
  )
  const { data: suppliers, isLoading: suppliersLoading } = useResourceList<Supplier>('/suppliers', suppliersMock, {
    order: 'asc',
    sort: 'name',
  })
  const { data: parts, isLoading: partsLoading } = useResourceList<Part>('/parts', partsMock, { order: 'asc', sort: 'sku' })
  const { data: stockItems, isLoading: stockLoading } = useResourceList<WarehouseStockItem>('/warehouse/stock', warehouseStockMock, {
    order: 'asc',
    sort: 'sku',
  })

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <div className="inline-actions">
              <Link to={`${ROUTES.warehouse}?view=suggestions`}>
                <Button size="sm" variant="secondary">
                  Reposicion
                </Button>
              </Link>
              <Link to={`${ROUTES.warehouse}?view=receipts`}>
                <Button size="sm" variant="secondary">
                  Recepcion
                </Button>
              </Link>
              <Link to={ROUTES.purchaseOrderNew}>
                <Button size="sm" variant="primary">
                  Crear OC
                </Button>
              </Link>
              <Link to={ROUTES.inventoryReport}>
                <Button size="sm" variant="secondary">
                  Reportes
                </Button>
              </Link>
            </div>
          }
          description="Decision, ejecucion y auditoria para saber que comprar, que frenar, que proveedor conviene y que compra bloquea la operacion."
          title="Compras y abastecimiento"
        />

        <InventoryModuleNav />
        <ProcurementCommandCenter
          isLoading={isLoading || requestsLoading || suppliersLoading || partsLoading || stockLoading}
          parts={parts}
          purchaseOrders={purchaseOrders}
          purchaseRequests={purchaseRequests}
          stockItems={stockItems}
          suppliers={suppliers}
        />
      </div>
    </PageContainer>
  )
}
