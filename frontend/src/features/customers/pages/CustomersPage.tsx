import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Tabs } from '../../../shared/components/Tabs/Tabs'
import {
  Activity,
  BarChart3,
  Building2,
  CircleDollarSign,
  CreditCard,
  MessageCircle,
  Plus,
  Route,
  ShieldCheck,
  Tags,
  UserPlus,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ConfirmModal } from '../../../shared/components/ConfirmModal/ConfirmModal'
import { EntityLink } from '../../../shared/components/EntityLink'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { FilterBar } from '../../../shared/components/FilterBar/FilterBar'
import { Input } from '../../../shared/components/Input/Input'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { Select } from '../../../shared/components/Select/Select'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { getRutSearchText } from '../../../shared/utils/rut'
import { casesMock } from '../../../mocks/cases.mock'
import { communicationConversationsMock, communicationQuoteLinksMock } from '../../communications/mocks/communications.mock'
import type { CommunicationConversation, CommunicationQuoteLink } from '../../communications/types/communication.types'
import { driverTripSheetsMock } from '../../driver-trip-sheets/mocks/driverTripSheets.mock'
import type { DriverTripSheet } from '../../driver-trip-sheets/types/driverTripSheet.types'
import { CARGO_TYPE_LABELS, CARGO_TYPE_OPTIONS } from '../../freight/constants/cargoType.constants'
import { freightAssignmentsMock, freightQuotesMock, freightRequestsMock } from '../../freight/mocks/freight.mock'
import type { CargoType, FreightAssignment, FreightQuote, FreightRequest } from '../../freight/types/freight.types'
import { freightProfitabilityMock } from '../../freight-profitability/mocks/freightProfitability.mock'
import type { FreightProfitability } from '../../freight-profitability/types/freightProfitability.types'
import { quotesMock } from '../../quotes/mocks/quotes.mock'
import type { Quote } from '../../quotes/types/quote.types'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import { CustomerCreditBadge } from '../components/CustomerCreditBadge'
import { CustomerForm } from '../components/CustomerForm'
import { CustomerPortfolioSignals } from '../components/CustomerPortfolioSignals'
import { CustomerStatusBadge } from '../components/CustomerStatusBadge'
import { CustomerSummaryCards } from '../components/CustomerSummaryCards'
import { CustomerTable } from '../components/CustomerTable'
import { CREDIT_FILTER_OPTIONS, CUSTOMER_RISK_LABELS, CUSTOMER_RISK_OPTIONS, CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_OPTIONS } from '../constants/customer.constants'
import { customersMock } from '../mocks/customers.mock'
import { deleteCustomer } from '../services/customers.service'
import type { Customer, CustomerPriceListItem, CustomerRiskLevel, CustomerStatus } from '../types/customer.types'
import { buildCustomer360Snapshot } from '../utils/customer360'
import type { Customer360Snapshot } from '../utils/customer360'

type CreditFilter = 'all' | 'with-credit' | 'without-credit'
type CustomerModuleView =
  | 'dashboard'
  | 'portfolio'
  | 'credit'
  | 'pricing'
  | 'operations'
  | 'communications'
  | 'profitability'
  | 'create'

interface CustomerAlertRow {
  action: string
  id: string
  impact: string
  label: string
  message: string
  snapshot: Customer360Snapshot
  tone: BadgeTone
}

interface CustomerPricingRow {
  customer: Customer
  id: string
  price: CustomerPriceListItem
}

interface CustomerCommunicationRow {
  conversation: CommunicationConversation
  id: string
  snapshot: Customer360Snapshot
}

const customerModuleViews: Array<{
  description: string
  icon: LucideIcon
  id: CustomerModuleView
  label: string
}> = [
  { description: 'Riesgo, cartera y acciones del dia.', icon: Activity, id: 'dashboard', label: 'Panel' },
  { description: 'Directorio comercial y gestion de ficha.', icon: Building2, id: 'portfolio', label: 'Cartera' },
  { description: 'Cupo, bloqueo, cobranza y exposicion.', icon: ShieldCheck, id: 'credit', label: 'Credito' },
  { description: 'Tarifas por cliente y tipo de flete.', icon: Tags, id: 'pricing', label: 'Tarifas' },
  { description: 'Taller, fletes y ejecucion vinculada.', icon: Route, id: 'operations', label: 'Operaciones' },
  { description: 'Conversaciones y seguimiento comercial.', icon: MessageCircle, id: 'communications', label: 'Comunicaciones' },
  { description: 'Ingresos, margen y cartera rentable.', icon: BarChart3, id: 'profitability', label: 'Rentabilidad' },
  { description: 'Alta o edicion de condiciones.', icon: UserPlus, id: 'create', label: 'Nuevo / editar' },
]

const validCustomerViews = new Set<CustomerModuleView>(customerModuleViews.map((view) => view.id))

const conversationStatusTone: Record<CommunicationConversation['status'], BadgeTone> = {
  archived: 'neutral',
  open: 'info',
  pending: 'warning',
  resolved: 'success',
}

const conversationPriorityTone: Record<CommunicationConversation['priority'], BadgeTone> = {
  high: 'warning',
  low: 'neutral',
  medium: 'info',
  urgent: 'danger',
}

