import { Link, useParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { EntityLink } from '../../../shared/components/EntityLink'
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
import { FreightTimeline } from '../components/FreightTimeline'
import { freightAssignmentsMock, freightQuotesMock, freightRequestsMock } from '../mocks/freight.mock'
import type { FreightAssignment, FreightQuote } from '../types/freight.types'
import { getFreightRequestOperation } from '../utils/freightOperations'

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
  const { data: freightAssignments } = useResourceList<FreightAssignment>(
    '/freight/assignments',
    freightAssignmentsMock,
    { order: 'asc', sort: 'pickupDate' },
  )

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
  const assignment = freightAssignments.find((item) => item.requestId === request.id)
  const customer = customers.find((item) => item.id === request.customerId || item.name === request.customerName)
  const customerPrice = getCustomerPriceForCargo(customer, request.cargoType)
  const operation = getFreightRequestOperation(request, freightQuotes, freightAssignments)
  const priority = operation.priority

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
        title={
          <EntityLink id={request.id} type="freightRequest">
            {request.requestNumber}
          </EntityLink>
        }
      />
      <FreightFlowStepper assignment={assignment} quote={quote} request={request} showStageMeta />
      <div className="two-column-grid">
        <div className="stack">
          <FreightRouteCard request={request} />
          {quote ? <FreightQuoteSummaryCard quote={quote} /> : <FreightQuoteCalculator request={request} />}
          <FreightTimeline operation={operation} />
        </div>
        <div className="stack">
          <Card>
            <div className="stack">
              <SectionHeader
                description={operation.nextStep.description}
                title={`Proximo paso: ${operation.nextStep.label}`}
              />
              <Link to={operation.nextStep.path}>
                <Button fullWidth size="sm">
                  {operation.nextStep.actionLabel}
                </Button>
              </Link>
            </div>
          </Card>
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
                <dt>Responsable</dt>
                <dd>{operation.responsible}</dd>
              </div>
              <div>
                <dt>SLA / riesgo</dt>
                <dd>{operation.risk.detail}</dd>
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
                      <EntityLink id={customer.id} type="customer">
                        {customer.name}
                      </EntityLink>
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
