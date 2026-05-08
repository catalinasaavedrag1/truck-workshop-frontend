import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { FilterBar } from '../../../shared/components/FilterBar/FilterBar'
import { Input } from '../../../shared/components/Input/Input'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { Select } from '../../../shared/components/Select/Select'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
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
  const { data: warehouseStock } = useResourceList<WarehouseStockItem>('/warehouse/stock', warehouseStockMock, {
    order: 'asc',
    sort: 'sku',
  })
  const rows = useMemo(() => getWarehouseStockInsightRows(warehouseStock), [warehouseStock])
  const filteredRows = rows.filter((row) => {
    const matchesQuery = [row.sku, row.name, row.category, row.locationCode, row.pendingPurchaseOrder || '']
      .join(' ')
      .toLowerCase()
      .includes(query.trim().toLowerCase())
    const matchesStatus = status === 'all' || row.status === status

    return matchesQuery && matchesStatus
  })
  const statusLabel = statusOptions.find((option) => option.value === status)?.label

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
          title="Buscar stock"
        >
          <Input
            label="Busqueda"
            name="stockSearch"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="BRK-2210, freno, B-03-02..."
            value={query}
          />
          <Select
            label="Estado"
            name="stockStatus"
            onChange={(event) => setStatus(event.target.value as StockStatus | 'all')}
            options={statusOptions}
            value={status}
          />
        </FilterBar>
        <Card>
          <div className="stack">
            <SectionHeader
              description="Cada fila muestra no solo cantidad, tambien si hay casos esperando y que accion corresponde."
              title="Mapa operativo de stock"
            />
            <WarehouseStockInsightTable rows={filteredRows} />
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
