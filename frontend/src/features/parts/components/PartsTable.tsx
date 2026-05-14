import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { EntityLink } from '../../../shared/components/EntityLink'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type { PartInventoryRow } from '../../warehouse/services/warehouseInsights.service'
import { getStockLabel, getStockTone } from '../../warehouse/services/warehouseInsights.service'

interface PartsTableProps {
  parts: PartInventoryRow[]
  deletingId?: string
  onDelete: (part: PartInventoryRow) => void
  onEdit: (part: PartInventoryRow) => void
}

export function PartsTable({ deletingId, onDelete, onEdit, parts }: PartsTableProps) {
  const columns: TableColumn<PartInventoryRow>[] = [
    {
      header: 'SKU / repuesto',
      key: 'sku',
      render: (item) => (
        <div className="stack-tight">
          <EntityLink id={item.partId} type="part">
            {item.sku}
          </EntityLink>
          <span className="muted-text">{item.name}</span>
        </div>
      ),
    },
    { header: 'Categoria', key: 'category', render: (item) => item.category },
    {
      header: 'Ubicacion',
      key: 'locationCode',
      render: (item) => (
        <EntityLink id={item.locationCode} type="warehouseLocation" variant="subtle">
          {item.locationCode}
        </EntityLink>
      ),
    },
    { align: 'right', header: 'Stock', key: 'quantity', render: (item) => `${item.quantity}/${item.minStock}` },
    { align: 'right', header: 'Sugerido', key: 'reorderSuggestion', render: (item) => item.reorderSuggestion > 0 ? `${item.reorderSuggestion} u.` : 'OK' },
    { align: 'right', header: 'Casos', key: 'activeCases', render: (item) => item.activeCases },
    {
      header: 'OC activa',
      key: 'pendingPurchaseOrder',
      render: (item) => item.pendingPurchaseOrder || 'Sin OC',
    },
    { align: 'right', header: 'Costo', key: 'unitCost', render: (item) => formatCurrency(item.unitCost) },
    { header: 'Estado', key: 'status', render: (item) => <Badge tone={getStockTone(item.status)}>{getStockLabel(item.status)}</Badge> },
    {
      header: 'Actualizado',
      key: 'audit',
      render: (item) => (
        <div className="stack-tight">
          <span className="muted-text">{item.updatedAt ? formatDate(item.updatedAt) : 'Sin cambios'}</span>
          <span className="muted-text">{item.updatedBy || item.createdBy || 'Sistema'}</span>
          {item.deletedBy ? <span className="muted-text">Eliminado por {item.deletedBy}</span> : null}
        </div>
      ),
    },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <div className="inline-actions">
          <Link to={ROUTES.partDetail(item.partId)}>
            <Button size="sm" variant="secondary">
              Ver
            </Button>
          </Link>
          <Button onClick={() => onEdit(item)} size="sm" type="button" variant="secondary">
            Editar
          </Button>
          <Button disabled={deletingId === item.partId} onClick={() => onDelete(item)} size="sm" type="button" variant="danger">
            {deletingId === item.partId ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={parts}
      density="compact"
      enableSearch
      emptyDescription="No hay repuestos que coincidan con la busqueda."
      getRowHref={(item) => ROUTES.partDetail(item.partId)}
      getRowKey={(item) => item.partId}
      getRowLabel={(item) => `Abrir SKU ${item.sku}`}
      searchPlaceholder="Buscar SKU, repuesto, categoria, ubicacion u OC"
    />
  )
}
