import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { FreightOperationsSummary } from '../components/FreightOperationsSummary'
import { FreightRequestTable } from '../components/FreightRequestTable'
import { freightAssignmentsMock, freightQuotesMock, freightRequestsMock } from '../mocks/freight.mock'
import type { FreightAssignment, FreightQuote, FreightRequest } from '../types/freight.types'

export function FreightRequestsPage() {
  const { data: freightRequests } = useResourceList<FreightRequest>('/freight/requests', freightRequestsMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: freightQuotes } = useResourceList<FreightQuote>('/freight/quotes', freightQuotesMock, {
    order: 'desc',
    sort: 'validUntil',
  })
  const { data: freightAssignments } = useResourceList<FreightAssignment>(
    '/freight/assignments',
    freightAssignmentsMock,
    { order: 'asc', sort: 'pickupDate' },
  )

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            <Link to={ROUTES.customers}>
              <Button size="sm" variant="secondary">
                Clientes
              </Button>
            </Link>
            <Link to={ROUTES.freightRequestNew}>
              <Button icon={<Plus size={18} />}>Nueva solicitud</Button>
            </Link>
          </div>
        }
        description="Ingreso, cotizacion y priorizacion de solicitudes antes de pasar a programacion."
        title="Solicitudes de flete"
      />
      <FreightOperationsSummary assignments={freightAssignments} quotes={freightQuotes} requests={freightRequests} />
      <Card>
        <div className="stack">
          <div className="section-heading-row">
            <div>
              <h2 className="section-title">Bandeja operacional</h2>
              <p className="muted-text">Prioriza por retiro, estado comercial, cliente y tipo de carga.</p>
            </div>
          </div>
          <FreightRequestTable requests={freightRequests} />
        </div>
      </Card>
    </PageContainer>
  )
}