export function CustomersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeView = getCustomerModuleView(searchParams.get('view'))
  const [savedCustomers, setSavedCustomers] = useState<Customer[]>([])
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerPendingDeletion, setCustomerPendingDeletion] = useState<Customer | null>(null)
  const [deletingId, setDeletingId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [query, setQuery] = useState(searchParams.get('query') || '')
  const status = getStatusFilter(searchParams.get('status'))
  const [riskLevel, setRiskLevel] = useState<CustomerRiskLevel | 'all'>('all')
  const [creditFilter, setCreditFilter] = useState<CreditFilter>('all')
  const [cargoType, setCargoType] = useState<CargoType | 'all'>('all')
  const { data: customersData, isLoading } = useResourceList<Customer>('/customers', customersMock, {
    order: 'asc',
    sort: 'name',
  })
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

  const setModuleView = (nextView: CustomerModuleView) => {
    const nextParams = new URLSearchParams(searchParams)

    if (nextView === 'dashboard') {
      nextParams.delete('view')
    } else {
      nextParams.set('view', nextView)
    }

    setSearchParams(nextParams)
  }

  const setStatusFilter = (nextStatus: CustomerStatus | 'all') => {
    const nextParams = new URLSearchParams(searchParams)

    if (nextStatus === 'all') {
      nextParams.delete('status')
    } else {
      nextParams.set('status', nextStatus)
    }

    setSearchParams(nextParams)
  }

  const customers = useMemo(() => {
    const savedById = new Map(savedCustomers.map((customer) => [customer.id, customer]))

    return [
      ...customersData.filter((customer) => !deletedIds.includes(customer.id) && !savedById.has(customer.id)),
      ...savedCustomers.filter((customer) => !deletedIds.includes(customer.id)),
    ].sort((first, second) => first.name.localeCompare(second.name))
  }, [customersData, deletedIds, savedCustomers])

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return customers.filter((customer) => {
      const searchable = [
        customer.name,
        getRutSearchText(customer.rut),
        customer.contactName || '',
        customer.phone || '',
        customer.email || '',
        customer.billingAddress || '',
        customer.preferredOrigins.join(' '),
        customer.preferredDestinations.join(' '),
        customer.freightTypes.map((type) => CARGO_TYPE_LABELS[type]).join(' '),
      ].join(' ').toLowerCase()
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery)
      const matchesStatus = status === 'all' || customer.status === status
      const matchesRisk = riskLevel === 'all' || customer.riskLevel === riskLevel
      const matchesCredit =
        creditFilter === 'all' ||
        (creditFilter === 'with-credit' && customer.creditEnabled) ||
        (creditFilter === 'without-credit' && !customer.creditEnabled)
      const matchesCargo = cargoType === 'all' || customer.freightTypes.includes(cargoType)

      return matchesQuery && matchesStatus && matchesRisk && matchesCredit && matchesCargo
    })
  }, [cargoType, creditFilter, customers, query, riskLevel, status])

  const customerSnapshots = useMemo(
    () =>
      customers.map((customer) =>
        buildCustomer360Snapshot({
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
        }),
      ),
    [
      conversations,
      customers,
      freightAssignments,
      freightProfitability,
      freightQuotes,
      freightRequests,
      quoteLinks,
      tripSheets,
      workshopCases,
      workshopQuotes,
    ],
  )

  const filteredSnapshots = useMemo(() => {
    const customerIds = new Set(filteredCustomers.map((customer) => customer.id))

    return customerSnapshots.filter((snapshot) => customerIds.has(snapshot.customer.id))
  }, [customerSnapshots, filteredCustomers])

  const alertRows = useMemo(() => buildCustomerAlertRows(filteredSnapshots), [filteredSnapshots])
  const pricingRows = useMemo(() => buildCustomerPricingRows(filteredCustomers), [filteredCustomers])
  const communicationRows = useMemo(() => buildCustomerCommunicationRows(filteredSnapshots), [filteredSnapshots])

  const handleSaved = (customer: Customer) => {
    setSavedCustomers((current) => [
      customer,
      ...current.filter((item) => item.id !== customer.id),
    ])
    setDeletedIds((current) => current.filter((id) => id !== customer.id))
    setSelectedCustomer(null)
    setErrorMessage('')
    setModuleView('portfolio')
  }

  const handleDelete = async (customer: Customer) => {
    setCustomerPendingDeletion(customer)
  }

  const openCustomerEditor = (customer: Customer) => {
    setSelectedCustomer(customer)
    setModuleView('create')
  }

  const openNewCustomer = () => {
    setSelectedCustomer(null)
    setModuleView('create')
  }

  const cancelCustomerEditor = () => {
    setSelectedCustomer(null)
    setModuleView('portfolio')
  }

  const confirmDelete = async () => {
    if (!customerPendingDeletion) {
      return
    }

    setDeletingId(customerPendingDeletion.id)
    setErrorMessage('')

    try {
      await deleteCustomer(customerPendingDeletion.id)
      setDeletedIds((current) => Array.from(new Set([...current, customerPendingDeletion.id])))
      setSelectedCustomer((current) => (current?.id === customerPendingDeletion.id ? null : current))
      setCustomerPendingDeletion(null)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setDeletingId('')
    }
  }

  const activeFilters = [
    ...(query ? [{ label: 'Busqueda', onRemove: () => setQuery(''), value: query }] : []),
    ...(status !== 'all'
      ? [{ label: 'Estado', onRemove: () => setStatusFilter('all'), value: CUSTOMER_STATUS_LABELS[status] }]
      : []),
    ...(riskLevel !== 'all'
      ? [{ label: 'Riesgo', onRemove: () => setRiskLevel('all'), value: CUSTOMER_RISK_LABELS[riskLevel] }]
      : []),
    ...(creditFilter !== 'all'
      ? [{
          label: 'Credito',
          onRemove: () => setCreditFilter('all'),
          value: CREDIT_FILTER_OPTIONS.find((option) => option.value === creditFilter)?.label,
        }]
      : []),
    ...(cargoType !== 'all'
      ? [{ label: 'Flete', onRemove: () => setCargoType('all'), value: CARGO_TYPE_LABELS[cargoType] }]
      : []),
  ]

  const filterBar = (
    <CustomerFilterBar
      activeFilters={activeFilters}
      cargoType={cargoType}
      creditFilter={creditFilter}
      query={query}
      riskLevel={riskLevel}
      setCargoType={setCargoType}
      setCreditFilter={setCreditFilter}
      setQuery={setQuery}
      setRiskLevel={setRiskLevel}
      setStatus={setStatusFilter}
      status={status}
    />
  )

  const viewContent = (() => {
    switch (activeView) {
      case 'portfolio':
        return (
          <CustomerPortfolioView
            deletingId={deletingId}
            filterBar={filterBar}
            filteredCustomers={filteredCustomers}
            isLoading={isLoading}
            onDelete={handleDelete}
            onEdit={openCustomerEditor}
          />
        )
      case 'credit':
        return (
          <>
            {filterBar}
            <CustomerCreditView snapshots={filteredSnapshots} />
          </>
        )
      case 'pricing':
        return (
          <>
            {filterBar}
            <CustomerPricingView onEditCustomer={openCustomerEditor} rows={pricingRows} />
          </>
        )
      case 'operations':
        return (
          <>
            {filterBar}
            <CustomerOperationsView snapshots={filteredSnapshots} />
          </>
        )
      case 'communications':
        return (
          <>
            {filterBar}
            <CustomerCommunicationsView rows={communicationRows} />
          </>
        )
      case 'profitability':
        return (
          <>
            {filterBar}
            <CustomerProfitabilityView snapshots={filteredSnapshots} />
          </>
        )
      case 'create':
        return (
          <CustomerEditorView
            customer={selectedCustomer}
            onCancel={cancelCustomerEditor}
            onSaved={handleSaved}
          />
        )
      case 'dashboard':
      default:
        return (
          <CustomerDashboardView
            alertRows={alertRows}
            customers={customers}
            snapshots={customerSnapshots}
          />
        )
    }
  })()

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            <Link to={ROUTES.freightRequestNew}>
              <Button icon={<Plus size={18} />} variant="secondary">
                Nueva solicitud
              </Button>
            </Link>
            <Button icon={<UserPlus size={18} />} onClick={openNewCustomer} type="button">
              Nuevo cliente
            </Button>
          </div>
        }
        description="Cartera, credito, tarifas, fletes y rentabilidad por cliente."
        title="Clientes"
      >
        <CustomerModuleNav activeView={activeView} />
      </PageHeader>
      {errorMessage ? <ErrorState description={errorMessage} title="No se pudo desactivar el cliente" /> : null}
      {viewContent}
      <ConfirmModal
        confirmLabel="Desactivar cliente"
        description={
          customerPendingDeletion
            ? `El cliente ${customerPendingDeletion.name} dejara de estar disponible para nuevas operaciones.`
            : undefined
        }
        isConfirming={Boolean(deletingId)}
        onCancel={() => setCustomerPendingDeletion(null)}
        onConfirm={confirmDelete}
        open={Boolean(customerPendingDeletion)}
        title="Desactivar cliente"
        tone="danger"
      />
    </PageContainer>
  )
}

