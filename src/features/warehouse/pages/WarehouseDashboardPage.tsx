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
import { InventoryActionCards } from '../components/InventoryActionCards'
import { InventoryModuleNav } from '../components/InventoryModuleNav'
import styles from '../components/InventoryModule.module.css'
import { InventoryOperationalFlow } from '../components/InventoryOperationalFlow'
import { InventoryReportPanel } from '../components/InventoryReportPanel'
import { WarehouseDemandTable } from '../components/WarehouseDemandTable'
import { WarehouseMetrics } from '../components/WarehouseMetrics'
import { WarehouseMovementTimeline } from '../components/WarehouseMovementTimeline'
import { WarehouseStockInsightTable } from '../components/WarehouseStockInsightTable'
import { warehouseLocationsMock, warehouseMovementsMock, warehouseStockMock } from '../mocks/warehouse.mock'
import { getInventoryActions, getInventoryReportSummary } from '../services/inventoryOperations'
import {
  getWarehouseDemandRows,
  getWarehouseMetrics,
  getWarehouseStockInsightRows,
} from '../services/warehouseInsights.service'
import type { WarehouseLocation, WarehouseMovement, WarehouseStockItem } from '../types/warehouse.types'

export function WarehouseDashboardPage() {
  const { data: parts } = useResourceList<Part>('/parts', partsMock, { order: 'asc', sort: 'sku' })
  const { data: purchaseOrders } = useResourceList<PurchaseOrder>('/purchase-orders', purchaseOrdersMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: suppliers } = useResourceList<Supplier>('/suppliers', suppliersMock, { order: 'asc', sort: 'name' })
  const { data: warehouseLocations } = useResourceList<WarehouseLocation>('/warehouse/locations', warehouseLocationsMock, {
    order: 'asc',
    sort: 'code',
  })
  const { data: warehouseMovements } = useResourceList<WarehouseMovement>(
    '/warehouse/movements',
    warehouseMovementsMock,
    { order: 'desc', sort: 'createdAt' },
  )
  const { data: warehouseStock } = useResourceList<WarehouseStockItem>('/warehouse/stock', warehouseStockMock, {
    order: 'asc',
    sort: 'sku',
  })
  const demandRows = getWarehouseDemandRows()
  const stockRows = getWarehouseStockInsightRows(warehouseStock)
  const priorityStockRows = stockRows
    .filter((row) => row.status !== 'available' || row.activeCases > 0 || row.pendingPurchaseOrder)
    .sort((a, b) => b.activeCases - a.activeCases)
  const inventoryActions = getInventoryActions({ demandRows, purchaseOrders, stockItems: warehouseStock })
  const report = getInventoryReportSummary({
    demandRows,
    locations: warehouseLocations,
    movements: warehouseMovements,
    parts,
    purchaseOrders,
    stockItems: warehouseStock,
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
                  Nuevo SKU
                </Button>
              </Link>
              <Link to={ROUTES.purchaseOrderNew}>
                <Button size="sm" variant="secondary">
                  Nueva OC
                </Button>
              </Link>
              <Link to={ROUTES.inventoryReport}>
                <Button size="sm" variant="primary">
                  Reporte
                </Button>
              </Link>
            </div>
          }
          description="Centro unico para demanda de taller, SKUs, stock fisico, compras, proveedores y ubicaciones."
          title="Gestion de inventario"
        />

        <InventoryModuleNav />
        <InventoryOperationalFlow />
        <InventoryActionCards actions={inventoryActions} />
        <WarehouseMetrics metrics={getWarehouseMetrics(warehouseStock)} />

        <Card>
          <div className="stack">
            <SectionHeader
              description="Prioridad para el encargado: casos que necesitan repuestos, disponibilidad y accion siguiente."
              title="Demanda de repuestos desde taller"
            />
            <WarehouseDemandTable rows={demandRows} />
          </div>
        </Card>

        <InventoryReportPanel report={report} />

        <div className="two-column-grid">
          <Card>
            <div className="stack">
              <SectionHeader
                description="SKUs que requieren accion por bajo stock, compra activa o demanda de casos."
                title="Stock que necesita atencion"
              />
              <WarehouseStockInsightTable rows={priorityStockRows} />
            </div>
          </Card>
          <Card>
            <div className="stack">
              <SectionHeader
                description="Entradas, salidas y ajustes recientes con responsable y ubicacion."
                title="Ultimos movimientos"
              />
              <WarehouseMovementTimeline movements={warehouseMovements} />
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
