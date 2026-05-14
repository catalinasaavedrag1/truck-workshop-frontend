import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { EntityLink } from '../../../shared/components/EntityLink'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatDate } from '../../../shared/utils/formatDate'
import { getSuggestionGroupLabel } from '../services/procurementInsights.service'
import type { PurchaseSuggestion } from '../types/procurement.types'
import { ActionBadge, RiskBadge, StatusBadge } from './ProcurementBadges'

interface PurchaseSuggestionTableProps {
  onOpenSku?: (sku: string) => void
  onSelectionChange?: (ids: Set<string>) => void
  rows: PurchaseSuggestion[]
  selectedIds?: Set<string>
}

export function PurchaseSuggestionTable({ onOpenSku, onSelectionChange, rows, selectedIds }: PurchaseSuggestionTableProps) {
  const columns: TableColumn<PurchaseSuggestion>[] = [
    {
      header: 'SKU / producto',
      key: 'sku',
      render: (item) => (
        <div className="stack-tight">
          <EntityLink id={item.partId} type="part">
            {item.sku}
          </EntityLink>
          <span className="muted-text">{item.name}</span>
          <EntityLink id={item.locationCode} type="warehouseLocation" variant="subtle">
            {item.locationCode}
          </EntityLink>
        </div>
      ),
    },
    {
      header: 'Decision',
      key: 'group',
      render: (item) => (
        <div className="stack-tight">
          <ActionBadge>{getSuggestionGroupLabel(item.group)}</ActionBadge>
          <RiskBadge risk={item.risk} />
        </div>
      ),
    },
    {
      align: 'right',
      header: 'Stock',
      key: 'stockAvailable',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.stockAvailable} disp.</strong>
          <span className="muted-text">
            fisico {item.stockActual} / min {item.minStock} / max {item.maxStock}
          </span>
          <span className="muted-text">
            comp. {item.stockCommitted} / res. {item.reservedStock}
          </span>
        </div>
      ),
      sortValue: (item) => item.stockAvailable,
    },
    {
      align: 'right',
      header: 'Cobertura',
      key: 'coverageDays',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.coverageDays} dias</strong>
          <span className="muted-text">{item.consumptionMonthly} u./mes</span>
        </div>
      ),
    },
    {
      header: 'Proveedor recomendado',
      key: 'recommendedSupplierName',
      render: (item) => (
        <div className="stack-tight">
          <EntityLink id={item.recommendedSupplierId} type="supplier">
            {item.recommendedSupplierName}
          </EntityLink>
          <span className="muted-text">Lead time {item.leadTimeDays} dias</span>
          <span className="muted-text">Ultima compra {formatDate(item.lastPurchaseAt)}</span>
        </div>
      ),
    },
    {
      header: 'Justificacion',
      key: 'justification',
      render: (item) => (
        <div className="stack-tight">
          <span>{item.justification}</span>
          <span className="muted-text">{item.impact}</span>
          <div className="inline-actions">
            {item.statusChips.map((chip) => (
              <StatusBadge key={chip}>{chip}</StatusBadge>
            ))}
          </div>
        </div>
      ),
    },
    {
      align: 'right',
      header: 'Sugerido',
      key: 'suggestedQuantity',
      render: (item) => `${item.suggestedQuantity} u.`,
    },
    {
      header: 'Impacto',
      key: 'cases',
      render: (item) => (
        <div className="stack-tight">
          <span>{item.responsible}</span>
          <div className="inline-actions">
            {item.cases.slice(0, 2).map((workshopCase) => (
              <EntityLink id={workshopCase.id} key={workshopCase.id} type={workshopCase.type} variant="subtle">
                {workshopCase.label}
              </EntityLink>
            ))}
            {item.trucks.slice(0, 2).map((truck) => (
              <EntityLink id={truck.id} key={truck.id} type={truck.type} variant="subtle">
                {truck.label}
              </EntityLink>
            ))}
          </div>
          {item.activePurchaseOrderId ? (
            <EntityLink id={item.activePurchaseOrderId} type="purchaseOrder" variant="subtle">
              {item.activePurchaseOrderNumber}
            </EntityLink>
          ) : null}
        </div>
      ),
    },
    {
      align: 'right',
      header: 'Accion',
      key: 'actions',
      render: (item) => (
        <div className="inline-actions">
          <Button onClick={() => onOpenSku?.(item.sku)} size="sm" type="button" variant="secondary">
            Ficha 360
          </Button>
          <Link to={item.activePurchaseOrderId ? ROUTES.purchaseOrderDetail(item.activePurchaseOrderId) : ROUTES.purchaseOrderNew}>
            <Button size="sm" variant={item.suggestedQuantity > 0 ? 'primary' : 'secondary'}>
              {item.action}
            </Button>
          </Link>
        </div>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch
      emptyDescription="No hay sugerencias que coincidan con los filtros operacionales."
      getRowHref={(item) => ROUTES.partDetail(item.partId)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir ficha SKU ${item.sku}`}
      pageSize={8}
      searchPlaceholder="Buscar SKU, proveedor, categoria, responsable, caso o camion"
      selection={
        selectedIds && onSelectionChange
          ? {
              getRowLabel: (item) => `Seleccionar sugerencia ${item.sku}`,
              onSelectionChange,
              selectedKeys: selectedIds,
            }
          : undefined
      }
    />
  )
}