function CustomerModuleNav({ activeView }: { activeView: CustomerModuleView }) {
  const items = customerModuleViews.map((view) => {
    const Icon = view.icon

    return { icon: <Icon aria-hidden size={16} />, id: view.id, label: view.label, to: getCustomerViewPath(view.id) }
  })

  return <Tabs activeId={activeView} ariaLabel="Modulo de clientes" items={items} />
}

function CustomerDashboardView({
  alertRows,
  customers,
  snapshots,
}: {
  alertRows: CustomerAlertRow[]
  customers: Customer[]
  snapshots: Customer360Snapshot[]
}) {
  const pipelineTotal = snapshots.reduce((total, snapshot) => total + snapshot.metrics.pipelineTotal, 0)
  const openCommunications = snapshots.reduce((total, snapshot) => total + snapshot.metrics.openCommunications, 0)
  const pendingQuotes = snapshots.reduce((total, snapshot) => total + snapshot.metrics.pendingQuotes, 0)
  const highPriorityAlerts = alertRows.filter((row) => row.tone === 'danger' || row.tone === 'warning').length

  return (
    <div className="stack">
      <CustomerSummaryCards customers={customers} />
      <div className="two-column-grid">
        <Card>
          <div className="stack">
            <SectionHeader
              description="Clientes ordenados por riesgo, operaciones activas, pipeline y actividad reciente."
              title="Centro de control de clientes"
            />
            <CustomerPortfolioSignals snapshots={snapshots} />
          </div>
        </Card>
        <Card>
          <div className="stack">
            <SectionHeader
              description="Acciones directas para operar cartera sin saltar entre modulos."
              title="Acciones rapidas"
            />
            <div className="two-column-grid compact-grid">
              <CustomerActionPanel
                helper={`${highPriorityAlerts} alertas con impacto comercial u operacional`}
                icon={<ShieldCheck size={18} />}
                label="Revisar riesgos"
                to={getCustomerViewPath('credit')}
              />
              <CustomerActionPanel
                helper={`${pendingQuotes} cotizaciones pendientes por cliente`}
                icon={<CreditCard size={18} />}
                label="Validar credito"
                to={getCustomerViewPath('credit')}
              />
              <CustomerActionPanel
                helper={formatCurrency(pipelineTotal)}
                icon={<CircleDollarSign size={18} />}
                label="Pipeline comercial"
                to={getCustomerViewPath('profitability')}
              />
              <CustomerActionPanel
                helper={`${openCommunications} conversaciones abiertas`}
                icon={<MessageCircle size={18} />}
                label="Seguir clientes"
                to={getCustomerViewPath('communications')}
              />
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <div className="stack">
          <SectionHeader
            description="Cada alerta explica que pasa, por que importa y cual es la siguiente accion."
            title="Alertas y bloqueos de cartera"
          />
          <Table
            columns={alertColumns}
            data={alertRows}
            density="compact"
            emptyDescription="La cartera no tiene alertas comerciales u operacionales relevantes."
            emptyLabel="Sin alertas de clientes"
            enableSearch
            getRowHref={(row) => ROUTES.customerDetail(row.snapshot.customer.id)}
            getRowKey={(row) => row.id}
            getRowLabel={(row) => `Abrir cliente ${row.snapshot.customer.name}`}
            pageSize={8}
            searchPlaceholder="Buscar alerta, cliente, impacto o accion"
          />
        </div>
      </Card>
    </div>
  )
}

