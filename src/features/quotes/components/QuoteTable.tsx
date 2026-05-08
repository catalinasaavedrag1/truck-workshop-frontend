import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type { Quote } from '../types/quote.types'
import { QuoteStatusBadge } from './QuoteStatusBadge'

interface QuoteTableProps {
  quotes: Quote[]
}

export function QuoteTable({ quotes }: QuoteTableProps) {
  const columns: TableColumn<Quote>[] = [
    { header: 'Cotizacion', key: 'quoteNumber', render: (item) => <strong>{item.quoteNumber}</strong> },
    { header: 'Caso', key: 'caseNumber', render: (item) => item.caseNumber },
    { header: 'Operacion', key: 'customerName', render: (item) => item.customerName },
    { header: 'Estado', key: 'status', render: (item) => <QuoteStatusBadge status={item.status} /> },
    { header: 'Expira', key: 'expiresAt', render: (item) => formatDate(item.expiresAt) },
    { align: 'right', header: 'Total', key: 'total', render: (item) => formatCurrency(item.total) },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <div className="inline-actions">
          <Link to={`${ROUTES.communications}?relatedEntityType=quote&relatedEntityId=${encodeURIComponent(item.id)}`}>
            <Button size="sm" variant="ghost">
              Chats
            </Button>
          </Link>
          <Link to={ROUTES.quoteDetail(item.id)}>
            <Button size="sm" variant="secondary">
              Ver
            </Button>
          </Link>
        </div>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={quotes}
      enableSearch
      getRowHref={(item) => ROUTES.quoteDetail(item.id)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir cotizacion ${item.quoteNumber}`}
      searchPlaceholder="Buscar cotizacion, caso, operacion o estado"
    />
  )
}
