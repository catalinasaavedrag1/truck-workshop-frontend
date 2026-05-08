import { Link, useParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { partsMock } from '../../../mocks/parts.mock'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { useResourceItem } from '../../../shared/hooks/useResourceItem'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import {
  getPartDetailContext,
  getStockLabel,
  getStockTone,
} from '../../warehouse/services/warehouseInsights.service'
import { InventoryModuleNav } from '../../warehouse/components/InventoryModuleNav'
import styles from '../../warehouse/components/InventoryModule.module.css'
import type { StockStatus } from '../../warehouse/types/warehouse.types'
import type { Part } from '../types/part.types'

export function PartDetailPage() {
  const { partId } = useParams()
  const { data: fetchedPart, isLoading } = useResourceItem<Part>('/parts', partId, partsMock)
  const context = getPartDetailContext(partId || '')
  const part = fetchedPart || context?.part

  if (!part && isLoading) {
    return (
      <PageContainer>
        <LoadingState label="Cargando SKU" />
      </PageContainer>
    )
  }

  if (!part) {
    return (
      <PageContainer>
        <EmptyState icon={<AlertCircle size={22} />} title="Repuesto no encontrado" />
      </PageContainer>
    )
  }

  const stock = context?.stock
  const quantity = stock?.quantity ?? part.stock
  const minStock = stock?.minStock ?? part.minStock
  const status = stock?.status ?? getCalculatedStatus(quantity, minStock)
  const row = context?.row ?? {
    activeCases: 0,
    category: part.category,
    locationCode: stock?.locationCode || 'Sin ubicacion',
    minStock,
    name: part.name,
    partId: part.id,
    quantity,
    reorderSuggestion: Math.max(minStock * 2 - quantity, 0),
    sku: part.sku,
    status,
    stockValue: quantity * part.unitCost,
    unitCost: part.unitCost,
  }
  const cases = context?.cases || []
  const purchaseOrders = context?.purchaseOrders || []

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <div className="inline-actions">
              <Link to={ROUTES.parts}>
                <Button size="sm" variant="secondary">
                  Volver a SKUs
                </Button>
              </Link>
              <Link to={ROUTES.warehouseStock}>
                <Button size="sm" variant="primary">
                  Ver stock
                </Button>
              </Link>
            </div>
          }
          description={`${part.sku} - ${part.category}`}
          title={part.name}
        />
        <InventoryModuleNav />

        <div className="three-column-grid">
          <Card>
            <div className="stack">
              <span className="muted-text">Estado operacional</span>
              <Badge tone={getStockTone(row.status)}>{getStockLabel(row.status)}</Badge>
              <strong className="metric-value">{`${row.quantity}/${row.minStock}`}</strong>
              <span className="muted-text">Stock actual / minimo</span>
            </div>
          </Card>
          <Card>
            <div className="stack">
              <span className="muted-text">Ubicacion fisica</span>
              <strong className="metric-value">{stock?.locationCode || 'Sin ubicacion'}</strong>
              <span className="muted-text">Codigo de retiro en bodega</span>
            </div>
          </Card>
          <Card>
            <div className="stack">
              <span className="muted-text">Reposicion sugerida</span>
              <strong className="metric-value">{row.reorderSuggestion || 0} u.</strong>
              <span className="muted-text">
                {row.pendingPurchaseOrder ? `OC activa ${row.pendingPurchaseOrder}` : 'Sin OC activa'}
              </span>
            </div>
          </Card>
        </div>

        <div className="two-column-grid">
          <Card>
            <div className="stack">
              <SectionHeader
                description="Datos base del SKU y valorizacion para compras y bodega."
                title="Ficha de repuesto"
              />
              <dl className="detail-list">
                <div>
                  <dt>SKU</dt>
                  <dd>{part.sku}</dd>
                </div>
                <div>
                  <dt>Categoria</dt>
                  <dd>{part.category}</dd>
                </div>
                <div>
                  <dt>Costo unitario</dt>
                  <dd>{formatCurrency(part.unitCost)}</dd>
                </div>
                <div>
                  <dt>Valor en stock</dt>
                  <dd>{formatCurrency(row.stockValue || part.stock * part.unitCost)}</dd>
                </div>
                <div>
                  <dt>Ubicacion</dt>
                  <dd>{stock?.locationCode || 'Sin ubicacion'}</dd>
                </div>
                <div>
                  <dt>Creado por</dt>
                  <dd>
                    {part.createdBy || 'Sistema'}
                    {part.createdAt ? ` - ${formatDate(part.createdAt)}` : ''}
                  </dd>
                </div>
                <div>
                  <dt>Ultima modificacion</dt>
                  <dd>
                    {part.updatedBy || part.createdBy || 'Sistema'}
                    {part.updatedAt ? ` - ${formatDate(part.updatedAt)}` : ''}
                  </dd>
                </div>
                {part.deletedBy ? (
                  <div>
                    <dt>Eliminado por</dt>
                    <dd>{part.deletedBy}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </Card>

          <Card>
            <div className="stack">
              <SectionHeader
                description="Casos que estan consumiendo o esperando este SKU."
                title="Demanda desde taller"
              />
              {cases.length > 0 ? (
                cases.map((workshopCase) => (
                  <div className="list-row" key={workshopCase.caseNumber}>
                    <div className="stack-tight">
                      <strong>{workshopCase.caseNumber}</strong>
                      <span className="muted-text">
                        {workshopCase.customerName} - {workshopCase.truckPlate}
                      </span>
                    </div>
                    <div className="inline-actions">
                      <Badge
                        tone={
                          workshopCase.priority === 'critical'
                            ? 'danger'
                            : workshopCase.priority === 'high'
                              ? 'warning'
                              : 'info'
                        }
                      >
                        {workshopCase.priority}
                      </Badge>
                      <Link to={workshopCase.path}>
                        <Button size="sm" variant="secondary">
                          Ver
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="muted-text">No hay casos solicitando este SKU por ahora.</p>
              )}
            </div>
          </Card>
        </div>

        <Card>
          <div className="stack">
            <SectionHeader
              description="Historial y compras relacionadas para entender si el repuesto ya viene en camino."
              title="Ordenes de compra relacionadas"
            />
            {purchaseOrders.length > 0 ? (
              purchaseOrders.map((order) => (
                <div className="list-row" key={order.id}>
                  <div className="stack-tight">
                    <strong>{order.purchaseOrderNumber}</strong>
                    <span className="muted-text">
                      {order.supplierName} - entrega {formatDate(order.expectedDeliveryDate)}
                    </span>
                  </div>
                  <div className="inline-actions">
                    <Badge tone={order.status === 'RECEIVED' ? 'success' : order.status === 'CANCELLED' ? 'danger' : 'warning'}>
                      {order.status}
                    </Badge>
                    <Link to={ROUTES.purchaseOrderDetail(order.id)}>
                      <Button size="sm" variant="secondary">
                        Ver OC
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="muted-text">No hay ordenes de compra asociadas a este SKU.</p>
            )}
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}

function getCalculatedStatus(quantity: number, minStock: number): StockStatus {
  if (quantity <= 0) {
    return 'out-of-stock'
  }

  if (quantity <= minStock) {
    return 'low-stock'
  }

  return 'available'
}