function CustomerPortfolioView({
  deletingId,
  filterBar,
  filteredCustomers,
  isLoading,
  onDelete,
  onEdit,
}: {
  deletingId: string
  filterBar: ReactNode
  filteredCustomers: Customer[]
  isLoading: boolean
  onDelete: (customer: Customer) => void
  onEdit: (customer: Customer) => void
}) {
  return (
    <div className="stack">
      {filterBar}
      <Card>
        <div className="stack">
          <SectionHeader
            description="Directorio con ficha 360 y edicion de condiciones."
            title="Cartera de clientes"
          />
          <CustomerTable
            customers={filteredCustomers}
            deletingId={deletingId}
            isLoading={isLoading}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      </Card>
    </div>
  )
}

function CustomerCreditView({ snapshots }: { snapshots: Customer360Snapshot[] }) {
  return (
    <Card>
      <div className="stack">
        <SectionHeader
          description="Cupo, exposicion, pipeline y riesgo antes de aprobar."
          title="Credito y riesgo"
        />
        <Table
          columns={creditColumns}
          data={snapshots}
          density="compact"
          emptyDescription="No hay clientes para revisar con los filtros actuales."
          emptyLabel="Sin clientes filtrados"
          enableSearch
          getRowHref={(snapshot) => ROUTES.customerDetail(snapshot.customer.id)}
          getRowKey={(snapshot) => snapshot.customer.id}
          getRowLabel={(snapshot) => `Abrir credito de ${snapshot.customer.name}`}
          searchPlaceholder="Buscar cliente, riesgo, estado o condicion"
        />
      </div>
    </Card>
  )
}

function CustomerPricingView({
  onEditCustomer,
  rows,
}: {
  onEditCustomer: (customer: Customer) => void
  rows: CustomerPricingRow[]
}) {
  const columns = useMemo(() => getPricingColumns(onEditCustomer), [onEditCustomer])

  return (
    <Card>
      <div className="stack">
        <SectionHeader
          description="Tarifas por cliente para fletes y cotizaciones."
          title="Tarifas comerciales por cliente"
        />
        <Table
          columns={columns}
          data={rows}
          density="compact"
          emptyDescription="No hay tarifas configuradas para los clientes filtrados."
          emptyLabel="Sin tarifas"
          enableSearch
          getRowHref={(row) => ROUTES.customerDetail(row.customer.id)}
          getRowKey={(row) => row.id}
          getRowLabel={(row) => `Abrir tarifa de ${row.customer.name}`}
          searchPlaceholder="Buscar cliente, tipo de flete, notas o tarifa"
        />
      </div>
    </Card>
  )
}

function CustomerOperationsView({ snapshots }: { snapshots: Customer360Snapshot[] }) {
  return (
    <Card>
      <div className="stack">
        <SectionHeader
          description="Que clientes tienen trabajo activo en taller y fletes."
          title="Operaciones por cliente"
        />
        <Table
          columns={operationsColumns}
          data={snapshots}
          density="compact"
          emptyDescription="No hay operaciones asociadas a los clientes filtrados."
          emptyLabel="Sin operaciones"
          enableSearch
          getRowHref={(snapshot) => ROUTES.customerDetail(snapshot.customer.id)}
          getRowKey={(snapshot) => snapshot.customer.id}
          getRowLabel={(snapshot) => `Abrir operaciones de ${snapshot.customer.name}`}
          searchPlaceholder="Buscar cliente, caso, flete o actividad"
        />
      </div>
    </Card>
  )
}

