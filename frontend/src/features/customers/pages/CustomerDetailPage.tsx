import { Link, useParams, useSearchParams } from 'react-router-dom'
import { AlertCircle, Building2, Plus, Truck, Users } from 'lucide-react'
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
import { casesMock } from '../../../mocks/cases.mock'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import {
  CustomerAlertPanel,
  CustomerCommercialFinancePanel,
  CustomerDetailTabs,
  CustomerBillingPanel,
  CustomerExecutiveHeader,
  CustomerExecutiveReports,
  CustomerDocumentPanel,
  CustomerFreightControlTower,
  CustomerOperationalMap,
  CustomerOperationalTimelinePanel,
  CustomerQuotationPanel,
  CustomerRouteProfitabilityPanel,
  CustomerSummaryControlView,
} from '../components/CustomerLogisticsControlTower'
import type { CustomerDetailTab } from '../components/CustomerLogisticsControlTower'
import { CustomerActivityTimeline } from '../components/CustomerActivityTimeline'
import { CustomerCreditDecisionPanel } from '../components/CustomerCreditDecisionPanel'
import { CustomerOperationalPanels } from '../components/CustomerOperationalPanels'
import { CustomerPriceListTable } from '../components/CustomerPriceListTable'
import { customersMock } from '../mocks/customers.mock'
import type { Customer } from '../types/customer.types'
import { buildCustomer360Snapshot } from '../utils/customer360'
import { buildCustomerLogisticsIntelligence } from '../utils/customerLogistics'
import type { CustomerCreditQuoteReference } from '../utils/customerPricing'

const validCustomerDetailTabs = new Set<CustomerDetailTab>([
  'summary',
  'operation',
  'freights',
  'incidents',
  'profitability',
  'billing',
  'documents',
  'map',
  'analytics',
  'commercial',
])

export function CustomerDetailPage() {
  const { customerId } = useParams()
  const [searchParams] = useSearchParams()
  const activeTab = getCustomerDetailTab(searchParams.get('tab'))
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
  const intelligence = buildCustomerLogisticsIntelligence(snapshot)
  const creditQuoteReferences = buildCreditQuoteReferences(snapshot.freightQuotes, snapshot.workshopQuotes)

  return (
    <PageContainer>
      <PageHeader
        actions={
          <Link to={ROUTES.freightRequestNew}>
            <Button icon={<Plus size={18} />}>Nueva solicitud</Button>
          </Link>
        }
        description="Fletes, rutas, SLA, margen, riesgos y facturacion del cliente."
        title="Cliente logistico"
      >
        <CustomerDetailTabs activeTab={activeTab} customerId={customer.id} />
      </PageHeader>

      <CustomerExecutiveHeader
        activeTab={activeTab}
        customer={customer}
        intelligence={intelligence}
        snapshot={snapshot}
      />

      {activeTab === 'summary' ? (
        <CustomerSummaryControlView
          activeTab={activeTab}
          customer={customer}
          intelligence={intelligence}
          snapshot={snapshot}
        />
      ) : null}

      {activeTab === 'operation' ? (
        <div className="stack">
          <CustomerAlertPanel intelligence={intelligence} />
          <CustomerFreightControlTower intelligence={intelligence} />
          <CustomerOperationalMap intelligence={intelligence} />
          <CustomerOperationalTimelinePanel intelligence={intelligence} />
        </div>
      ) : null}

      {activeTab === 'freights' ? (
        <div className="stack">
          <MandanteCoordinationGuide customer={customer} />
          <CustomerFreightControlTower intelligence={intelligence} />
          <FreightRequestTable requests={snapshot.freightRequests} />
          <CustomerQuoteSection
            freightQuotes={snapshot.freightQuotes}
            workshopQuotes={snapshot.workshopQuotes}
          />
        </div>
      ) : null}

      {activeTab === 'incidents' ? (
        <div className="stack">
          <CustomerAlertPanel intelligence={intelligence} />
          <CustomerOperationalTimelinePanel intelligence={intelligence} />
          <CustomerActivityCard snapshot={snapshot} />
        </div>
      ) : null}

      {activeTab === 'profitability' ? (
        <div className="stack">
          <CustomerExecutiveReports intelligence={intelligence} />
          <CustomerRouteProfitabilityPanel intelligence={intelligence} />
          <CustomerProfitabilityTable items={snapshot.freightProfitability} />
        </div>
      ) : null}

      {activeTab === 'billing' ? (
        <div className="stack">
          <CustomerBillingPanel intelligence={intelligence} />
          <CustomerQuotationPanel intelligence={intelligence} />
          <CustomerCommercialFinancePanel customer={customer} snapshot={snapshot} />
          <CustomerBillingSection
            customer={customer}
            creditQuoteReferences={creditQuoteReferences}
          />
          <CustomerQuoteSection
            freightQuotes={snapshot.freightQuotes}
            workshopQuotes={snapshot.workshopQuotes}
          />
        </div>
      ) : null}

      {activeTab === 'documents' ? (
        <div className="stack">
          <CustomerDocumentPanel intelligence={intelligence} />
          <CustomerBillingPanel intelligence={intelligence} />
        </div>
      ) : null}

      {activeTab === 'map' ? (
        <div className="stack">
          <CustomerOperationalMap intelligence={intelligence} />
          <CustomerFreightControlTower intelligence={intelligence} />
        </div>
      ) : null}

      {activeTab === 'analytics' ? (
        <div className="stack">
          <CustomerExecutiveReports intelligence={intelligence} />
          <CustomerRouteProfitabilityPanel intelligence={intelligence} />
          <CustomerOperationalPanels snapshot={snapshot} />
        </div>
      ) : null}

      {activeTab === 'commercial' ? (
        <div className="stack">
          <CustomerCommercialFinancePanel customer={customer} snapshot={snapshot} />
          <CustomerBillingSection
            customer={customer}
            creditQuoteReferences={creditQuoteReferences}
          />
          <CustomerQuotationPanel intelligence={intelligence} />
        </div>
      ) : null}
    </PageContainer>
  )
}

