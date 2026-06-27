import { ROUTES } from '../../../config/routes'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { EntityLink } from '../../../shared/components/EntityLink'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type { FreightInvoice } from '../types/freightInvoice.types'
import { FreightInvoiceStatusBadge } from './FreightInvoiceStatusBadge'

interface FreightInvoiceTableProps {
  invoices: FreightInvoice[]
  isLoading?: boolean
}

const columns: TableColumn<FreightInvoice>[] = [
  {
    key: 'invoiceNumber',
    header: 'Factura',
    render: (invoice) => (
      <span className="stack-tight">
        <strong>{invoice.invoiceNumber}</strong>
        <small className="muted-text">{invoice.lines.length} servicio(s)</small>
      </span>
    ),
    sortValue: (invoice) => invoice.invoiceNumber,
  },
  {
    key: 'customer',
    header: 'Cliente',
    render: (invoice) =>
      invoice.customerId ? (
        <EntityLink id={invoice.customerId} type="customer">
          {invoice.customerName}
        </EntityLink>
      ) : (
        invoice.customerName
      ),
    sortValue: (invoice) => invoice.customerName,
  },
  {
    key: 'status',
    header: 'Estado',
    render: (invoice) => <FreightInvoiceStatusBadge status={invoice.status} />,
    sortValue: (invoice) => invoice.status,
  },
  {
    key: 'issueDate',
    header: 'Emision',
    render: (invoice) => formatDate(invoice.issueDate),
    sortValue: (invoice) => invoice.issueDate,
  },
  {
    key: 'dueDate',
    header: 'Vencimiento',
    render: (invoice) => formatDate(invoice.dueDate),
    sortValue: (invoice) => invoice.dueDate,
  },
  {
    key: 'total',
    header: 'Total',
    align: 'right',
    render: (invoice) => formatCurrency(invoice.total),
    sortValue: (invoice) => invoice.total,
  },
]

export function FreightInvoiceTable({ invoices, isLoading }: FreightInvoiceTableProps) {
  return (
    <Table
      columns={columns}
      data={invoices}
      emptyLabel="Sin facturas de fletes"
      emptyDescription="No hay facturas de fletes para este filtro."
      getRowHref={(invoice) => ROUTES.freightInvoiceDetail(invoice.id)}
      getRowKey={(invoice) => invoice.id}
      getSearchText={(invoice) => `${invoice.invoiceNumber} ${invoice.customerName}`}
      isLoading={isLoading}
      loadingLabel="Cargando facturas de fletes"
      searchPlaceholder="Buscar por folio o cliente"
    />
  )
}