function CustomerCommunicationsView({ rows }: { rows: CustomerCommunicationRow[] }) {
  return (
    <Card>
      <div className="stack">
        <SectionHeader
          description="Conversaciones conectadas a clientes para seguimiento comercial y operacional."
          title="Comunicaciones de clientes"
        />
        <Table
          columns={communicationColumns}
          data={rows}
          density="compact"
          emptyDescription="No hay conversaciones asociadas a los clientes filtrados."
          emptyLabel="Sin comunicaciones"
          enableSearch
          getRowHref={(row) => `${ROUTES.communications}?query=${encodeURIComponent(row.conversation.subject)}`}
          getRowKey={(row) => row.id}
          getRowLabel={(row) => `Abrir conversacion ${row.conversation.subject}`}
          searchPlaceholder="Buscar cliente, asunto, canal, contacto o prioridad"
        />
      </div>
    </Card>
  )
}

function CustomerProfitabilityView({ snapshots }: { snapshots: Customer360Snapshot[] }) {
  return (
    <Card>
      <div className="stack">
        <SectionHeader
          description="Ingresos, pipeline, margen y actividad por cliente."
          title="Rentabilidad y valor de cartera"
        />
        <Table
          columns={profitabilityColumns}
          data={snapshots}
          density="compact"
          emptyDescription="No hay datos de rentabilidad para los clientes filtrados."
          emptyLabel="Sin rentabilidad"
          enableSearch
          getRowHref={(snapshot) => ROUTES.customerDetail(snapshot.customer.id)}
          getRowKey={(snapshot) => snapshot.customer.id}
          getRowLabel={(snapshot) => `Abrir rentabilidad de ${snapshot.customer.name}`}
          searchPlaceholder="Buscar cliente, margen, pipeline o condicion"
        />
      </div>
    </Card>
  )
}

function CustomerEditorView({
  customer,
  onCancel,
  onSaved,
}: {
  customer: Customer | null
  onCancel: () => void
  onSaved: (customer: Customer) => void
}) {
  return (
    <div className="two-column-grid">
      <Card>
        <div className="stack">
          <SectionHeader
            description={
              customer
                ? 'Actualiza datos comerciales, credito, rutas frecuentes y tarifas diferenciales.'
                : 'Crea un cliente con condiciones listas para solicitudes, cotizaciones, fletes y taller.'
            }
            title={customer ? `Editar ${customer.name}` : 'Crear cliente'}
          />
          <CustomerForm
            customer={customer}
            key={customer?.id || 'new-customer'}
            onCancel={onCancel}
            onSaved={onSaved}
          />
        </div>
      </Card>
      <Card>
        <div className="stack">
          <SectionHeader
            description="El cliente queda disponible para los flujos donde hoy aparece disperso."
            title="Informacion centralizada"
          />
          <div className="stack-tight">
            <CustomerCentralizedSignal label="Comercial" text="RUT, contacto, email, telefono y estado comercial." />
            <CustomerCentralizedSignal label="Credito" text="Cupo, uso, plazo de pago, riesgo y bloqueo operacional." />
            <CustomerCentralizedSignal label="Tarifas" text="Precio por tipo de flete, minimo, descuento y notas." />
            <CustomerCentralizedSignal label="Operacion" text="Solicitudes, cotizaciones, casos de taller, viajes y comunicaciones." />
          </div>
        </div>
      </Card>
    </div>
  )
}

function CustomerFilterBar({
  activeFilters,
  cargoType,
  creditFilter,
  query,
  riskLevel,
  setCargoType,
  setCreditFilter,
  setQuery,
  setRiskLevel,
  setStatus,
  status,
}: {
  activeFilters: Array<{ label: string; onRemove: () => void; value?: string }>
  cargoType: CargoType | 'all'
  creditFilter: CreditFilter
  query: string
  riskLevel: CustomerRiskLevel | 'all'
  setCargoType: (value: CargoType | 'all') => void
  setCreditFilter: (value: CreditFilter) => void
  setQuery: (value: string) => void
  setRiskLevel: (value: CustomerRiskLevel | 'all') => void
  setStatus: (value: CustomerStatus | 'all') => void
  status: CustomerStatus | 'all'
}) {
  return (
    <FilterBar
      activeCount={activeFilters.length}
      activeFilters={activeFilters}
      description="Busca por datos comerciales, cupo de credito, riesgo, rutas y tipos de flete."
      onClear={() => {
        setQuery('')
        setStatus('all')
        setRiskLevel('all')
        setCreditFilter('all')
        setCargoType('all')
      }}
      title="Filtros de clientes"
    >
      <Input
        label="Busqueda"
        name="customerSearch"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cliente, RUT, contacto, ruta..."
        value={query}
      />
      <Select
        label="Estado"
        name="customerStatus"
        onChange={(event) => setStatus(event.target.value as CustomerStatus | 'all')}
        options={CUSTOMER_STATUS_OPTIONS}
        value={status}
      />
      <Select
        label="Credito"
        name="customerCredit"
        onChange={(event) => setCreditFilter(event.target.value as CreditFilter)}
        options={CREDIT_FILTER_OPTIONS}
        value={creditFilter}
      />
      <Select
        label="Tipo de flete"
        name="customerCargoType"
        onChange={(event) => setCargoType(event.target.value as CargoType | 'all')}
        options={[{ label: 'Todos', value: 'all' }, ...CARGO_TYPE_OPTIONS]}
        value={cargoType}
      />
      <Select
        label="Riesgo"
        name="customerRisk"
        onChange={(event) => setRiskLevel(event.target.value as CustomerRiskLevel | 'all')}
        options={CUSTOMER_RISK_OPTIONS}
        value={riskLevel}
      />
    </FilterBar>
  )
}

