import { Link } from 'react-router-dom'
import { Edit, Trash2 } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { CARGO_TYPE_LABELS } from '../../freight/constants/cargoType.constants'
import { getCustomerCommercialSignal } from '../utils/customerPricing'
import type { Customer } from '../types/customer.types'
import { CustomerCreditBadge } from './CustomerCreditBadge'
import { CustomerStatusBadge } from './CustomerStatusBadge'

interface CustomerTableProps {
  customers: Customer[]
  deletingId?: string
  isLoading?: boolean
  onDelete?: (customer: Customer) => void
  onEdit?: (customer: Customer) => void
}

export function CustomerTable({
  customers,
  deletingId = '',
  isLoading = false,
  onDelete,
  onEdit,
}: CustomerTableProps) {
  const columns: TableColumn<Customer>[] = [
    {
      header: 'Cliente',
      key: 'name',
      render: (item) => (
        <div>
          <strong>{item.name}</strong>
          <p className="muted-text">{item.rut || 'Sin RUT'} - {item.contactName || 'Sin contacto'}</p>
        </div>
      ),
    },
    {
      header: 'Contacto',
      key: 'contact',
      render: (item) => (
        <div>
          <strong>{item.phone || 'Sin telefono'}</strong>
          <p className="muted-text">{item.email || 'Sin correo'}</p>
        </div>
      ),
    },
    {
      header: 'Tipos de flete',
      key: 'freightTypes',
      render: (item) => (
        <div className="inline-actions">
          {item.freightTypes.slice(0, 2).map((type) => (
            <Badge key={type} tone="info">{CARGO_TYPE_LABELS[type]}</Badge>
          ))}
          {item.freightTypes.length > 2 ? <Badge tone="neutral">+{item.freightTypes.length - 2}</Badge> : null}
        </div>
      ),
    },
    {
      header: 'Credito',
      key: 'credit',
      render: (item) => <CustomerCreditBadge customer={item} />,
      sortValue: (item) => item.creditLimit,
    },
    {
      header: 'Condicion',
      key: 'commercialSignal',
      render: (item) => getCustomerCommercialSignal(item),
    },
    {
      header: 'Estado',
      key: 'status',
      render: (item) => <CustomerStatusBadge status={item.status} />,
    },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <div className="inline-actions">
          <Link to={ROUTES.customerDetail(item.id)}>
            <Button size="sm" variant="secondary">
              Ver
            </Button>
          </Link>
          {onEdit ? (
            <Button aria-label={`Editar ${item.name}`} icon={<Edit size={15} />} onClick={() => onEdit(item)} size="sm" type="button" variant="ghost" />
          ) : null}
          {onDelete ? (
            <Button
              aria-label={`Eliminar ${item.name}`}
              disabled={deletingId === item.id}
              icon={<Trash2 size={15} />}
              onClick={() => onDelete(item)}
              size="sm"
              type="button"
              variant="danger"
            >
              {deletingId === item.id ? '...' : ''}
            </Button>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={customers}
      density="compact"
      emptyDescription="Crea clientes para asociar tarifas, credito y solicitudes de flete."
      emptyLabel="Sin clientes registrados"
      enableSearch
      getRowHref={(item) => ROUTES.customerDetail(item.id)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir cliente ${item.name}`}
      isLoading={isLoading}
      searchPlaceholder="Buscar cliente, RUT, contacto, correo, flete o condicion comercial"
    />
  )
}
