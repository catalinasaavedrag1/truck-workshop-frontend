import { Link, useParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { useResourceItem } from '../../../shared/hooks/useResourceItem'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { CustomerCreditBadge } from '../../customers/components/CustomerCreditBadge'
import { customersMock } from '../../customers/mocks/customers.mock'
import type { Customer } from '../../customers/types/customer.types'
import { getCustomerPriceForCargo } from '../../customers/utils/customerPricing'
import { CARGO_TYPE_LABELS } from '../constants/cargoType.constants'
import { FreightFlowStepper } from '../components/FreightFlowStepper'
import { FreightQuoteCalculator } from '../components/FreightQuoteCalculator'
import { FreightQuoteSummaryCard } from '../components/FreightQuoteSummaryCard'
import { FreightPriorityBadge } from '../components/FreightPriorityBadge'
import { FreightRequestStatusBadge } from '../components/FreightRequestStatusBadge'
import { FreightRouteCard } from '../components/FreightRouteCard'
import { freightQuotesMock, freightRequestsMock } from '../mocks/freight.mock'
import type { FreightQuote } from '../types/freight.types'
import { getFreightPriority } from '../utils/freightOperations'

export function FreightRequestDetailPage() {
  const { requestId } = useParams()
  const { data: request } = useResourceItem('/freight/requests', requestId, freightRequestsMock)
  const { data: customers } = useResourceList<Customer>('/customers', customersMock, {
    order: 'asc',
    sort: 'name',
  })
  const { data: freightQuotes } = useResourceList<FreightQuote>('/freight/quotes', freightQuotesMock, {
    order: 'desc',
    sort: 'createdAt',
  })

  if (!request) {
    return (
      <PageContainer>
        <EmptyState
          description="Revisa el identificador o vuelve al listado de solicitudes."
          icon={<AlertCircle size={22} />}
          title="Solicitud no encontrada"
        />
      </PageContainer>
    )
  }

  const quote = freightQuotes.find((item) => item.id === request.quoteId)
  const customer = customers.find((item) => item.id === request.customerId || item.name === request.customerName)
  const customerPrice = getCustomerPriceForCargo(customer, request.cargoType)
  const priority = getFreightPriority(request)

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            {quote ? (
              <Link to={ROUTES.freightQuoteDetail(quote.id)}>
                <Button size="sm" variant="secondary">
                  Ver cotizacion
                </Button>
              </Link>
            ) : null}
            <Link to={ROUTES.freightAssignments}>
              <Button size="sm" variant="secondary">
                Asignaciones
              </Button>
            </Link>
          </div>
        }
        description={`${request.customerName} - ${priority.reason}`}
        title={request.requestNumber}
      />
      <FreightFlowStepper request={request} />
      <div className="two-column-grid">
        <div className="stack">
          <FreightRouteCard request={request} />
          {quote ? <FreightQuoteSummaryCard quote={quote} /> : <FreightQuoteCalculator request={request} />}
        </div>
        <div className="stack">
          <Card>
            <dl className="detail-list">
              <div>
                <dt>Estado</dt>
                <dd>
                  <FreightRequestStatusBadge status={request.status} />
                </dd>
              </div>
              <div>
                <dt>Prioridad</dt>
                <dd>
                  <FreightPriorityBadge request={request} />
                </dd>
              </div>
              <div>
                <dt>Telefono</dt>
                <dd>{request.customerPhone || 'Sin telefono'}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{request.customerEmail || 'Sin correo'}</dd>
              </div>
              <div>
                <dt>Retiro solicitado</dt>
                <dd>{request.requestedPickupDate ? formatDate(request.requestedPickupDate) : 'Por definir'}</dd>
              </div>
              <div>
                <dt>Espera</dt>
                <dd>{request.requiresWaitingTime ? `${request.waitingHours || 0} h` : 'No'}</dd>
              </div>
              <div>
                <dt>Ayuda carga</dt>
                <dd>{request.requiresLoadingHelp ? 'Si' : 'No'}</dd>
              </div>
              <div>
                <dt>Ayuda descarga</dt>
                <dd>{request.requiresUnloadingHelp ? 'Si' : 'No'}</dd>
              </div>
            </dl>
          </Card>
          {customer ? (
            <Card>
              <div className="stack">
                <SectionHeader
                  description="Condiciones del cliente usadas para decidir credito y tarifa."
                  title="Cliente asociado"
                />
                <dl className="detail-list">
                  <div>
                    <dt>Cliente</dt>
                    <dd>
                      <Link to={ROUTES.customerDetail(customer.id)}>{customer.name}</Link>
                    </dd>
                  </div>
                  <div>
                    <dt>Credito</dt>
                    <dd>
                      <CustomerCreditBadge customer={customer} />
                    </dd>
                  </div>
                  <div>
                    <dt>Tipo de flete</dt>
                    <dd>{CARGO_TYPE_LABELS[request.cargoType]}</dd>
                  </div>
                  <div>
                    <dt>Tarifa cliente</dt>
                    <dd>
                      {customerPrice
                        ? `${formatCurrency(customerPrice.baseRate)} + ${formatCurrency(customerPrice.kmRate)} / km`
                        : 'Tarifa general'}
                    </dd>
                  </div>
                </dl>
                <Link to={ROUTES.customers}>
                  <Button fullWidth size="sm" variant="secondary">
                    Gestionar cliente
                  </Button>
                </Link>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </PageContainer>
  )
}
