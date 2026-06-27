import { ROUTES } from '../../../config/routes'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { EntityLink } from '../../../shared/components/EntityLink'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type { SupplierInvoice } from '../types/supplierInvoice.types'
import { SupplierInvoiceStatusBadge } from './SupplierInvoiceStatusBadge'

interface SupplierInvoiceTableProps {
  invoices: SupplierInvoice[]
  isLoading?: boolean
}

const columns: TableColumn<SupplierInvoice>[] = [
  {
    key: 'invoiceNumber',
    header: 'Factura',
    render: (invoice) => (
      <span className="stack-tight">
        <strong>{invoice.invoiceNumber}</strong>
        <small className="muted-text">{invoice.supplierName}</small>
      </span>
    ),
    sortValue: (invoice) => invoice.invoiceNumber,
  },
  {
    key: 'purchaseOrder',
    header: 'OC asociada',
    render: (invoice) =>
      invoice.purchaseOrderId ? (
        <EntityLink id={invoice.purchaseOrderId} type="purchaseOrder">
          {invoice.purchaseOrderNumber || invoice.purchaseOrderId}
        </EntityLink>
      ) : (
        <span className="muted-text">Sin OC</span>
      ),
  },
  {
    key: 'status',
    header: 'Estado',
    render: (invoice) => <SupplierInvoiceStatusBadge status={invoice.status} />,
    sortValue: (invoice) => invoice.status,
  },
  {
    key: 'invoiceDate',
    header: 'Emision',
    render: (invoice) => formatDate(invoice.invoiceDate),
    sortValue: (invoice) => invoice.invoiceDate,
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

export function SupplierInvoiceTable({ invoices, isLoading }: SupplierInvoiceTableProps) {
  return (
    <Table
      columns={columns}
      data={invoices}
      emptyLabel="Sin facturas de compra"
      emptyDescription="No hay facturas de compra para este filtro."
      getRowHref={(invoice) => ROUTES.purchaseInvoiceDetail(invoice.id)}
      getRowKey={(invoice) => invoice.id}
      getSearchText={(invoice) => `${invoice.invoiceNumber} ${invoice.supplierName} ${invoice.purchaseOrderNumber || ''}`}
      isLoading={isLoading}
      loadingLabel="Cargando facturas de compra"
      searchPlaceholder="Buscar por folio, proveedor u OC"
    />
  )
}