function CustomerActionPanel({
  helper,
  icon,
  label,
  to,
}: {
  helper: string
  icon: ReactNode
  label: string
  to: string
}) {
  return (
    <Link className="surface-panel stack-tight" to={to}>
      <div className="split-row">
        <strong>{label}</strong>
        {icon}
      </div>
      <span className="muted-text">{helper}</span>
    </Link>
  )
}

function CustomerCentralizedSignal({ label, text }: { label: string; text: string }) {
  return (
    <div className="surface-panel">
      <strong>{label}</strong>
      <p className="muted-text">{text}</p>
    </div>
  )
}

const alertColumns: TableColumn<CustomerAlertRow>[] = [
  {
    header: 'Cliente / alerta',
    key: 'alert',
    render: (row) => (
      <div className="stack-tight">
        <EntityLink id={row.snapshot.customer.id} type="customer">
          {row.snapshot.customer.name}
        </EntityLink>
        <div className="inline-actions">
          <Badge tone={row.tone}>{row.label}</Badge>
          <CustomerStatusBadge status={row.snapshot.customer.status} />
        </div>
        <span className="muted-text">{row.message}</span>
      </div>
    ),
  },
  { header: 'Impacto', key: 'impact', render: (row) => row.impact },
  {
    header: 'Credito',
    key: 'credit',
    render: (row) => <CustomerCreditBadge customer={row.snapshot.customer} />,
    sortValue: (row) => row.snapshot.metrics.creditUsagePercent,
  },
  {
    header: 'Ultima actividad',
    key: 'lastActivityAt',
    render: (row) => formatOptionalDate(row.snapshot.metrics.lastActivityAt),
    sortValue: (row) => row.snapshot.metrics.lastActivityAt || '',
  },
  {
    align: 'right',
    header: 'Siguiente accion',
    key: 'action',
    render: (row) => (
      <Link to={ROUTES.customerDetail(row.snapshot.customer.id)}>
        <Button size="sm" variant={row.tone === 'danger' ? 'danger' : 'secondary'}>
          {row.action}
        </Button>
      </Link>
    ),
  },
]

const creditColumns: TableColumn<Customer360Snapshot>[] = [
  {
    header: 'Cliente',
    key: 'customer',
    render: (snapshot) => (
      <div>
        <EntityLink id={snapshot.customer.id} type="customer">
          {snapshot.customer.name}
        </EntityLink>
        <p className="muted-text">{snapshot.customer.contactName || 'Sin contacto'} - {snapshot.customer.paymentTermsDays || 0} dias</p>
      </div>
    ),
  },
  {
    header: 'Estado comercial',
    key: 'status',
    render: (snapshot) => (
      <div className="inline-actions">
        <CustomerStatusBadge status={snapshot.customer.status} />
        <Badge tone={snapshot.customer.riskLevel === 'high' ? 'danger' : snapshot.customer.riskLevel === 'medium' ? 'warning' : 'success'}>
          Riesgo {CUSTOMER_RISK_LABELS[snapshot.customer.riskLevel]}
        </Badge>
      </div>
    ),
  },
  {
    header: 'Credito',
    key: 'credit',
    render: (snapshot) => <CustomerCreditBadge customer={snapshot.customer} />,
    sortValue: (snapshot) => snapshot.metrics.creditUsagePercent,
  },
  {
    align: 'right',
    header: 'Disponible',
    key: 'creditAvailable',
    render: (snapshot) => formatCurrency(snapshot.metrics.creditAvailable),
    sortValue: (snapshot) => snapshot.metrics.creditAvailable,
  },
  {
    align: 'right',
    header: 'Pipeline',
    key: 'pipelineTotal',
    render: (snapshot) => formatCurrency(snapshot.metrics.pipelineTotal),
    sortValue: (snapshot) => snapshot.metrics.pipelineTotal,
  },
  {
    align: 'right',
    header: 'Accion',
    key: 'actions',
    render: (snapshot) => (
      <Link to={ROUTES.customerDetail(snapshot.customer.id)}>
        <Button size="sm" variant={snapshot.customer.riskLevel === 'high' ? 'danger' : 'secondary'}>
          Revisar credito
        </Button>
      </Link>
    ),
  },
]

