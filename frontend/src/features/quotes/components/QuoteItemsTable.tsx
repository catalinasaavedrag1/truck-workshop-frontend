import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { QuoteLineItem, QuoteLineType } from '../types/quote.types'

const LINE_TYPE_LABELS: Record<QuoteLineType, string> = {
  discount: 'Descuento',
  labor: 'Mano de obra',
  part: 'Repuesto/servicio',
}

interface QuoteItemsTableProps {
  items: QuoteLineItem[]
}

export function QuoteItemsTable({ items }: QuoteItemsTableProps) {
  const columns: TableColumn<QuoteLineItem>[] = [
    { header: 'Concepto', key: 'description', render: (item) => <strong>{item.description}</strong> },
    { header: 'Tipo', key: 'type', render: (item) => LINE_TYPE_LABELS[item.type] },
    { align: 'right', header: 'Cantidad', key: 'quantity', render: (item) => item.quantity },
    { align: 'right', header: 'Unitario', key: 'unitPrice', render: (item) => formatCurrency(item.unitPrice) },
    {
      align: 'right',
      header: 'Subtotal',
      key: 'subtotal',
      render: (item) => formatCurrency(item.quantity * item.unitPrice),
    },
  ]

  return <Table columns={columns} data={items} getRowKey={(item) => item.id} />
}
