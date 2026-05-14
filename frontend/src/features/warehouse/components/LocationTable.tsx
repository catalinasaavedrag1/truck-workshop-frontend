import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatDate } from '../../../shared/utils/formatDate'
import { warehouseStockMock } from '../mocks/warehouse.mock'
import type { WarehouseLocation, WarehouseLocationStatus } from '../types/warehouse.types'

const LOCATION_TONES: Record<WarehouseLocationStatus, BadgeTone> = {
  active: 'success',
  full: 'warning',
  inactive: 'neutral',
  maintenance: 'info',
}

const LOCATION_LABELS: Record<WarehouseLocationStatus, string> = {
  active: 'Activa',
  full: 'Llena',
  inactive: 'Inactiva',
  maintenance: 'Mantencion',
}

function getLocationUsedUnits(locationId: string) {
  return warehouseStockMock
    .filter((stockItem) => stockItem.locationId === locationId)
    .reduce((total, stockItem) => total + stockItem.quantity, 0)
}

interface LocationTableProps {
  locations: WarehouseLocation[]
  deletingId?: string
  onDelete: (location: WarehouseLocation) => void
  onEdit: (location: WarehouseLocation) => void
}

export function LocationTable({ deletingId, locations, onDelete, onEdit }: LocationTableProps) {
  const columns: TableColumn<WarehouseLocation>[] = [
    {
      header: 'Ubicacion',
      key: 'code',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.code}</strong>
          <span className="muted-text">{item.name}</span>
        </div>
      ),
    },
    {
      header: 'Ruta fisica',
      key: 'route',
      render: (item) => `Zona ${item.zone} - Pasillo ${item.aisle} - Estante ${item.shelf} - ${item.level}`,
    },
    {
      align: 'right',
      header: 'Uso',
      key: 'used',
      render: (item) => {
        const used = getLocationUsedUnits(item.id)

        return `${used}/${item.capacity}`
      },
      sortValue: (item) => getLocationUsedUnits(item.id),
    },
    {
      header: 'Estado',
      key: 'status',
      render: (item) => <Badge tone={LOCATION_TONES[item.status]}>{LOCATION_LABELS[item.status]}</Badge>,
    },
    {
      header: 'Auditoria',
      key: 'audit',
      render: (item) => (
        <div className="stack-tight">
          <span className="muted-text">{item.updatedAt ? formatDate(item.updatedAt) : 'Sin cambios'}</span>
          <span className="muted-text">{item.updatedBy || item.createdBy || 'Sistema'}</span>
        </div>
      ),
    },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <div className="inline-actions">
          <Button onClick={() => onEdit(item)} size="sm" type="button" variant="secondary">
            Editar
          </Button>
          <Button disabled={deletingId === item.id} onClick={() => onDelete(item)} size="sm" type="button" variant="danger">
            {deletingId === item.id ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={locations}
      density="compact"
      enableSearch
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Editar ubicacion ${item.code}`}
      onRowClick={onEdit}
      searchPlaceholder="Buscar ubicacion, zona, pasillo, estante, auditoria o estado"
    />
  )
}
