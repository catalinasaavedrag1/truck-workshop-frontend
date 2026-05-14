import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { casesMock } from '../../../mocks/cases.mock'
import { partsMock } from '../../../mocks/parts.mock'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { FilterBar } from '../../../shared/components/FilterBar/FilterBar'
import { Input } from '../../../shared/components/Input/Input'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import type { Part } from '../../parts/types/part.types'
import { purchaseOrdersMock } from '../../purchase-orders/mocks/purchaseOrders.mock'
import type { PurchaseOrder } from '../../purchase-orders/types/purchaseOrder.types'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import { InventoryModuleNav } from '../components/InventoryModuleNav'
import styles from '../components/InventoryModule.module.css'
import { WarehouseStockInsightTable } from '../components/WarehouseStockInsightTable'
import { warehouseStockMock } from '../mocks/warehouse.mock'
import { getWarehouseStockInsightRows } from '../services/warehouseInsights.service'
import type { StockStatus, WarehouseStockItem } from '../types/warehouse.types'

export function WarehouseStockPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StockStatus | 'all'>('all')
  const statusOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'Disponible', value: 'available' },
    { label: 'Bajo stock', value: 'low-stock' },
    { label: 'Sin stock', value: 'out-of-stock' },
  ]
  const { data: warehouseStock, isLoading: stockLoading } = useResourceList<WarehouseStockItem>('/warehouse/stock', warehouseStockMock, {
    order: 'asc',
    sort: 'sku',
  })
  const { data: parts, isLoading: partsLoading } = useResourceList<Part>('/parts', partsMock, { order: 'asc', sort: 'sku' })
  const { data: purchaseOrders } = useResourceList<PurchaseOrder>('/purchase-orders', purchaseOrdersMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: workshopCases, isLoading: casesLoading } = useResourceList<WorkshopCase>('/workshop-cases', casesMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const rows = useMemo(
    () => getWarehouseStockInsightRows(warehouseStock, { parts, purchaseOrders, workshopCases }),
    [parts, purchaseOrders, warehouseStock, workshopCases],
  )
  const filteredRows = rows.filter((row) => {
    const matchesQuery = [row.sku, row.name, row.category, row.locationCode, row.pendingPurchaseOrder || '']
      .join(' ')
      .toLowerCase()
      .includes(query.trim().toLowerCase())
    const matchesStatus = status === 'all' || row.status === status

    return matchesQuery && matchesStatus
  })
  const statusCounts = {
    all: rows.length,
    available: rows.filter((row) => row.status === 'available').length,
    'low-stock': rows.filter((row) => row.status === 'low-stock').length,
    'out-of-stock': rows.filter((row) => row.status === 'out-of-stock').length,
  }
  const statusLabel = statusOptions.find((option) => option.value === status)?.label
  const isLoading = stockLoading || partsLoading || casesLoading

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
          description="Mapa fisico accionable: ubicacion, demanda de casos, OC activa y proxima accion."
          title="Stock fisico"
        />
        <InventoryModuleNav />
        <FilterBar
          activeCount={(query ? 1 : 0) + (status !== 'all' ? 1 : 0)}
          activeFilters={[
            ...(query ? [{ label: 'Busqueda', onRemove: () => setQuery(''), value: query }] : []),
            ...(status !== 'all' ? [{ label: 'Estado', onRemove: () => setStatus('all'), value: statusLabel }] : []),
          ]}
          description="Filtra por SKU, nombre, ubicacion, OC o estado."
          onClear={() => {
            setQuery('')
            setStatus('all')
          }}
          title="Control rapido"
        >
          <Input
            label="Busqueda principal"
            name="stockSearch"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="BRK-2210, freno, B-03-02..."
            value={query}
          />
          <div className={styles.statusSegment} role="group" aria-label="Filtrar por estado de stock">
            {statusOptions.map((option) => (
              <button
                aria-pressed={status === option.value}
                className={status === option.value ? styles.statusSegmentActive : undefined}
                key={option.value}
                onClick={() => setStatus(option.value as StockStatus | 'all')}
                type="button"
              >
                <span>{option.label}</span>
                <strong>{statusCounts[option.value as keyof typeof statusCounts]}</strong>
              </button>
            ))}
          </div>
        </FilterBar>
        <Card>
          <div className="stack">
            <SectionHeader
              description={`${filteredRows.length} de ${rows.length} SKUs visibles. Cada fila prioriza stock, demanda, estado y accion siguiente.`}
              title="Mapa operativo de stock"
            />
            <WarehouseStockInsightTable enableSearch={false} isLoading={isLoading} rows={filteredRows} />
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
