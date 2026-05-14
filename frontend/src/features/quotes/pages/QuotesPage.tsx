import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { QuoteTable } from '../components/QuoteTable'
import { quotesMock } from '../mocks/quotes.mock'
import type { Quote } from '../types/quote.types'

export function QuotesPage() {
  const { data: quotes } = useResourceList<Quote>('/quotes', quotesMock, { order: 'desc', sort: 'createdAt' })

  return (
    <PageContainer>
      <PageHeader
        description="Cotizaciones conectadas a diagnostico, repuestos, mano de obra y aprobacion."
        title="Cotizaciones"
      />
      <Card>
        <QuoteTable quotes={quotes} />
      </Card>
    </PageContainer>
  )
}
