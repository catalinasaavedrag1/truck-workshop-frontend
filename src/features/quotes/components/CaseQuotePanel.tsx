import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import { quotesMock } from '../mocks/quotes.mock'
import type { Quote } from '../types/quote.types'
import { QuoteForm } from './QuoteForm'
import { QuoteStatusBadge } from './QuoteStatusBadge'

interface CaseQuotePanelProps {
  workshopCase: WorkshopCase
}

export function CaseQuotePanel({ workshopCase }: CaseQuotePanelProps) {
  const [localQuotes, setLocalQuotes] = useState<Quote[]>([])
  const { data: allQuotes } = useResourceList<Quote>('/quotes', quotesMock, {
    caseId: workshopCase.id,
    order: 'desc',
    sort: 'createdAt',
  })
  const quotes = useMemo(() => {
    const fetchedQuotes = allQuotes.filter((quote) => quote.caseId === workshopCase.id)
    const fetchedIds = new Set(fetchedQuotes.map((quote) => quote.id))

    return [...localQuotes.filter((quote) => !fetchedIds.has(quote.id)), ...fetchedQuotes].sort(
      (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    )
  }, [allQuotes, localQuotes, workshopCase.id])

  return (
    <Card>
      <div className="stack">
        <div className="split-row">
          <div>
            <h2 className="section-title">Cotizaciones</h2>
            <p className="muted-text">Borradores, envio a aprobacion y resultado comercial del caso.</p>
          </div>
        </div>
        {quotes.length > 0 ? (
          quotes.map((quote) => (
            <div className="list-row" key={quote.id}>
              <div>
                <strong>{quote.quoteNumber}</strong>
                <p className="muted-text">{quote.diagnosisSummary}</p>
              </div>
              <div className="stack-tight">
                <QuoteStatusBadge status={quote.status} />
                <strong>{formatCurrency(quote.total)}</strong>
                <Link to={ROUTES.quoteDetail(quote.id)}>
                  <Button size="sm" type="button" variant="secondary">
                    Ver flujo
                  </Button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="muted-text">Sin cotizaciones asociadas.</p>
        )}
        <div className="surface-panel">
          <div className="stack">
            <h3 className="section-title">Crear cotizacion del caso</h3>
            <QuoteForm
              onCreated={(quote) => setLocalQuotes((current) => [quote, ...current.filter((item) => item.id !== quote.id)])}
              workshopCase={workshopCase}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
