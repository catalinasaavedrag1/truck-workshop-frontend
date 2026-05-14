import { Link, useParams } from 'react-router-dom'
import { AlertCircle, Plus } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { EntityLink } from '../../../shared/components/EntityLink'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { useResourceItem } from '../../../shared/hooks/useResourceItem'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { formatRut } from '../../../shared/utils/rut'
import { communicationConversationsMock, communicationQuoteLinksMock } from '../../communications/mocks/communications.mock'
import type { CommunicationConversation, CommunicationQuoteLink } from '../../communications/types/communication.types'
import { driverTripSheetsMock } from '../../driver-trip-sheets/mocks/driverTripSheets.mock'
import type { DriverTripSheet } from '../../driver-trip-sheets/types/driverTripSheet.types'
import { CARGO_TYPE_LABELS } from '../../freight/constants/cargoType.constants'
import { FreightRequestStatusBadge } from '../../freight/components/FreightRequestStatusBadge'
import { FreightRequestTable } from '../../freight/components/FreightRequestTable'
import { freightAssignmentsMock, freightQuotesMock, freightRequestsMock } from '../../freight/mocks/freight.mock'
import type { FreightAssignment, FreightQuote, FreightRequest } from '../../freight/types/freight.types'
import { freightProfitabilityMock } from '../../freight-profitability/mocks/freightProfitability.mock'
import type { FreightProfitability } from '../../freight-profitability/types/freightProfitability.types'
import { QuoteStatusBadge } from '../../quotes/components/QuoteStatusBadge'
import { quotesMock } from '../../quotes/mocks/quotes.mock'
import type { Quote } from '../../quotes/types/quote.types'
import { CaseStatusBadge } from '../../workshop-cases/components/CaseStatusBadge'
import { casesMock } from '../../../mocks/cases.mock'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import { Customer360Overview } from '../components/Customer360Overview'
import { CustomerCreditBadge } from '../components/CustomerCreditBadge'
import { CustomerCreditDecisionPanel } from '../components/CustomerCreditDecisionPanel'
import { CustomerOperationalPanels } from '../components/CustomerOperationalPanels'
import { CustomerPriceListTable } from '../components/CustomerPriceListTable'
import { CustomerStatusBadge } from '../components/CustomerStatusBadge'
import { customersMock } from '../mocks/customers.mock'
import type { Customer } from '../types/customer.types'
import { buildCustomer360Snapshot } from '../utils/customer360'
import { getCreditUsagePercent } from '../utils/customerPricing'
import type { CustomerCreditQuoteReference } from '../utils/customerPricing'