const operationsColumns: TableColumn<Customer360Snapshot>[] = [
  {
    header: 'Cliente',
    key: 'customer',
    render: (snapshot) => (
      <EntityLink id={snapshot.customer.id} type="customer">
        {snapshot.customer.name}
      </EntityLink>
    ),
  },
  {
    align: 'right',
    header: 'Taller',
    key: 'openWorkshopCases',
    render: (snapshot) => snapshot.metrics.openWorkshopCases,
    sortValue: (snapshot) => snapshot.metrics.openWorkshopCases,
  },
  {
    align: 'right',
    header: 'Fletes activos',
    key: 'activeFreight',
    render: (snapshot) => getActiveFreightOperations(snapshot),
    sortValue: getActiveFreightOperations,
  },
  {
    align: 'right',
    header: 'Cotizaciones',
    key: 'pendingQuotes',
    render: (snapshot) => snapshot.metrics.pendingQuotes,
    sortValue: (snapshot) => snapshot.metrics.pendingQuotes,
  },
  {
    align: 'right',
    header: 'Comunicaciones',
    key: 'openCommunications',
    render: (snapshot) => snapshot.metrics.openCommunications,
    sortValue: (snapshot) => snapshot.metrics.openCommunications,
  },
  {
    header: 'Ultima actividad',
    key: 'lastActivityAt',
    render: (snapshot) => formatOptionalDate(snapshot.metrics.lastActivityAt),
    sortValue: (snapshot) => snapshot.metrics.lastActivityAt || '',
  },
  {
    align: 'right',
    header: 'Accion',
    key: 'actions',
    render: (snapshot) => (
      <Link to={ROUTES.customerDetail(snapshot.customer.id)}>
        <Button size="sm" variant="secondary">
          Seguir operaciones
        </Button>
      </Link>
    ),
  },
]

const communicationColumns: TableColumn<CustomerCommunicationRow>[] = [
  {
    header: 'Conversacion',
    key: 'conversation',
    render: (row) => (
      <div>
        <Link to={`${ROUTES.communications}?query=${encodeURIComponent(row.conversation.subject)}`}>
          {row.conversation.subject}
        </Link>
        <p className="muted-text">{row.conversation.contactName} - {row.conversation.contactAddress}</p>
      </div>
    ),
  },
  {
    header: 'Cliente',
    key: 'customer',
    render: (row) => (
      <EntityLink id={row.snapshot.customer.id} type="customer">
        {row.snapshot.customer.name}
      </EntityLink>
    ),
  },
  {
    header: 'Canal',
    key: 'channel',
    render: (row) => row.conversation.channel === 'whatsapp' ? 'WhatsApp' : 'Email',
  },
  {
    header: 'Estado',
    key: 'status',
    render: (row) => (
      <div className="inline-actions">
        <Badge tone={conversationStatusTone[row.conversation.status]}>{row.conversation.status}</Badge>
        <Badge tone={conversationPriorityTone[row.conversation.priority]}>{row.conversation.priority}</Badge>
      </div>
    ),
  },
  {
    header: 'Ultimo mensaje',
    key: 'lastMessageAt',
    render: (row) => formatOptionalDate(row.conversation.lastMessageAt),
    sortValue: (row) => row.conversation.lastMessageAt || '',
  },
  {
    align: 'right',
    header: 'Accion',
    key: 'actions',
    render: (row) => (
      <Link to={`${ROUTES.communications}?query=${encodeURIComponent(row.conversation.subject)}`}>
        <Button size="sm" variant={row.conversation.priority === 'urgent' ? 'danger' : 'secondary'}>
          Seguir conversacion
        </Button>
      </Link>
    ),
  },
]

const profitabilityColumns: TableColumn<Customer360Snapshot>[] = [
  {
    header: 'Cliente',
    key: 'customer',
    render: (snapshot) => (
      <EntityLink id={snapshot.customer.id} type="customer">
        {snapshot.customer.name}
      </EntityLink>
    ),
  },
  {
    align: 'right',
    header: 'Aprobado',
    key: 'approvedRevenue',
    render: (snapshot) => formatCurrency(snapshot.metrics.approvedRevenue),
    sortValue: (snapshot) => snapshot.metrics.approvedRevenue,
  },
  {
    align: 'right',
    header: 'Pipeline',
    key: 'pipelineTotal',
    render: (snapshot) => formatCurrency(snapshot.metrics.pipelineTotal),
    sortValue: (snapshot) => snapshot.metrics.pipelineTotal,
  },
  {
    align: 'right',
    header: 'Margen neto',
    key: 'netMargin',
    render: (snapshot) => formatCurrency(snapshot.metrics.netMargin),
    sortValue: (snapshot) => snapshot.metrics.netMargin,
  },
  {
    align: 'right',
    header: '% margen',
    key: 'profitabilityMarginPercent',
    render: (snapshot) => `${snapshot.metrics.profitabilityMarginPercent}%`,
    sortValue: (snapshot) => snapshot.metrics.profitabilityMarginPercent,
  },
  {
    header: 'Condicion',
    key: 'condition',
    render: (snapshot) => (
      <Badge tone={snapshot.metrics.profitabilityMarginPercent < 10 && snapshot.metrics.approvedRevenue > 0 ? 'warning' : 'success'}>
        {snapshot.metrics.profitabilityMarginPercent < 10 && snapshot.metrics.approvedRevenue > 0 ? 'Revisar margen' : 'Rentable'}
      </Badge>
    ),
  },
  {
    align: 'right',
    header: 'Accion',
    key: 'actions',
    render: (snapshot) => (
      <Link to={ROUTES.customerDetail(snapshot.customer.id)}>
        <Button size="sm" variant="secondary">
          Analizar cartera
        </Button>
      </Link>
    ),
  },
]

