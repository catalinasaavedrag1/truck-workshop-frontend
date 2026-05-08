import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { FreightOperationsSummary } from '../components/FreightOperationsSummary'
import { FreightQuoteTable } from '../components/FreightQuoteTable'
import { freightAssignmentsMock, freightQuotesMock, freightRequestsMock } from '../mocks/freight.mock'
import type { FreightAssignment, FreightQuote, FreightRequest } from '../types/freight.types'

export function FreightQuotesPage() {
  const { data: freightQuotes } = useResourceList<FreightQuote>('/freight/quotes', freightQuotesMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: freightRequests } = useResourceList<FreightRequest>('/freight/requests', freightRequestsMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: freightAssignments } = useResourceList<FreightAssignment>(
    '/freight/assignments',
    freightAssignmentsMock,
    { order: 'asc', sort: 'pickupDate' },
  )

  return (
    <PageContainer>
      <PageHeader
        description="Comparativa comercial y operacional para enviar, vencer, aprobar o rechazar cotizaciones."
        title="Cotizaciones de flete"
      />
      <FreightOperationsSummary assignments={freightAssignments} quotes={freightQuotes} requests={freightRequests} />
      <Card>
        <div className="stack">
          <div className="section-heading-row">
            <div>
              <h2 className="section-title">Mesa comercial de cotizaciones</h2>
              <p className="muted-text">Ordena por validez, total, cliente o estado para decidir rapido.</p>
            </div>
          </div>
          <FreightQuoteTable quotes={freightQuotes} requests={freightRequests} />
        </div>
      </Card>
    </PageContainer>
  )
}
