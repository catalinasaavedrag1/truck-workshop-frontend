import { Link } from 'react-router-dom'
import { Edit, UserX } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { EntityLink } from '../../../shared/components/EntityLink'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatRut, getRutSearchText } from '../../../shared/utils/rut'
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
          <EntityLink id={item.id} type="customer">
            {item.name}
          </EntityLink>
          <p className="muted-text">{formatRut(item.rut) || 'Sin RUT'} - {item.contactName || 'Sin contacto'}</p>
        </div>
      ),
      searchableValue: (item) => getRutSearchText(item.rut),
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
              Ficha 360
            </Button>
          </Link>
          {onEdit ? (
            <Button aria-label={`Editar ${item.name}`} icon={<Edit size={15} />} onClick={() => onEdit(item)} size="sm" type="button" variant="ghost" />
          ) : null}
          {onDelete ? (
            <Button
              aria-label={`Desactivar ${item.name}`}
              disabled={deletingId === item.id}
              icon={<UserX size={15} />}
              onClick={() => onDelete(item)}
              size="sm"
              type="button"
              variant="danger"
            >
              {deletingId === item.id ? '...' : 'Desactivar'}
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