function MandanteCoordinationGuide({ customer }: { customer: Customer }) {
  const mandante = customer.name || 'la empresa mandante'

  return (
    <Card>
      <details className="stack-tight">
        <summary
          style={{ alignItems: 'center', cursor: 'pointer', display: 'flex', fontWeight: 700, gap: 8 }}
        >
          <Users aria-hidden size={16} />
          Como coordinar la operacion con una empresa mandante (ej. CMPC)
        </summary>
        <div className="stack-tight" style={{ marginTop: 12 }}>
          <p className="muted-text">
            Cuando una empresa transportista se adjudica una licitacion de una empresa mandante —por ejemplo CMPC— no basta con
            tener camiones disponibles: debe organizar a su equipo para sostener el servicio en el tiempo y cumplir las condiciones
            del contrato. En esta ficha, {mandante} es ese cliente constante cuya operacion se gestiona desde aqui.
          </p>

          <div className="two-column-grid">
            <div className="surface-panel stack-tight">
              <strong style={{ alignItems: 'center', display: 'inline-flex', gap: 6 }}>
                <Truck aria-hidden size={15} /> Por parte de la transportista
              </strong>
              <p className="muted-text">
                Al adjudicarse la licitacion se asigna una persona fija o responsable principal de la cuenta: el punto unico de
                contacto con el cliente. Segun la empresa puede llamarse coordinador de operaciones, ejecutivo de cuenta,
                planificador de transporte, supervisor o jefe de operaciones. Sus funciones principales son:
              </p>
              <ul className="muted-text" style={{ margin: 0, paddingLeft: 18 }}>
                <li>Recibir los requerimientos de carga del cliente.</li>
                <li>Coordinar camiones y conductores.</li>
                <li>Planificar rutas y horarios.</li>
                <li>Hacer seguimiento de los viajes.</li>
                <li>Resolver contingencias (atrasos, fallas o incidencias).</li>
                <li>Mantener comunicacion constante con el encargado del mandante.</li>
              </ul>
            </div>

            <div className="surface-panel stack-tight">
              <strong style={{ alignItems: 'center', display: 'inline-flex', gap: 6 }}>
                <Building2 aria-hidden size={15} /> Por parte de la empresa mandante
              </strong>
              <p className="muted-text">
                Del lado del cliente suele existir un administrador de contrato o coordinador logistico, encargado de supervisar el
                cumplimiento del servicio: los indicadores (KPI, OTIF, SLA), los plazos y las condiciones pactadas en la licitacion.
              </p>
              <p className="muted-text">
                Ambos responsables —transportista y mandante— funcionan como contraparte directa: uno ejecuta y coordina la
                operacion; el otro controla que se cumpla lo comprometido.
              </p>
            </div>
          </div>

          <p className="muted-text">
            En esta vista, ese responsable concentra todos los fletes de {mandante} —solicitud, cotizacion, asignacion, carga,
            ruta, incidencias, documentos y facturacion— para gestionar la relacion en un solo lugar.
          </p>
        </div>
      </details>
    </Card>
  )
}

function CustomerQuoteSection({
  freightQuotes,
  workshopQuotes,
}: {
  freightQuotes: FreightQuote[]
  workshopQuotes: Quote[]
}) {
  return (
    <div className="two-column-grid">
      <Card>
        <div className="stack">
          <SectionHeader
            description="Cotizaciones de flete separadas de la ejecucion para distinguir lo cotizado vs lo operado."
            title="Cotizaciones de flete"
          />
          <Table
            columns={freightQuoteColumns}
            data={freightQuotes}
            density="compact"
            emptyDescription="Aun no hay cotizaciones de flete asociadas a este cliente."
            emptyLabel="Sin cotizaciones de flete"
            enableSearch
            getRowHref={(quote) => ROUTES.freightQuoteDetail(quote.id)}
            getRowKey={(quote) => quote.id}
            getRowLabel={(quote) => `Abrir cotizacion ${quote.quoteNumber}`}
            searchPlaceholder="Buscar cotizacion, carga, estado o monto"
          />
        </div>
      </Card>
      <Card>
        <div className="stack">
          <SectionHeader
            description="Cotizaciones de taller vinculadas por cliente o casos asociados."
            title="Cotizaciones de taller"
          />
          <Table
            columns={workshopQuoteColumns}
            data={workshopQuotes}
            density="compact"
            emptyDescription="Aun no hay cotizaciones de taller asociadas a este cliente."
            emptyLabel="Sin cotizaciones de taller"
            enableSearch
            getRowHref={(quote) => ROUTES.quoteDetail(quote.id)}
            getRowKey={(quote) => quote.id}
            getRowLabel={(quote) => `Abrir cotizacion ${quote.quoteNumber}`}
            searchPlaceholder="Buscar presupuesto, caso, estado o monto"
          />
        </div>
      </Card>
    </div>
  )
}

