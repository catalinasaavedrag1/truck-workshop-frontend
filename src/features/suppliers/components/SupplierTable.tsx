import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatDate } from '../../../shared/utils/formatDate'
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
          <strong>{item.name}</strong>
          <p className="muted-text">{item.rut}</p>
        </div>
      ),
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
    { header: 'Categorias', key: 'categories', render: (item) => item.categories?.join(', ') || '-' },
    {
      align: 'right',
      header: 'Entrega',
      key: 'averageDeliveryDays',
      render: (item) => `${item.averageDeliveryDays} dias`,
    },
    { header: 'Rating', key: 'rating', render: (item) => <SupplierRatingBadge rating={item.rating} /> },
    {
      header: 'Auditoria',
      key: 'audit',
      render: (item) => (
        <div>
          <Badge tone={item.status === 'inactive' ? 'neutral' : 'success'}>{item.status === 'inactive' ? 'Inactivo' : 'Activo'}</Badge>
          <p className="muted-text">Creado por {item.createdBy || 'Sistema'}</p>
          <p className="muted-text">
            Modificado por {item.updatedBy || item.createdBy || 'Sistema'}
            {item.updatedAt ? ` - ${formatDate(item.updatedAt)}` : ''}
          </p>
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
      enableSearch
      getRowHref={(item) => ROUTES.supplierDetail(item.id)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir proveedor ${item.name}`}
      searchPlaceholder="Buscar proveedor, RUT, contacto, categoria o rating"
    />
  )
}
