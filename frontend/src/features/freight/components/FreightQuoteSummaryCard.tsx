import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EntityLink } from '../../../shared/components/EntityLink'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { CARGO_TYPE_LABELS } from '../constants/cargoType.constants'
import type { FreightQuote } from '../types/freight.types'
import { FreightRequestStatusBadge } from './FreightRequestStatusBadge'

interface FreightQuoteSummaryCardProps {
  quote: FreightQuote
}

export function FreightQuoteSummaryCard({ quote }: FreightQuoteSummaryCardProps) {
  return (
    <Card>
      <div className="stack">
        <div className="split-row">
          <div>
            <EntityLink id={quote.id} type="freightQuote">
              {quote.quoteNumber}
            </EntityLink>
            <p className="muted-text">{quote.customerName}</p>
          </div>
          <FreightRequestStatusBadge status={quote.status} type="quote" />
        </div>
        <dl className="detail-list">
          <div>
            <dt>Kilometraje</dt>
            <dd>{quote.estimatedKm.toLocaleString('es-CL')} km</dd>
          </div>
          <div>
            <dt>Carga</dt>
            <dd>{CARGO_TYPE_LABELS[quote.cargoType]}</dd>
          </div>
          <div>
            <dt>Valida hasta</dt>
            <dd>{formatDate(quote.validUntil)}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{formatCurrency(quote.total)}</dd>
          </div>
        </dl>
        <Link to={ROUTES.freightQuoteDetail(quote.id)}>
          <Button fullWidth size="sm" variant="secondary">
            Ver cotizacion
          </Button>
        </Link>
      </div>
    </Card>
  )
}