function CustomerBillingSection({
  creditQuoteReferences,
  customer,
}: {
  creditQuoteReferences: CustomerCreditQuoteReference[]
  customer: Customer
}) {
  return (
    <div className="two-column-grid">
      <Card>
        <div className="stack">
          <SectionHeader
            description="Tarifas comerciales usadas para cotizar fletes, con minimo, base, kilometro y descuento."
            title="Tarifas y acuerdos"
          />
          <CustomerPriceListTable priceList={customer.priceList} />
        </div>
      </Card>
      <Card>
        <CustomerCreditDecisionPanel
          customer={customer}
          quoteReferences={creditQuoteReferences}
          title="Credito, cupo y aprobaciones"
        />
      </Card>
    </div>
  )
}

function CustomerActivityCard({ snapshot }: { snapshot: ReturnType<typeof buildCustomer360Snapshot> }) {
  return (
    <Card>
      <div className="stack">
        <SectionHeader
          description="Actividad consolidada de fletes, taller, cotizaciones, planillas y comunicaciones."
          title="Actividad operacional"
        />
        <CustomerActivityTimeline items={snapshot.activity} />
      </div>
    </Card>
  )
}

function CustomerProfitabilityTable({ items }: { items: FreightProfitability[] }) {
  return (
    <Card>
      <div className="stack">
        <SectionHeader
          description="Cierres de rentabilidad por flete para detectar rutas buenas, rutas malas y sobrecostos."
          title="Rentabilidad por flete"
        />
        <Table
          columns={profitabilityColumns}
          data={items}
          density="compact"
          emptyDescription="No hay cierres de rentabilidad para este cliente."
          emptyLabel="Sin rentabilidad cerrada"
          enableSearch
          getRowHref={(item) => `${ROUTES.freightProfitability}?query=${encodeURIComponent(item.freightId)}`}
          getRowKey={(item) => item.id}
          getRowLabel={(item) => `Abrir rentabilidad ${item.freightId}`}
          searchPlaceholder="Buscar flete, camion, chofer, margen o costo"
        />
      </div>
    </Card>
  )
}

const freightQuoteColumns: TableColumn<FreightQuote>[] = [
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
]

const profitabilityColumns: TableColumn<FreightProfitability>[] = [
  {
    header: 'Flete',
    key: 'freightId',
    render: (item) => (
      <EntityLink id={item.freightId} type="freightRequest">
        {item.freightId}
      </EntityLink>
    ),
  },
  {
    header: 'Equipo',
    key: 'truckDriver',
    render: (item) => (
      <div>
        <EntityLink id={item.truckId} type="truck">{item.truckId}</EntityLink>
        <p className="muted-text">{item.driverId}</p>
      </div>
    ),
  },
  { align: 'right', header: 'Ingreso', key: 'revenue', render: (item) => formatCurrency(item.revenue), sortValue: (item) => item.revenue },
  { align: 'right', header: 'Costo', key: 'totalCost', render: (item) => formatCurrency(item.totalCost), sortValue: (item) => item.totalCost },
  { align: 'right', header: 'Margen', key: 'netMargin', render: (item) => formatCurrency(item.netMargin), sortValue: (item) => item.netMargin },
  {
    header: '% margen',
    key: 'marginPercentage',
    render: (item) => `${item.marginPercentage}%`,
    sortValue: (item) => item.marginPercentage,
  },
]

function buildCreditQuoteReferences(
  freightQuotes: FreightQuote[],
  workshopQuotes: Quote[],
): CustomerCreditQuoteReference[] {
  return [
    ...freightQuotes.map((quote) => ({
      customerId: quote.customerId,
      customerName: quote.customerName,
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      source: 'freight' as const,
      status: quote.status,
      total: quote.total,
    })),
    ...workshopQuotes.map((quote) => ({
      customerId: quote.customerId,
      customerName: quote.customerName,
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      source: 'workshop' as const,
      status: quote.status,
      total: quote.total,
    })),
  ]
}

function getCustomerDetailTab(value: string | null): CustomerDetailTab {
  return value && validCustomerDetailTabs.has(value as CustomerDetailTab) ? value as CustomerDetailTab : 'summary'
}
