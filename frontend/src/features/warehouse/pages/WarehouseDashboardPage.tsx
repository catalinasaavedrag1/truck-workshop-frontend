import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { casesMock } from '../../../mocks/cases.mock'
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
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import { InventoryActionCards } from '../components/InventoryActionCards'
import { InventoryModuleNav } from '../components/InventoryModuleNav'
import styles from '../components/InventoryModule.module.css'
import { WarehouseDemandTable } from '../components/WarehouseDemandTable'
import { WarehouseMetrics } from '../components/WarehouseMetrics'
import { WarehouseMovementTimeline } from '../components/WarehouseMovementTimeline'
import { WarehouseStockInsightTable } from '../components/WarehouseStockInsightTable'
import { warehouseMovementsMock, warehouseStockMock } from '../mocks/warehouse.mock'
import { getInventoryActions } from '../services/inventoryOperations'
import {
  getWarehouseDemandRows,
  getWarehouseMetrics,
  getWarehouseStockInsightRows,
} from '../services/warehouseInsights.service'
import type { WarehouseMovement, WarehouseStockItem } from '../types/warehouse.types'

const priorityWeight = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

export function WarehouseDashboardPage() {
  const { data: parts, isLoading: partsLoading } = useResourceList<Part>('/parts', partsMock, { order: 'asc', sort: 'sku' })
  const { data: purchaseOrders } = useResourceList<PurchaseOrder>('/purchase-orders', purchaseOrdersMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: warehouseMovements } = useResourceList<WarehouseMovement>(
    '/warehouse/movements',
    warehouseMovementsMock,
    { order: 'desc', sort: 'createdAt' },
  )
  const { data: warehouseStock, isLoading: stockLoading } = useResourceList<WarehouseStockItem>('/warehouse/stock', warehouseStockMock, {
    order: 'asc',
    sort: 'sku',
  })
  const { data: workshopCases, isLoading: casesLoading } = useResourceList<WorkshopCase>('/workshop-cases', casesMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const demandRows = getWarehouseDemandRows(workshopCases).sort((first, second) => {
    const firstBlocked = first.purchaseRequiredParts + first.waitingReceptionParts
    const secondBlocked = second.purchaseRequiredParts + second.waitingReceptionParts

    return (
      secondBlocked - firstBlocked ||
      priorityWeight[second.priority as keyof typeof priorityWeight] -
        priorityWeight[first.priority as keyof typeof priorityWeight] ||
      second.requestedParts - first.requestedParts
    )
  })
  const stockRows = getWarehouseStockInsightRows(warehouseStock, { parts, purchaseOrders, workshopCases })
  const priorityStockRows = stockRows
    .filter((row) => row.status !== 'available' || row.activeCases > 0 || row.pendingPurchaseOrder)
    .sort((a, b) => {
      const statusWeight = { 'out-of-stock': 3, 'low-stock': 2, available: 1 }

      return statusWeight[b.status] - statusWeight[a.status] || b.activeCases - a.activeCases
    })
  const inventoryActions = getInventoryActions({ demandRows, purchaseOrders, stockItems: warehouseStock })
  const isDemandLoading = casesLoading
  const isStockLoading = stockLoading || partsLoading

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
              <Link to={ROUTES.inventoryReport}>
                <Button size="sm" variant="secondary">
                  Reporte
                </Button>
              </Link>
              <Link to={ROUTES.purchaseOrderNew}>
                <Button size="sm" variant="primary">
                  Nueva OC
                </Button>
              </Link>
            </div>
          }
          description="Prioriza demanda de taller, stock critico, compras y movimientos desde un centro operacional unico."
          title="Gestion de inventario"
        />

        <InventoryModuleNav />
        <div className={styles.inventoryControlPanel}>
          <InventoryActionCards actions={inventoryActions} />
          <WarehouseMetrics metrics={getWarehouseMetrics(warehouseStock, workshopCases, purchaseOrders)} />
        </div>

        <div className={styles.inventoryWorkspace}>
          <Card className={styles.primaryQueue}>
            <div className="stack">
              <SectionHeader
                description="Solo casos con repuestos asociados, ordenados por bloqueo, prioridad y cantidad requerida."
                title="Cola de demanda de taller"
              />
              <WarehouseDemandTable enableSearch={false} isLoading={isDemandLoading} rows={demandRows.slice(0, 8)} />
            </div>
          </Card>

          <div className={styles.sideQueue}>
            <Card className={styles.sidePanel}>
              <div className="stack">
                <SectionHeader
                  description="SKUs que pueden bloquear reparaciones o requieren seguimiento de compra."
                  title="Stock critico"
                />
                <WarehouseStockInsightTable
                  enableSearch={false}
                  isLoading={isStockLoading}
                  rows={priorityStockRows.slice(0, 5)}
                  variant="compact"
                />
              </div>
            </Card>
            <Card className={styles.sidePanel}>
              <div className="stack">
                <SectionHeader
                  description="Entradas, salidas y ajustes recientes para validar actividad real."
                  title="Movimientos recientes"
                />
                <WarehouseMovementTimeline movements={warehouseMovements.slice(0, 4)} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