export function CustomerDetailPage() {
  const { customerId } = useParams()
  const { data: customer } = useResourceItem<Customer>('/customers', customerId, customersMock)
  const { data: workshopCases } = useResourceList<WorkshopCase>('/cases', casesMock, {
    order: 'desc',
    sort: 'updatedAt',
  })
  const { data: freightRequests } = useResourceList<FreightRequest>('/freight/requests', freightRequestsMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: freightQuotes } = useResourceList<FreightQuote>('/freight/quotes', freightQuotesMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: workshopQuotes } = useResourceList<Quote>('/quotes', quotesMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: conversations } = useResourceList<CommunicationConversation>(
    '/communications/conversations',
    communicationConversationsMock,
    {
      order: 'desc',
      sort: 'lastMessageAt',
    },
  )
  const { data: quoteLinks } = useResourceList<CommunicationQuoteLink>(
    '/communications/quote-links',
    communicationQuoteLinksMock,
  )
  const { data: freightAssignments } = useResourceList<FreightAssignment>('/freight/assignments', freightAssignmentsMock)
  const { data: tripSheets } = useResourceList<DriverTripSheet>('/driver-trip-sheets', driverTripSheetsMock)
  const { data: freightProfitability } = useResourceList<FreightProfitability>(
    '/freight-profitability',
    freightProfitabilityMock,
  )

  if (!customer) {
    return (
      <PageContainer>
        <EmptyState
          description="Revisa el identificador o vuelve al listado de clientes."
          icon={<AlertCircle size={22} />}
          title="Cliente no encontrado"
        />
      </PageContainer>
    )
  }

  const snapshot = buildCustomer360Snapshot({
    conversations,
    customer,
    freightAssignments,
    freightProfitability,
    freightQuotes,
    freightRequests,
    quoteLinks,
    tripSheets,
    workshopCases,
    workshopQuotes,
  })
  const relatedRequests = snapshot.freightRequests
  const relatedFreightQuotes = snapshot.freightQuotes
  const relatedWorkshopQuotes = snapshot.workshopQuotes
  const creditQuoteReferences: CustomerCreditQuoteReference[] = [
    ...relatedFreightQuotes.map((quote) => ({
      customerId: quote.customerId,
      customerName: quote.customerName,
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      source: 'freight' as const,
      status: quote.status,
      total: quote.total,
    })),
    ...relatedWorkshopQuotes.map((quote) => ({
      customerId: quote.customerId,
      customerName: quote.customerName,
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      source: 'workshop' as const,
      status: quote.status,
      total: quote.total,
    })),
  ]
  const quoteColumns: TableColumn<FreightQuote>[] = [
    {
      header: 'Cotizacion',
      key: 'quoteNumber',
      render: (quote) => (
        <div>
          <EntityLink id={quote.id} type="freightQuote">
            {quote.quoteNumber}
          </EntityLink>
          <p className="muted-text">{CARGO_TYPE_LABELS[quote.cargoType]}</p>
        </div>
      ),
    },
    { align: 'right', header: 'KM', key: 'estimatedKm', render: (quote) => `${quote.estimatedKm.toLocaleString('es-CL')} km` },
    { align: 'right', header: 'Total', key: 'total', render: (quote) => formatCurrency(quote.total) },
    { header: 'Estado', key: 'status', render: (quote) => <FreightRequestStatusBadge status={quote.status} type="quote" /> },
    { header: 'Valida hasta', key: 'validUntil', render: (quote) => formatDate(quote.validUntil) },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (quote) => (
        <Link to={ROUTES.freightQuoteDetail(quote.id)}>
          <Button size="sm" variant="secondary">
            Ver
          </Button>
        </Link>
      ),
    },
  ]
  const workshopQuoteColumns: TableColumn<Quote>[] = [
    {
      header: 'Cotizacion',
      key: 'quoteNumber',
      render: (quote) => (
        <div>
          <EntityLink id={quote.id} type="quote">
            {quote.quoteNumber}
          </EntityLink>
          <p className="muted-text">{quote.caseNumber}</p>
        </div>
      ),
    },
    { header: 'Diagnostico', key: 'diagnosisSummary', render: (quote) => quote.diagnosisSummary },
    { align: 'right', header: 'Total', key: 'total', render: (quote) => formatCurrency(quote.total) },
    { header: 'Estado', key: 'status', render: (quote) => <QuoteStatusBadge status={quote.status} /> },
    { header: 'Expira', key: 'expiresAt', render: (quote) => formatDate(quote.expiresAt) },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (quote) => (
        <Link to={ROUTES.quoteDetail(quote.id)}>
          <Button size="sm" variant="secondary">
            Ver
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        actions={
          <Link to={ROUTES.freightRequestNew}>
            <Button icon={<Plus size={18} />}>Nueva solicitud</Button>
          </Link>
        }
        description={`${customer.contactName || 'Sin contacto'} - ${customer.phone || 'sin telefono'} - ficha 360 comercial, taller y fletes`}
        title={customer.name}
      />
      <Customer360Overview snapshot={snapshot} />
      <div className="two-column-grid">
        <div className="stack">
          <Card>
            <div className="stack">
              <SectionHeader
                description="Condiciones comerciales que afectan solicitudes, cotizaciones y aprobaciones de flete."
                title="Condicion comercial"
              />
              <div className="three-column-grid compact-grid">
                <div className="surface-panel">
                  <p className="muted-text">Credito</p>
                  <strong>{customer.creditEnabled ? `${getCreditUsagePercent(customer)}% usado` : 'Sin credito'}</strong>
                  <p className="muted-text">{customer.creditEnabled ? <CustomerCreditBadge customer={customer} /> : 'Pago anticipado o contado'}</p>
                </div>
                <div className="surface-panel">
                  <p className="muted-text">Plazo de pago</p>
                  <strong>{customer.paymentTermsDays || 0} dias</strong>
                  <p className="muted-text">{customer.creditEnabled ? 'Cuenta corriente activa' : 'Sin cuenta corriente'}</p>
                </div>
                <div className="surface-panel">
                  <p className="muted-text">Estado</p>
                  <CustomerStatusBadge status={customer.status} />
                  <p className="muted-text">Riesgo {customer.riskLevel}</p>
                </div>
                <div className="surface-panel">
                  <p className="muted-text">Taller abierto</p>
                  <strong>{snapshot.metrics.openWorkshopCases}</strong>
                  <p className="muted-text">
                    {snapshot.workshopCases[0] ? <CaseStatusBadge status={snapshot.workshopCases[0].status} /> : 'Sin casos'}
                  </p>
                </div>
              </div>
              <CustomerCreditDecisionPanel customer={customer} quoteReferences={creditQuoteReferences} title="Credito y cotizaciones vigentes" />
            </div>
          </Card>
          <Card>
            <div className="stack">
              <SectionHeader
                description="Tarifas por tipo de carga usadas como referencia comercial al crear solicitudes y cotizaciones."
                title="Lista de precios"
              />
              <CustomerPriceListTable priceList={customer.priceList} />
            </div>
          </Card>
          <Card>
            <div className="stack">
              <SectionHeader
                description="Solicitudes vinculadas por cliente para ver continuidad operacional y estado del flujo."
                title="Solicitudes asociadas"
              />
              <FreightRequestTable requests={relatedRequests} />
            </div>
          </Card>
        </div>
        <div className="stack">
          <Card>
            <dl className="detail-list">
              <div>
                <dt>RUT</dt>
                <dd>{formatRut(customer.rut) || 'Sin RUT'}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{customer.email || 'Sin correo'}</dd>
              </div>
              <div>
                <dt>Facturacion</dt>
                <dd>{customer.billingAddress || 'Sin direccion'}</dd>
              </div>
              <div>
                <dt>Origenes</dt>
                <dd>{customer.preferredOrigins.join(', ') || 'Sin origenes'}</dd>
              </div>
              <div>
                <dt>Destinos</dt>
                <dd>{customer.preferredDestinations.join(', ') || 'Sin destinos'}</dd>
              </div>
              <div>
                <dt>Tipos de flete</dt>
                <dd>{customer.freightTypes.map((type) => CARGO_TYPE_LABELS[type]).join(', ')}</dd>
              </div>
              <div>
                <dt>Creado por</dt>
                <dd>{customer.createdBy || 'Sistema'}</dd>
              </div>
              <div>
                <dt>Ultima modificacion</dt>
                <dd>{customer.updatedBy || 'Sistema'}</dd>
              </div>
            </dl>
          </Card>
          <Card>
            <div className="stack">
              <SectionHeader
                description="Cotizaciones del cliente con monto, vigencia y decision."
                title="Cotizaciones"
              />
              <Table
                columns={quoteColumns}
                data={relatedFreightQuotes}
                density="compact"
                emptyDescription="Aun no hay cotizaciones de flete asociadas a este cliente."
                emptyLabel="Sin cotizaciones de flete"
                getRowHref={(quote) => ROUTES.freightQuoteDetail(quote.id)}
                getRowKey={(quote) => quote.id}
                getRowLabel={(quote) => `Abrir cotizacion ${quote.quoteNumber}`}
              />
              <SectionHeader
                description="Cotizaciones de taller asociadas por nombre de cliente hasta que el caso consolide customerId."
                title="Cotizaciones de taller"
              />
              <Table
                columns={workshopQuoteColumns}
                data={relatedWorkshopQuotes}
                density="compact"
                emptyDescription="Aun no hay cotizaciones de taller asociadas a este cliente."
                emptyLabel="Sin cotizaciones de taller"
                getRowHref={(quote) => ROUTES.quoteDetail(quote.id)}
                getRowKey={(quote) => quote.id}
                getRowLabel={(quote) => `Abrir cotizacion ${quote.quoteNumber}`}
              />
            </div>
          </Card>
        </div>
      </div>
      <CustomerOperationalPanels snapshot={snapshot} />
    </PageContainer>
  )
}