function getPricingColumns(onEditCustomer: (customer: Customer) => void): TableColumn<CustomerPricingRow>[] {
  return [
    {
      header: 'Cliente',
      key: 'customer',
      render: (row) => (
        <EntityLink id={row.customer.id} type="customer">
          {row.customer.name}
        </EntityLink>
      ),
    },
    {
      header: 'Tipo de flete',
      key: 'cargoType',
      render: (row) => (
        <div>
          <strong>{row.price.label || CARGO_TYPE_LABELS[row.price.cargoType]}</strong>
          <p className="muted-text">{CARGO_TYPE_LABELS[row.price.cargoType]}</p>
        </div>
      ),
    },
    { align: 'right', header: 'Base', key: 'baseRate', render: (row) => formatCurrency(row.price.baseRate), sortValue: (row) => row.price.baseRate },
    { align: 'right', header: 'KM', key: 'kmRate', render: (row) => formatCurrency(row.price.kmRate), sortValue: (row) => row.price.kmRate },
    { align: 'right', header: 'Minimo', key: 'minimumCharge', render: (row) => formatCurrency(row.price.minimumCharge), sortValue: (row) => row.price.minimumCharge },
    { align: 'right', header: 'Desc.', key: 'discountPercent', render: (row) => `${row.price.discountPercent}%`, sortValue: (row) => row.price.discountPercent },
    { header: 'Notas', key: 'notes', render: (row) => row.price.notes || 'Sin notas' },
    {
      align: 'right',
      header: 'Accion',
      key: 'actions',
      render: (row) => (
        <Button onClick={() => onEditCustomer(row.customer)} size="sm" type="button" variant="secondary">
          Ajustar tarifa
        </Button>
      ),
    },
  ]
}

function buildCustomerAlertRows(snapshots: Customer360Snapshot[]) {
  return snapshots
    .flatMap((snapshot) =>
      snapshot.alerts.map((alert, index) => ({
        action: getAlertAction(alert.label),
        id: `${snapshot.customer.id}-${index}-${alert.label}`,
        impact: getCustomerImpact(snapshot),
        label: alert.label,
        message: alert.message,
        snapshot,
        tone: alert.tone,
      })),
    )
    .sort((first, second) => getToneScore(second.tone) - getToneScore(first.tone))
}

function buildCustomerPricingRows(customers: Customer[]) {
  return customers.flatMap((customer) =>
    customer.priceList.map((price) => ({
      customer,
      id: `${customer.id}-${price.id}`,
      price,
    })),
  )
}

function buildCustomerCommunicationRows(snapshots: Customer360Snapshot[]) {
  return snapshots
    .flatMap((snapshot) =>
      snapshot.conversations.map((conversation) => ({
        conversation,
        id: `${snapshot.customer.id}-${conversation.id}`,
        snapshot,
      })),
    )
    .sort((first, second) => getDateTime(second.conversation.lastMessageAt) - getDateTime(first.conversation.lastMessageAt))
}

function getCustomerModuleView(value: string | null): CustomerModuleView {
  return value && validCustomerViews.has(value as CustomerModuleView) ? value as CustomerModuleView : 'dashboard'
}

function getCustomerViewPath(view: CustomerModuleView) {
  return view === 'dashboard' ? ROUTES.customers : `${ROUTES.customers}?view=${view}`
}

function getStatusFilter(value: string | null): CustomerStatus | 'all' {
  return value === 'active' || value === 'inactive' || value === 'suspended' ? value : 'all'
}

function getAlertAction(label: string) {
  if (label === 'Credito y riesgo' || label === 'Estado comercial') {
    return 'Revisar credito'
  }

  if (label === 'Taller critico') {
    return 'Revisar casos'
  }

  if (label === 'Despacho pendiente') {
    return 'Asignar flete'
  }

  if (label === 'Comunicacion urgente') {
    return 'Responder'
  }

  return 'Abrir ficha'
}

function getCustomerImpact(snapshot: Customer360Snapshot) {
  const pieces = [
    `${snapshot.metrics.activeOperations} operaciones`,
    `${snapshot.metrics.pendingQuotes} cotizaciones`,
    formatCurrency(snapshot.metrics.pipelineTotal),
  ]

  return pieces.join(' / ')
}

function getActiveFreightOperations(snapshot: Customer360Snapshot) {
  return Math.max(0, snapshot.metrics.activeOperations - snapshot.metrics.openWorkshopCases)
}

function getToneScore(tone: BadgeTone) {
  const scores: Record<BadgeTone, number> = {
    danger: 400,
    warning: 300,
    info: 200,
    neutral: 100,
    success: 0,
  }

  return scores[tone]
}

function formatOptionalDate(value?: string) {
  return value ? formatDate(value) : 'Sin actividad'
}

function getDateTime(value?: string) {
  return value ? new Date(value).getTime() || 0 : 0
}
