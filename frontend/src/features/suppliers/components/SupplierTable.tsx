import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { EntityLink } from '../../../shared/components/EntityLink'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatDate } from '../../../shared/utils/formatDate'
import { formatRut, getRutSearchText } from '../../../shared/utils/rut'
import type { Supplier } from '../types/supplier.types'
import { SupplierRatingBadge } from './SupplierRatingBadge'

interface SupplierTableProps {
  suppliers: Supplier[]
}

export function SupplierTable({ suppliers }: SupplierTableProps) {
  const columns: TableColumn<Supplier>[] = [
    {
      header: 'Proveedor',
      key: 'name',
      render: (item) => (
        <div>
          <EntityLink id={item.id} type="supplier">
            {item.name}
          </EntityLink>
          <p className="muted-text">{formatRut(item.rut)}</p>
        </div>
      ),
      searchableValue: (item) => getRutSearchText(item.rut),
    },
    {
      header: 'Contacto',
      key: 'contactName',
      render: (item) => (
        <div>
          <strong>{item.contactName}</strong>
          <p className="muted-text">{item.phone}</p>
        </div>
      ),
    },
    {
      header: 'Categorias',
      key: 'categories',
      render: (item) => item.categories?.slice(0, 3).join(', ') || '-',
      searchableValue: (item) => item.categories?.join(' ') || '',
    },
    {
      align: 'right',
      header: 'Entrega',
      key: 'averageDeliveryDays',
      render: (item) => `${item.averageDeliveryDays} dias`,
    },
    {
      align: 'right',
      header: 'OC activas',
      key: 'activePurchaseOrderIds',
      render: (item) => item.activePurchaseOrderIds.length,
      sortValue: (item) => item.activePurchaseOrderIds.length,
    },
    { header: 'Rating', key: 'rating', render: (item) => <SupplierRatingBadge rating={item.rating} /> },
    {
      header: 'Estado',
      key: 'audit',
      render: (item) => (
        <div className="stack-tight">
          <Badge tone={item.status === 'inactive' ? 'neutral' : 'success'}>{item.status === 'inactive' ? 'Inactivo' : 'Activo'}</Badge>
          <span className="muted-text">{item.updatedAt ? formatDate(item.updatedAt) : 'Sin cambios'}</span>
        </div>
      ),
    },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <Link to={ROUTES.supplierDetail(item.id)}>
          <Button size="sm" variant="secondary">
            Ver
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={suppliers}
      density="compact"
      enableSearch
      emptyDescription="No hay proveedores que coincidan con la busqueda."
      getRowHref={(item) => ROUTES.supplierDetail(item.id)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir proveedor ${item.name}`}
      searchPlaceholder="Buscar proveedor, RUT, contacto, categoria o rating"
    />
  )
}
