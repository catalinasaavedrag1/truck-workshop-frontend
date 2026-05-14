import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { partsMock } from '../../../mocks/parts.mock'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import type { Part } from '../../parts/types/part.types'
import { purchaseOrdersMock } from '../../purchase-orders/mocks/purchaseOrders.mock'
import type { PurchaseOrder } from '../../purchase-orders/types/purchaseOrder.types'
import { suppliersMock } from '../../suppliers/mocks/suppliers.mock'
import type { Supplier } from '../../suppliers/types/supplier.types'
import { InventoryModuleNav } from '../components/InventoryModuleNav'
import styles from '../components/InventoryModule.module.css'
import { InventoryReportPanel } from '../components/InventoryReportPanel'
import { warehouseLocationsMock, warehouseMovementsMock, warehouseStockMock } from '../mocks/warehouse.mock'
import { getInventoryReportSummary } from '../services/inventoryOperations'
import { getWarehouseDemandRows } from '../services/warehouseInsights.service'
import type { WarehouseLocation, WarehouseMovement, WarehouseStockItem } from '../types/warehouse.types'

export function InventoryReportPage() {
  const { data: parts } = useResourceList<Part>('/parts', partsMock, { order: 'asc', sort: 'sku' })
  const { data: purchaseOrders } = useResourceList<PurchaseOrder>('/purchase-orders', purchaseOrdersMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: suppliers } = useResourceList<Supplier>('/suppliers', suppliersMock, { order: 'asc', sort: 'name' })
  const { data: stockItems } = useResourceList<WarehouseStockItem>('/warehouse/stock', warehouseStockMock, {
    order: 'asc',
    sort: 'sku',
  })
  const { data: locations } = useResourceList<WarehouseLocation>('/warehouse/locations', warehouseLocationsMock, {
    order: 'asc',
    sort: 'code',
  })
  const { data: movements } = useResourceList<WarehouseMovement>('/warehouse/movements', warehouseMovementsMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const demandRows = getWarehouseDemandRows()
  const report = getInventoryReportSummary({
    demandRows,
    locations,
    movements,
    parts,
    purchaseOrders,
    stockItems,
    suppliers,
  })

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <div className="inline-actions">
              <Link to={ROUTES.parts}>
                <Button size="sm" variant="secondary">
                  Ver SKUs
                </Button>
              </Link>
              <Link to={ROUTES.purchaseOrderNew}>
                <Button size="sm" variant="primary">
                  Nueva OC
                </Button>
              </Link>
            </div>
          }
          description="Consolida stock, valor, quiebres, compras abiertas, proveedores y ubicaciones para decidir rapido."
          title="Reporte de inventario"
        />

        <InventoryModuleNav />
        <InventoryReportPanel report={report} />

        <Card>
          <div className="stack">
            <SectionHeader
              description="Atajos para resolver las decisiones que normalmente nacen desde el reporte."
              title="Acciones operacionales"
            />
            <div className={styles.quickLinks}>
              <Link to={ROUTES.warehouseStock}>
                <Button size="sm" variant="secondary">
                  Revisar stock fisico
                </Button>
              </Link>
              <Link to={ROUTES.parts}>
                <Button size="sm" variant="secondary">
                  Mantener SKUs
                </Button>
              </Link>
              <Link to={ROUTES.purchaseOrders}>
                <Button size="sm" variant="secondary">
                  Seguir compras
                </Button>
              </Link>
              <Link to={ROUTES.suppliers}>
                <Button size="sm" variant="secondary">
                  Evaluar proveedores
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
