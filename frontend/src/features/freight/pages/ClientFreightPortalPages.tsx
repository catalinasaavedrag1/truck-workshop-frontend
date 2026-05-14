import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Clock3, MessageCircle, PackageCheck, RotateCcw, Send } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { EntityLink } from '../../../shared/components/EntityLink'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { createResource, updateResource } from '../../../shared/services/resourceApi'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type {
  CommunicationConversation,
  CommunicationMessage,
  CommunicationQuoteLink,
} from '../../communications/types/communication.types'
import { CustomerCreditDecisionPanel } from '../../customers/components/CustomerCreditDecisionPanel'
import { CustomerSelect } from '../../customers/components/CustomerSelect'
import { customersMock } from '../../customers/mocks/customers.mock'
import type { Customer } from '../../customers/types/customer.types'
import { CARGO_TYPE_LABELS, CARGO_TYPE_OPTIONS } from '../constants/cargoType.constants'
import { FreightCostBreakdown } from '../components/FreightCostBreakdown'
import { FreightRequestStatusBadge } from '../components/FreightRequestStatusBadge'
import styles from '../components/FreightClientPortal.module.css'
import { freightAssignmentsMock, freightQuotesMock, freightRequestsMock } from '../mocks/freight.mock'
import { calculateFreightPricing } from '../services/freightPricing.service'
import type { CargoType, FreightAssignment, FreightPricingCalculation, FreightQuote, FreightRequest } from '../types/freight.types'

type ClientFreightStep = 'route' | 'cargo' | 'availability' | 'cost' | 'confirm'
type AvailabilityTone = 'available' | 'low' | 'manual' | 'unavailable'

interface ClientFreightDraft {
  cargoDescription: string
  cargoType: CargoType
  contactEmail: string
  contactName: string
  contactPhone: string
  customerId: string
  customerName: string
  destinationAddress: string
  documentsNote: string
  originAddress: string
  packageCount: number
  pickupDate: string
  pickupWindow: string
  requiresLoadingHelp: boolean
  requiresUnloadingHelp: boolean
  requiresWaitingTime: boolean
  volumeM3: number
  waitingHours: number
  weightKg: number
}

interface AvailabilityOption {
  action: string
  estimatedTotal: number
  id: string
  label: string
  pickupDate: string
  risk: string
  status: AvailabilityTone
  timeEstimate: string
  truckType: string
  window: string
}

interface SubmittedFreightRequest {
  quote?: FreightQuote
  request: FreightRequest
  trackingNumber: string
}

const draftStorageKey = 'truck-workshop.client-freight-draft'
const steps: Array<{ key: ClientFreightStep; label: string; helper: string }> = [
  { helper: 'Ruta, fecha y servicios', key: 'route', label: 'Origen y destino' },
  { helper: 'Carga, capacidad y riesgos', key: 'cargo', label: 'Tipo de carga' },
  { helper: 'Ventanas disponibles', key: 'availability', label: 'Disponibilidad' },
  { helper: 'Costo estimado', key: 'cost', label: 'Costos' },
  { helper: 'Enviar a operacion', key: 'confirm', label: 'Confirmacion' },
]

const initialDraft: ClientFreightDraft = {
  cargoDescription: '',
  cargoType: 'GENERAL',
  contactEmail: '',
  contactName: '',
  contactPhone: '',
  customerId: '',
  customerName: '',
  destinationAddress: '',
  documentsNote: '',
  originAddress: '',
  packageCount: 1,
  pickupDate: '',
  pickupWindow: '09:00 - 12:00',
  requiresLoadingHelp: false,
  requiresUnloadingHelp: false,
  requiresWaitingTime: false,
  volumeM3: 0,
  waitingHours: 0,
  weightKg: 0,
}

export function ClientFreightRequestPage() {
  const location = useLocation()
  const portalRoutes = getPortalRoutes(location.pathname.startsWith('/freight/client-portal'))
  const [draft, setDraft] = useState<ClientFreightDraft>(() => loadDraft())
  const [activeStep, setActiveStep] = useState<ClientFreightStep>('route')
  const [selectedOptionId, setSelectedOptionId] = useState('recommended')
  const [calculation, setCalculation] = useState<FreightPricingCalculation | null>(null)
  const [calculationError, setCalculationError] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState<SubmittedFreightRequest | null>(null)
  const { data: customers } = useResourceList<Customer>('/customers', customersMock, { order: 'asc', sort: 'name' })
  const { data: previousRequests } = useResourceList<FreightRequest>('/freight/requests', freightRequestsMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const selectedCustomer = customers.find((customer) => customer.id === draft.customerId)
  const routeInsight = getRouteInsight(draft, calculation)
  const availabilityOptions = useMemo(
    () => buildAvailabilityOptions(draft, routeInsight, calculation),
    [calculation, draft, routeInsight],
  )
  const selectedAvailability = availabilityOptions.find((option) => option.id === selectedOptionId) || availabilityOptions[0]
  const validationAlerts = getValidationAlerts(draft, routeInsight, selectedAvailability, selectedCustomer)
  const blockingAlerts = validationAlerts.filter((alert) => alert.blocking)
  const relevantPreviousRequests = previousRequests
    .filter((request) => !draft.customerId || request.customerId === draft.customerId)
    .slice(0, 3)

  useEffect(() => {
    window.localStorage.setItem(draftStorageKey, JSON.stringify(draft))
  }, [draft])

  useEffect(() => {
    if (!draft.originAddress || !draft.destinationAddress) {
      const timeout = window.setTimeout(() => {
        setCalculation(null)
        setCalculationError('')
      }, 0)

      return () => window.clearTimeout(timeout)
    }

    let isMounted = true
    const timeout = window.setTimeout(() => {
      setIsCalculating(true)
      setCalculationError('')

      calculateFreightPricing({
        cargoType: draft.cargoType,
        destinationAddress: draft.destinationAddress,
        estimatedKm: estimateKm(draft.originAddress, draft.destinationAddress),
        originAddress: draft.originAddress,
        requiresLoadingHelp: draft.requiresLoadingHelp,
        requiresUnloadingHelp: draft.requiresUnloadingHelp,
        waitingHours: draft.requiresWaitingTime ? draft.waitingHours : 0,
      })
        .then((nextCalculation) => {
          if (isMounted) {
            setCalculation(nextCalculation)
          }
        })
        .catch((error) => {
          if (isMounted) {
            setCalculation(null)
            setCalculationError(getApiErrorMessage(error))
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsCalculating(false)
          }
        })
    }, 350)

    return () => {
      isMounted = false
      window.clearTimeout(timeout)
    }
  }, [
    draft.cargoType,
    draft.destinationAddress,
    draft.originAddress,
    draft.requiresLoadingHelp,
    draft.requiresUnloadingHelp,
    draft.requiresWaitingTime,
    draft.waitingHours,
  ])

  const updateDraft = <TKey extends keyof ClientFreightDraft>(key: TKey, value: ClientFreightDraft[TKey]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const handleCustomerChange = (customer: Customer | undefined, customerId: string) => {
    setDraft((current) => ({
      ...current,
      contactEmail: customer?.email || current.contactEmail,
      contactName: customer?.contactName || current.contactName,
      contactPhone: customer?.phone || current.contactPhone,
      customerId,
      customerName: customer?.name || current.customerName,
    }))
  }

  const handleRepeatRequest = (request: FreightRequest) => {
    setDraft((current) => ({
      ...current,
      cargoDescription: request.cargoDescription,
      cargoType: request.cargoType,
      destinationAddress: request.destinationAddress,
      originAddress: request.originAddress,
      packageCount: request.packageCount || current.packageCount,
      requiresLoadingHelp: request.requiresLoadingHelp,
      requiresUnloadingHelp: request.requiresUnloadingHelp,
      requiresWaitingTime: request.requiresWaitingTime,
      volumeM3: request.volumeM3 || 0,
      waitingHours: request.waitingHours || 0,
      weightKg: request.weightKg || 0,
    }))
    setActiveStep('route')
  }

  const handleSubmit = async () => {
    setSubmitError('')

    if (blockingAlerts.length > 0 || !calculation) {
      setSubmitError(blockingAlerts[0]?.message || 'Completa ruta, carga, contacto y costo estimado antes de enviar.')
      return
    }

    setIsSaving(true)

    try {
      const now = new Date()
      const requestNumber = `FRE-${now.getTime()}`
      const trackingNumber = `TRK-${String(now.getTime()).slice(-8)}`
      const quoteTotal = selectedAvailability.estimatedTotal
      const quoteSubtotal = Math.round(quoteTotal / 1.19)
      const quoteTax = quoteTotal - quoteSubtotal
      const request = await createResource<FreightRequest, Partial<FreightRequest>>('/freight/requests', {
        availabilityStatus: selectedAvailability.status,
        cargoDescription: draft.cargoDescription || CARGO_TYPE_LABELS[draft.cargoType],
        cargoType: draft.cargoType,
        coverageZone: routeInsight.coverageLabel,
        customerEmail: draft.contactEmail || selectedCustomer?.email,
        customerId: selectedCustomer?.id,
        customerName: draft.customerName || selectedCustomer?.name || 'Cliente portal',
        customerPhone: draft.contactPhone || selectedCustomer?.phone,
        destinationAddress: draft.destinationAddress,
        estimatedDurationText: routeInsight.durationText,
        estimatedKm: routeInsight.distanceKm,
        observations: buildPortalObservation(draft, selectedAvailability, trackingNumber),
        originAddress: draft.originAddress,
        packageCount: draft.packageCount,
        pickupWindow: draft.pickupWindow,
        requestNumber,
        requestedPickupDate: toIsoPickupDate(draft.pickupDate),
        requiresLoadingHelp: draft.requiresLoadingHelp,
        requiresUnloadingHelp: draft.requiresUnloadingHelp,
        requiresWaitingTime: draft.requiresWaitingTime,
        status: 'NEW',
        trackingNumber,
        volumeM3: draft.volumeM3,
        waitingHours: draft.requiresWaitingTime ? draft.waitingHours : 0,
        weightKg: draft.weightKg,
      })
      const quote = await createResource<FreightQuote, Partial<FreightQuote>>('/freight/quotes', {
        baseRate: calculation.baseRate,
        cargoType: draft.cargoType,
        cargoTypeSurcharge: calculation.cargoTypeSurcharge,
        customerId: request.customerId,
        customerName: request.customerName,
        dieselPricePerLiter: calculation.dieselPricePerLiter,
        estimatedKm: calculation.estimatedKm,
        fuelCost: calculation.fuelCost,
        fuelKmPerLiter: calculation.fuelKmPerLiter,
        fuelLiters: calculation.fuelLiters,
        kmRate: calculation.kmRate,
        loadingCost: calculation.loadingCost,
        marginAmount: calculation.marginAmount,
        operationCost: calculation.operationCost,
        operationCostPerKm: calculation.operationCostPerKm,
        pricingConfigId: calculation.pricingConfigId,
        pricingSnapshot: calculation.pricingSnapshot,
        quoteNumber: `FQ-${trackingNumber}`,
        requestId: request.id,
        routePricingSnapshot: calculation.routePricingSnapshot,
        status: 'DRAFT',
        subtotal: quoteSubtotal,
        taxAmount: quoteTax,
        tollCost: calculation.tollCost,
        total: quoteTotal,
        unloadingCost: calculation.unloadingCost,
        validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        waitingCost: calculation.waitingCost,
      })
      const updatedRequest = await updateResource<FreightRequest>('/freight/requests', request.id, {
        quoteId: quote.id,
        status: 'QUOTING',
      })

      await createTrackingCommunication(updatedRequest, quote, trackingNumber)
      window.localStorage.removeItem(draftStorageKey)
      setSubmitted({ quote, request: updatedRequest, trackingNumber })
      setDraft(initialDraft)
      setActiveStep('confirm')
    } catch (error) {
      setSubmitError(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PortalShell
      actions={
        <div className="inline-actions">
          <Link to={portalRoutes.requests}>
            <Button size="sm" type="button" variant="secondary">
              Mis solicitudes
            </Button>
          </Link>
          <Link to={portalRoutes.history}>
            <Button size="sm" type="button" variant="secondary">
              Historial
            </Button>
          </Link>
          <SupportAction portalRoutes={portalRoutes} />
        </div>
      }
      description="Cotiza disponibilidad, costo estimado y agenda tu retiro."
      title="Solicitar flete"
    >
      <FreightRequestStepper activeStep={activeStep} onStepChange={setActiveStep} />
      {submitted ? (
        <SubmittedPanel portalRoutes={portalRoutes} submitted={submitted} />
      ) : (
        <div className={styles.wizardLayout}>
          <div className="stack">
            {submitError ? <ErrorState description={submitError} title="No se pudo enviar la solicitud" /> : null}
            {activeStep === 'route' ? (
              <RouteStep
                draft={draft}
                isCalculating={isCalculating}
                onCustomerChange={handleCustomerChange}
                onRepeatRequest={handleRepeatRequest}
                onUpdate={updateDraft}
                previousRequests={relevantPreviousRequests}
                routeInsight={routeInsight}
                selectedCustomer={selectedCustomer}
              />
            ) : null}
            {activeStep === 'cargo' ? <CargoStep draft={draft} onUpdate={updateDraft} validationAlerts={validationAlerts} /> : null}
            {activeStep === 'availability' ? (
              <AvailabilityStep
                onSelect={setSelectedOptionId}
                options={availabilityOptions}
                selectedOptionId={selectedOptionId}
              />
            ) : null}
            {activeStep === 'cost' ? (
              <CostStep
                calculation={calculation}
                calculationError={calculationError}
                selectedAvailability={selectedAvailability}
              />
            ) : null}
            {activeStep === 'confirm' ? (
              <ConfirmationStep
                calculation={calculation}
                draft={draft}
                isSaving={isSaving}
                onSubmit={handleSubmit}
                selectedAvailability={selectedAvailability}
                selectedCustomer={selectedCustomer}
                validationAlerts={validationAlerts}
              />
            ) : null}
            <WizardControls activeStep={activeStep} onStepChange={setActiveStep} />
          </div>
          <FreightRequestSummaryPanel
            draft={draft}
            nextStep={steps.find((step) => step.key === activeStep)?.helper || 'Completar solicitud'}
            routeInsight={routeInsight}
            selectedAvailability={selectedAvailability}
          />
        </div>
      )}
    </PortalShell>
  )
}

export function ClientFreightRequestsPage() {
  const location = useLocation()
  const portalRoutes = getPortalRoutes(location.pathname.startsWith('/freight/client-portal'))
  const { data: requests, isLoading } = useResourceList<FreightRequest>('/freight/requests', freightRequestsMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: quotes } = useResourceList<FreightQuote>('/freight/quotes', freightQuotesMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const columns: TableColumn<FreightRequest>[] = [
    {
      header: 'Seguimiento',
      key: 'trackingNumber',
      render: (request) => (
        <div className="stack-tight">
          <Link className="text-link" to={portalRoutes.tracking(request.trackingNumber || request.requestNumber || request.id)}>
            {request.trackingNumber || request.requestNumber}
          </Link>
          <span className="muted-text">{request.customerName}</span>
        </div>
      ),
    },
    {
      header: 'Ruta',
      key: 'route',
      render: (request) => (
        <span>
          {request.originAddress} a {request.destinationAddress}
        </span>
      ),
    },
    { header: 'Retiro', key: 'requestedPickupDate', render: (request) => formatDate(request.requestedPickupDate) },
    {
      header: 'Estado',
      key: 'status',
      render: (request) => <FreightRequestStatusBadge status={request.status} />,
    },
    {
      align: 'right',
      header: 'Costo',
      key: 'quote',
      render: (request) => formatCurrency(quotes.find((quote) => quote.id === request.quoteId)?.total || 0),
    },
    {
      header: 'Proximo paso',
      key: 'nextStep',
      render: (request) => getClientNextStep(request, quotes.find((quote) => quote.id === request.quoteId)),
    },
  ]

  return (
    <PortalShell
      actions={
        <div className="inline-actions">
          <Link to={portalRoutes.request}>
            <Button icon={<Send size={17} />} size="sm" type="button">
              Nueva solicitud
            </Button>
          </Link>
          <Link to={portalRoutes.history}>
            <Button size="sm" type="button" variant="secondary">
              Historial
            </Button>
          </Link>
          <SupportAction portalRoutes={portalRoutes} />
        </div>
      }
      description="Revisa estado, costo estimado y proximo paso de tus fletes."
      title="Mis solicitudes"
    >
      <Table
        columns={columns}
        data={requests}
        emptyDescription="Cuando envies una solicitud de flete aparecera aqui con su numero de seguimiento."
        emptyLabel="Sin solicitudes"
        enableSearch
        getRowHref={(request) => portalRoutes.tracking(request.trackingNumber || request.requestNumber || request.id)}
        getRowKey={(request) => request.id}
        getRowLabel={(request) => `Abrir seguimiento ${request.trackingNumber || request.requestNumber}`}
        isLoading={isLoading}
        searchPlaceholder="Buscar por seguimiento, cliente, origen o destino"
      />
    </PortalShell>
  )
}

export function ClientFreightHistoryPage() {
  const location = useLocation()
  const portalRoutes = getPortalRoutes(location.pathname.startsWith('/freight/client-portal'))
  const { data: requests, isLoading } = useResourceList<FreightRequest>('/freight/requests', freightRequestsMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: quotes } = useResourceList<FreightQuote>('/freight/quotes', freightQuotesMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const summary = getHistorySummary(requests, quotes)
  const frequentRoutes = getFrequentRoutes(requests, quotes)
  const columns: TableColumn<FreightRequest>[] = [
    {
      header: 'Solicitud',
      key: 'request',
      render: (request) => (
        <div className="stack-tight">
          <Link className="text-link" to={portalRoutes.tracking(request.trackingNumber || request.requestNumber || request.id)}>
            {request.trackingNumber || request.requestNumber}
          </Link>
          <span className="muted-text">{request.customerName}</span>
        </div>
      ),
    },
    { header: 'Fecha retiro', key: 'requestedPickupDate', render: (request) => formatDate(request.requestedPickupDate) },
    {
      header: 'Ruta',
      key: 'route',
      render: (request) => `${request.originAddress} a ${request.destinationAddress}`,
    },
    {
      header: 'Estado',
      key: 'status',
      render: (request) => <FreightRequestStatusBadge status={request.status} />,
    },
    {
      align: 'right',
      header: 'Costo',
      key: 'total',
      render: (request) => formatCurrency(findQuoteForRequest(request, quotes)?.total || 0),
    },
    {
      header: 'Resultado',
      key: 'nextStep',
      render: (request) => getClientNextStep(request, findQuoteForRequest(request, quotes)),
    },
  ]

  return (
    <PortalShell
      actions={
        <div className="inline-actions">
          <Link to={portalRoutes.request}>
            <Button icon={<Send size={17} />} size="sm" type="button">
              Nueva solicitud
            </Button>
          </Link>
          <Link to={portalRoutes.requests}>
            <Button size="sm" type="button" variant="secondary">
              Mis solicitudes
            </Button>
          </Link>
          <SupportAction portalRoutes={portalRoutes} />
        </div>
      }
      description="Consulta solicitudes anteriores, costos, frecuencia y rutas repetidas."
      title="Historial de fletes"
    >
      <div className={styles.insightGrid}>
        <Metric label="Solicitudes registradas" value={String(summary.totalRequests)} />
        <Metric label="Costo historico estimado" value={formatCurrency(summary.totalCost)} />
        <Metric label="Ticket promedio" value={formatCurrency(summary.averageCost)} />
      </div>
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Rutas frecuentes</h2>
            <p>Usa este resumen para repetir solicitudes y detectar patrones de costo.</p>
          </div>
          <Badge tone="info">{frequentRoutes.length} rutas</Badge>
        </div>
        {frequentRoutes.length > 0 ? (
          <div className={styles.insightGrid}>
            {frequentRoutes.map((route) => (
              <Link className={styles.routeCardLink} key={route.key} to={`${portalRoutes.requests}?q=${encodeURIComponent(route.query)}`}>
                <strong>{route.label}</strong>
                <span className="muted-text">{route.count} solicitudes / {formatCurrency(route.totalCost)}</span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            description="Cuando existan solicitudes cerradas o en curso, veras aqui las rutas mas usadas."
            title="Sin historial suficiente"
          />
        )}
      </section>
      <Table
        columns={columns}
        data={requests}
        emptyDescription="Todavia no hay historial de fletes para analizar."
        emptyLabel="Sin historial"
        enableSearch
        getRowHref={(request) => portalRoutes.tracking(request.trackingNumber || request.requestNumber || request.id)}
        getRowKey={(request) => request.id}
        getRowLabel={(request) => `Abrir historial ${request.trackingNumber || request.requestNumber}`}
        isLoading={isLoading}
        searchPlaceholder="Buscar por seguimiento, ruta, cliente o estado"
      />
    </PortalShell>
  )
}

export function ClientFreightTrackingPage() {
  const { trackingNumber } = useParams()
  const location = useLocation()
  const portalRoutes = getPortalRoutes(location.pathname.startsWith('/freight/client-portal'))
  const { data: requests } = useResourceList<FreightRequest>('/freight/requests', freightRequestsMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: quotes } = useResourceList<FreightQuote>('/freight/quotes', freightQuotesMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: assignments } = useResourceList<FreightAssignment>('/freight/assignments', freightAssignmentsMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const request = requests.find((item) =>
    [item.trackingNumber, item.requestNumber, item.id].filter(Boolean).includes(trackingNumber || ''),
  )
  const quote = request ? quotes.find((item) => item.id === request.quoteId || item.requestId === request.id) : undefined
  const assignment = request ? assignments.find((item) => item.requestId === request.id) : undefined

  if (!request) {
    return (
      <PortalShell
        actions={
          <div className="inline-actions">
            <Link to={portalRoutes.requests}>
              <Button size="sm" type="button" variant="secondary">
                Mis solicitudes
              </Button>
            </Link>
            <SupportAction portalRoutes={portalRoutes} />
          </div>
        }
        description="Ingresa desde el link de seguimiento o revisa tus solicitudes."
        title="Seguimiento de flete"
      >
        <EmptyState
          description="No encontramos una solicitud con ese numero. Revisa el codigo o vuelve al listado."
          icon={<AlertTriangle size={22} />}
          title="Seguimiento no encontrado"
        />
      </PortalShell>
    )
  }

  const timeline = buildTrackingTimeline(request, quote, assignment)

  return (
    <PortalShell
      actions={
        <div className="inline-actions">
          <Link to={portalRoutes.requests}>
            <Button size="sm" type="button" variant="secondary">
              Mis solicitudes
            </Button>
          </Link>
          <Link to={portalRoutes.request}>
            <Button size="sm" type="button" variant="secondary">
              Nueva solicitud
            </Button>
          </Link>
          <Link to={portalRoutes.history}>
            <Button size="sm" type="button" variant="secondary">
              Historial
            </Button>
          </Link>
          <SupportAction portalRoutes={portalRoutes} />
        </div>
      }
      description="Estado, cotizacion, mensajes y proximo paso de tu flete."
      title="Seguimiento de flete"
    >
      <div className={styles.trackingHero}>
        <span>Numero de seguimiento</span>
        <strong className={styles.trackingNumber}>{request.trackingNumber || request.requestNumber}</strong>
        <p>
          {request.originAddress} a {request.destinationAddress}
        </p>
        <div className="inline-actions">
          <FreightRequestStatusBadge status={request.status} />
          {quote ? <Badge tone="info">Cotizacion {quote.quoteNumber}</Badge> : <Badge tone="warning">Cotizacion pendiente</Badge>}
        </div>
      </div>
      <div className={styles.wizardLayout}>
        <div className="stack">
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Flujo de seguimiento</h2>
                <p>La solicitud avanza desde validacion operacional hasta cierre.</p>
              </div>
              <Badge tone={assignment ? 'success' : quote ? 'info' : 'warning'}>{getClientNextStep(request, quote)}</Badge>
            </div>
            <div className={styles.timeline}>
              {timeline.map((item, index) => (
                <div className={styles.timelineItem} key={item.label}>
                  <span className={[styles.timelineDot, item.done ? styles.timelineDone : item.current ? styles.timelineCurrent : ''].filter(Boolean).join(' ')}>
                    {index + 1}
                  </span>
                  <div className="stack-tight">
                    <strong>{item.label}</strong>
                    <span className="muted-text">{item.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Mensajes y documentos</h2>
                <p>El numero de seguimiento se envia junto a la cotizacion y queda conectado a comunicaciones.</p>
              </div>
              {quote ? (
                <Link to={`${ROUTES.communications}?relatedEntityType=freight-quote&relatedEntityId=${encodeURIComponent(quote.id)}`}>
                  <Button icon={<MessageCircle size={17} />} size="sm" type="button" variant="secondary">
                    Ver mensajes
                  </Button>
                </Link>
              ) : null}
            </div>
            <div className={styles.insightGrid}>
              <Metric label="Seguimiento" value={request.trackingNumber || request.requestNumber} />
              <Metric label="Cotizacion" value={quote?.quoteNumber || 'Pendiente'} />
              <Metric label="Costo estimado" value={quote ? formatCurrency(quote.total) : 'Sujeto a validacion'} />
            </div>
          </section>
        </div>
        <FreightRequestSummaryPanel
          draft={requestToDraft(request)}
          nextStep={getClientNextStep(request, quote)}
          routeInsight={getRouteInsight(requestToDraft(request), quoteToCalculation(quote, request))}
          selectedAvailability={quote ? quoteToAvailability(request, quote) : undefined}
        />
      </div>
    </PortalShell>
  )
}

function PortalShell({
  actions,
  children,
  description,
  title,
}: {
  actions: React.ReactNode
  children: React.ReactNode
  description: string
  title: string
}) {
  return (
    <div className={styles.portalShell}>
      <div className={styles.portalContent}>
        <header className={styles.portalHeader}>
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {actions}
        </header>
        {children}
      </div>
    </div>
  )
}

function FreightRequestStepper({
  activeStep,
  onStepChange,
}: {
  activeStep: ClientFreightStep
  onStepChange: (step: ClientFreightStep) => void
}) {
  const activeIndex = steps.findIndex((step) => step.key === activeStep)

  return (
    <div className={styles.stepper}>
      {steps.map((step, index) => (
        <button
          className={[
            styles.stepButton,
            index === activeIndex ? styles.stepActive : '',
            index < activeIndex ? styles.stepComplete : '',
          ]
            .filter(Boolean)
            .join(' ')}
          key={step.key}
          onClick={() => onStepChange(step.key)}
          type="button"
        >
          <strong>{String(index + 1).padStart(2, '0')} {step.label}</strong>
          <span>{step.helper}</span>
        </button>
      ))}
    </div>
  )
}

function RouteStep({
  draft,
  isCalculating,
  onCustomerChange,
  onRepeatRequest,
  onUpdate,
  previousRequests,
  routeInsight,
  selectedCustomer,
}: {
  draft: ClientFreightDraft
  isCalculating: boolean
  onCustomerChange: (customer: Customer | undefined, customerId: string) => void
  onRepeatRequest: (request: FreightRequest) => void
  onUpdate: <TKey extends keyof ClientFreightDraft>(key: TKey, value: ClientFreightDraft[TKey]) => void
  previousRequests: FreightRequest[]
  routeInsight: ReturnType<typeof getRouteInsight>
  selectedCustomer?: Customer
}) {
  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>Origen, destino y contacto</h2>
          <p>Primero validamos ruta, cobertura y contacto responsable.</p>
        </div>
        <Badge tone={routeInsight.coverage === 'covered' ? 'success' : routeInsight.coverage === 'review' ? 'warning' : 'danger'}>
          {routeInsight.coverageLabel}
        </Badge>
      </div>
      <div className="form-grid">
        <CustomerSelect
          className="span-2"
          label="Cliente registrado"
          onCustomerChange={onCustomerChange}
          value={draft.customerId}
        />
        <Input
          label="Nombre cliente"
          name="customerName"
          onChange={(event) => onUpdate('customerName', event.target.value)}
          placeholder="Empresa o persona solicitante"
          required
          value={draft.customerName}
        />
        <Input
          label="Contacto responsable"
          name="contactName"
          onChange={(event) => onUpdate('contactName', event.target.value)}
          placeholder="Nombre contacto"
          value={draft.contactName}
        />
        <Input
          label="Correo contacto"
          name="contactEmail"
          onChange={(event) => onUpdate('contactEmail', event.target.value)}
          placeholder="correo@cliente.cl"
          type="email"
          value={draft.contactEmail}
        />
        <Input
          label="Telefono contacto"
          name="contactPhone"
          onChange={(event) => onUpdate('contactPhone', event.target.value)}
          placeholder="+56 9 ..."
          value={draft.contactPhone}
        />
        <Input
          className="span-2"
          label="Direccion de retiro"
          name="originAddress"
          onChange={(event) => onUpdate('originAddress', event.target.value)}
          placeholder="Ej: Centro de distribucion Quilicura"
          required
          value={draft.originAddress}
        />
        <Input
          className="span-2"
          label="Direccion de entrega"
          name="destinationAddress"
          onChange={(event) => onUpdate('destinationAddress', event.target.value)}
          placeholder="Ej: Puerto San Antonio"
          required
          value={draft.destinationAddress}
        />
        <Input
          label="Fecha de retiro deseada"
          name="pickupDate"
          onChange={(event) => onUpdate('pickupDate', event.target.value)}
          required
          type="date"
          value={draft.pickupDate}
        />
        <Select
          label="Ventana horaria"
          name="pickupWindow"
          onChange={(event) => onUpdate('pickupWindow', event.target.value)}
          options={[
            { label: '07:00 - 09:00', value: '07:00 - 09:00' },
            { label: '09:00 - 12:00', value: '09:00 - 12:00' },
            { label: '12:00 - 15:00', value: '12:00 - 15:00' },
            { label: '15:00 - 18:00', value: '15:00 - 18:00' },
          ]}
          value={draft.pickupWindow}
        />
        <label className="checkbox-row" htmlFor="portalWaiting">
          <input
            checked={draft.requiresWaitingTime}
            id="portalWaiting"
            onChange={(event) => onUpdate('requiresWaitingTime', event.target.checked)}
            type="checkbox"
          />
          <span>Requiere espera</span>
        </label>
        <label className="checkbox-row" htmlFor="portalLoading">
          <input
            checked={draft.requiresLoadingHelp}
            id="portalLoading"
            onChange={(event) => onUpdate('requiresLoadingHelp', event.target.checked)}
            type="checkbox"
          />
          <span>Ayuda de carga</span>
        </label>
        <label className="checkbox-row" htmlFor="portalUnloading">
          <input
            checked={draft.requiresUnloadingHelp}
            id="portalUnloading"
            onChange={(event) => onUpdate('requiresUnloadingHelp', event.target.checked)}
            type="checkbox"
          />
          <span>Ayuda de descarga</span>
        </label>
      </div>
      <div className={styles.insightGrid}>
        <Metric label="Distancia estimada" value={`${routeInsight.distanceKm.toLocaleString('es-CL')} km`} />
        <Metric label="Tiempo estimado" value={routeInsight.durationText} />
        <Metric label="Disponibilidad inicial" value={isCalculating ? 'Calculando...' : routeInsight.availabilityLabel} />
      </div>
      {selectedCustomer ? (
        <CustomerCreditDecisionPanel customer={selectedCustomer} customerName={selectedCustomer.name} quoteTotal={0} title="Condicion comercial" />
      ) : null}
      {previousRequests.length > 0 ? (
        <div className="stack-tight">
          <strong>Rutas frecuentes</strong>
          <div className={styles.insightGrid}>
            {previousRequests.map((request) => (
              <button className={styles.routeCard} key={request.id} onClick={() => onRepeatRequest(request)} type="button">
                <strong>{request.originAddress} a {request.destinationAddress}</strong>
                <span className="muted-text">{CARGO_TYPE_LABELS[request.cargoType]} / repetir solicitud</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function CargoStep({
  draft,
  onUpdate,
  validationAlerts,
}: {
  draft: ClientFreightDraft
  onUpdate: <TKey extends keyof ClientFreightDraft>(key: TKey, value: ClientFreightDraft[TKey]) => void
  validationAlerts: Array<{ blocking: boolean; message: string; tone: 'danger' | 'warning' }>
}) {
  const truckType = getSuggestedTruckType(draft)

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>Tipo de carga</h2>
          <p>Validamos capacidad, tipo de camion y condiciones especiales antes de enviar.</p>
        </div>
        <Badge tone={truckType.requiresValidation ? 'warning' : 'success'}>{truckType.label}</Badge>
      </div>
      <div className="form-grid">
        <Select
          label="Tipo de carga"
          name="cargoType"
          onChange={(event) => onUpdate('cargoType', event.target.value as CargoType)}
          options={CARGO_TYPE_OPTIONS}
          required
          value={draft.cargoType}
        />
        <Input
          label="Peso kg"
          min={0}
          name="weightKg"
          onChange={(event) => onUpdate('weightKg', Number(event.target.value))}
          type="number"
          value={draft.weightKg || ''}
        />
        <Input
          label="Volumen m3"
          min={0}
          name="volumeM3"
          onChange={(event) => onUpdate('volumeM3', Number(event.target.value))}
          type="number"
          value={draft.volumeM3 || ''}
        />
        <Input
          label="Bultos / pallets"
          min={1}
          name="packageCount"
          onChange={(event) => onUpdate('packageCount', Number(event.target.value))}
          type="number"
          value={draft.packageCount || ''}
        />
        <Input
          className="span-2"
          label="Descripcion de carga"
          name="cargoDescription"
          onChange={(event) => onUpdate('cargoDescription', event.target.value)}
          placeholder="Producto, embalaje, restricciones, manipulacion"
          value={draft.cargoDescription}
        />
        <Input
          className="span-2"
          label="Fotos o documentos opcionales"
          name="documentsNote"
          onChange={(event) => onUpdate('documentsNote', event.target.value)}
          placeholder="Indica guia, OC, packing list o link a documentos"
          value={draft.documentsNote}
        />
      </div>
      <div className={styles.insightGrid}>
        <Metric label="Camion sugerido" value={truckType.label} />
        <Metric label="Capacidad" value={truckType.capacity} />
        <Metric label="Validacion especial" value={truckType.requiresValidation ? 'Requerida' : 'No requerida'} />
      </div>
      <ValidationAlerts alerts={validationAlerts.filter((alert) => alert.message.includes('carga') || alert.message.includes('capacidad'))} />
    </section>
  )
}

function AvailabilityStep({
  onSelect,
  options,
  selectedOptionId,
}: {
  onSelect: (id: string) => void
  options: AvailabilityOption[]
  selectedOptionId: string
}) {
  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>Disponibilidad</h2>
          <p>Elige la alternativa segun costo, velocidad o riesgo operativo.</p>
        </div>
        <Badge tone="info">{options.length} alternativas</Badge>
      </div>
      <div className={styles.optionGrid}>
        {options.map((option) => (
          <button
            className={[styles.optionCard, option.id === selectedOptionId ? styles.optionSelected : ''].filter(Boolean).join(' ')}
            key={option.id}
            onClick={() => onSelect(option.id)}
            type="button"
          >
            <div className={styles.optionTop}>
              <strong>{option.label}</strong>
              <AvailabilityBadge status={option.status} />
            </div>
            <span>Retiro: {option.pickupDate || 'Fecha pendiente'}, {option.window}</span>
            <span>Camion sugerido: {option.truckType}</span>
            <span>Tiempo estimado: {option.timeEstimate}</span>
            <span>Riesgo: {option.risk}</span>
            <strong>{formatCurrency(option.estimatedTotal)}</strong>
            <span className="muted-text">Accion: {option.action}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

function CostStep({
  calculation,
  calculationError,
  selectedAvailability,
}: {
  calculation: FreightPricingCalculation | null
  calculationError: string
  selectedAvailability?: AvailabilityOption
}) {
  if (calculationError) {
    return <ErrorState description={calculationError} title="No se pudo calcular el costo" />
  }

  if (!calculation || !selectedAvailability) {
    return (
      <section className={styles.sectionCard}>
        <EmptyState
          description="Completa origen, destino y carga para obtener un costo vivo desde backend."
          icon={<Clock3 size={22} />}
          title="Costo pendiente"
        />
      </section>
    )
  }

  const adjustment = selectedAvailability.estimatedTotal - calculation.total

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>Costo estimado</h2>
          <p>Este costo se calcula con pricing backend y queda sujeto a validacion operacional.</p>
        </div>
        <Badge tone="warning">Sujeto a validacion</Badge>
      </div>
      <FreightCostBreakdown
        baseRate={calculation.baseRate}
        cargoTypeSurcharge={calculation.cargoTypeSurcharge}
        dieselPricePerLiter={calculation.dieselPricePerLiter}
        estimatedKm={calculation.estimatedKm}
        fuelCost={calculation.fuelCost}
        fuelLiters={calculation.fuelLiters}
        fuelPriceSource={calculation.fuelPriceSource}
        kmRate={calculation.kmRate}
        loadingCost={calculation.loadingCost}
        marginAmount={calculation.marginAmount}
        operationCost={calculation.operationCost}
        operationCostPerKm={calculation.operationCostPerKm}
        subtotal={calculation.subtotal}
        taxAmount={calculation.taxAmount}
        tollCost={calculation.tollCost}
        total={calculation.total}
        unloadingCost={calculation.unloadingCost}
        waitingCost={calculation.waitingCost}
      />
      {adjustment !== 0 ? (
        <div className={styles.costRow}>
          <span>{adjustment > 0 ? 'Recargo por disponibilidad' : 'Descuento alternativa seleccionada'}</span>
          <strong>{formatCurrency(adjustment)}</strong>
        </div>
      ) : null}
      <div className={styles.successPanel}>
        <span>Costo estimado de la alternativa</span>
        <strong className={styles.costTotal}>{formatCurrency(selectedAvailability.estimatedTotal)}</strong>
        <span>El costo confirmado se emite cuando operaciones valida camion, ruta y ventana.</span>
      </div>
    </section>
  )
}

function ConfirmationStep({
  calculation,
  draft,
  isSaving,
  onSubmit,
  selectedAvailability,
  selectedCustomer,
  validationAlerts,
}: {
  calculation: FreightPricingCalculation | null
  draft: ClientFreightDraft
  isSaving: boolean
  onSubmit: () => void
  selectedAvailability?: AvailabilityOption
  selectedCustomer?: Customer
  validationAlerts: Array<{ blocking: boolean; message: string; tone: 'danger' | 'warning' }>
}) {
  const blockingAlerts = validationAlerts.filter((alert) => alert.blocking)

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>Confirmacion</h2>
          <p>Revisa los datos finales antes de enviar a validacion operacional.</p>
        </div>
        <Badge tone={blockingAlerts.length > 0 ? 'danger' : 'success'}>{blockingAlerts.length > 0 ? 'Faltan datos' : 'Lista para enviar'}</Badge>
      </div>
      <ValidationAlerts alerts={validationAlerts} />
      <div className={styles.insightGrid}>
        <Metric label="Cliente" value={draft.customerName || selectedCustomer?.name || 'Sin cliente'} />
        <Metric label="Ruta" value={`${draft.originAddress || '-'} -> ${draft.destinationAddress || '-'}`} />
        <Metric label="Fecha" value={`${draft.pickupDate || '-'} ${draft.pickupWindow}`} />
        <Metric label="Carga" value={CARGO_TYPE_LABELS[draft.cargoType]} />
        <Metric label="Disponibilidad" value={selectedAvailability?.label || 'Pendiente'} />
        <Metric label="Costo estimado" value={selectedAvailability ? formatCurrency(selectedAvailability.estimatedTotal) : 'Pendiente'} />
      </div>
      <div className="inline-actions">
        <Button
          disabled={isSaving || blockingAlerts.length > 0 || !calculation}
          icon={<Send size={18} />}
          onClick={onSubmit}
          type="button"
        >
          {isSaving ? 'Enviando...' : 'Enviar solicitud'}
        </Button>
        <span className="muted-text">Se generara numero de seguimiento, solicitud y cotizacion borrador.</span>
      </div>
    </section>
  )
}

function FreightRequestSummaryPanel({
  draft,
  nextStep,
  routeInsight,
  selectedAvailability,
}: {
  draft: ClientFreightDraft
  nextStep: string
  routeInsight: ReturnType<typeof getRouteInsight>
  selectedAvailability?: AvailabilityOption
}) {
  return (
    <aside className={styles.summaryPanel}>
      <div className="split-row">
        <strong>Resumen de solicitud</strong>
        <PackageCheck size={18} />
      </div>
      <SummaryItem label="Origen" value={draft.originAddress || 'Pendiente'} />
      <SummaryItem label="Destino" value={draft.destinationAddress || 'Pendiente'} />
      <SummaryItem label="Fecha" value={draft.pickupDate ? `${draft.pickupDate} / ${draft.pickupWindow}` : 'Pendiente'} />
      <SummaryItem label="Carga" value={CARGO_TYPE_LABELS[draft.cargoType]} />
      <SummaryItem label="Peso / volumen" value={`${draft.weightKg || 0} kg / ${draft.volumeM3 || 0} m3`} />
      <SummaryItem label="Disponibilidad" value={selectedAvailability?.label || routeInsight.availabilityLabel} />
      <SummaryItem label="Costo estimado" value={selectedAvailability ? formatCurrency(selectedAvailability.estimatedTotal) : 'Pendiente'} />
      <SummaryItem label="Proximo paso" value={nextStep} />
    </aside>
  )
}

function WizardControls({
  activeStep,
  onStepChange,
}: {
  activeStep: ClientFreightStep
  onStepChange: (step: ClientFreightStep) => void
}) {
  const currentIndex = steps.findIndex((step) => step.key === activeStep)
  const previousStep = steps[Math.max(0, currentIndex - 1)]?.key
  const nextStep = steps[Math.min(steps.length - 1, currentIndex + 1)]?.key

  return (
    <div className="inline-actions">
      <Button disabled={currentIndex === 0} onClick={() => onStepChange(previousStep)} type="button" variant="secondary">
        Atras
      </Button>
      <Button disabled={currentIndex === steps.length - 1} onClick={() => onStepChange(nextStep)} type="button">
        Continuar
      </Button>
      <Button
        icon={<RotateCcw size={17} />}
        onClick={() => {
          window.localStorage.removeItem(draftStorageKey)
          window.location.reload()
        }}
        type="button"
        variant="ghost"
      >
        Limpiar borrador
      </Button>
    </div>
  )
}

function SubmittedPanel({
  portalRoutes,
  submitted,
}: {
  portalRoutes: ReturnType<typeof getPortalRoutes>
  submitted: SubmittedFreightRequest
}) {
  return (
    <section className={styles.successPanel}>
      <div className="split-row">
        <div>
          <h2>Solicitud enviada - pendiente de validacion operacional</h2>
          <p>Tu numero de seguimiento es {submitted.trackingNumber}. Tambien se creo una cotizacion borrador conectada a comunicaciones.</p>
        </div>
        <CheckCircle2 size={28} />
      </div>
      <div className="inline-actions">
        <Link to={portalRoutes.tracking(submitted.trackingNumber)}>
          <Button type="button">Ver seguimiento</Button>
        </Link>
        {submitted.quote ? (
          <EntityLink id={submitted.quote.id} type="freightQuote">
            Abrir cotizacion interna
          </EntityLink>
        ) : null}
      </div>
    </section>
  )
}

function ValidationAlerts({ alerts }: { alerts: Array<{ blocking: boolean; message: string; tone: 'danger' | 'warning' }> }) {
  if (alerts.length === 0) {
    return null
  }

  return (
    <div className="stack-tight">
      {alerts.map((alert) => (
        <div className="surface-panel split-row" key={alert.message}>
          <span>{alert.message}</span>
          <Badge tone={alert.tone}>{alert.blocking ? 'Bloquea envio' : 'Revisar'}</Badge>
        </div>
      ))}
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.summaryItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.insightCard}>
      <span className="muted-text">{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function AvailabilityBadge({ status }: { status: AvailabilityTone }) {
  const tone = status === 'available' ? 'success' : status === 'low' ? 'warning' : status === 'manual' ? 'info' : 'danger'
  const label = {
    available: 'Alta disponibilidad',
    low: 'Baja disponibilidad',
    manual: 'Requiere validacion',
    unavailable: 'No disponible',
  }[status]

  return <Badge tone={tone}>{label}</Badge>
}

function SupportAction({ portalRoutes }: { portalRoutes: ReturnType<typeof getPortalRoutes> }) {
  if (portalRoutes.support.startsWith('mailto:')) {
    return (
      <a className={styles.portalActionLink} href={portalRoutes.support}>
        <MessageCircle size={17} />
        <span>Contactar soporte</span>
      </a>
    )
  }

  return (
    <Link className={styles.portalActionLink} to={portalRoutes.support}>
      <MessageCircle size={17} />
      <span>Contactar soporte</span>
    </Link>
  )
}

function getPortalRoutes(isInternal: boolean) {
  return {
    history: isInternal ? ROUTES.freightClientPortalHistory : ROUTES.clientFreightHistory,
    request: isInternal ? ROUTES.freightClientPortal : ROUTES.clientFreightRequest,
    requests: isInternal ? ROUTES.freightClientPortalRequests : ROUTES.clientFreightRequests,
    support: isInternal
      ? `${ROUTES.communications}?createChat=1`
      : 'mailto:soporte@truckworkshop.cl?subject=Soporte%20solicitud%20de%20flete',
    tracking: isInternal ? ROUTES.freightClientPortalTracking : ROUTES.clientFreightTracking,
  }
}

function loadDraft() {
  try {
    const rawDraft = window.localStorage.getItem(draftStorageKey)

    return rawDraft ? { ...initialDraft, ...JSON.parse(rawDraft) } as ClientFreightDraft : initialDraft
  } catch {
    return initialDraft
  }
}

function getRouteInsight(draft: ClientFreightDraft, calculation: FreightPricingCalculation | null) {
  const distanceKm = Math.round(calculation?.route?.distanceKm || calculation?.estimatedKm || estimateKm(draft.originAddress, draft.destinationAddress))
  const durationText = calculation?.route?.durationText || estimateDuration(distanceKm)
  const coverage = !draft.originAddress || !draft.destinationAddress
    ? 'pending'
    : distanceKm > 1500
      ? 'out'
      : distanceKm > 900
        ? 'review'
        : 'covered'
  const coverageLabel = {
    covered: 'Zona cubierta',
    out: 'Fuera de cobertura',
    pending: 'Falta ruta',
    review: 'Cobertura por validar',
  }[coverage]
  const availabilityLabel = coverage === 'covered' ? 'Disponible' : coverage === 'review' ? 'Validacion operacional' : coverageLabel

  return { availabilityLabel, coverage, coverageLabel, distanceKm, durationText }
}

function buildAvailabilityOptions(
  draft: ClientFreightDraft,
  routeInsight: ReturnType<typeof getRouteInsight>,
  calculation: FreightPricingCalculation | null,
) {
  const baseTotal = calculation?.total || 0
  const truckType = getSuggestedTruckType(draft)
  const requiresManual = routeInsight.coverage !== 'covered' || truckType.requiresValidation
  const pickupDate = draft.pickupDate || 'Fecha por definir'
  const baseWindow = draft.pickupWindow || '09:00 - 12:00'
  const options: AvailabilityOption[] = [
    {
      action: requiresManual ? 'validar con ejecutivo' : 'reservar ventana',
      estimatedTotal: Math.round(baseTotal * (requiresManual ? 1.08 : 1)),
      id: 'recommended',
      label: 'Opcion recomendada',
      pickupDate,
      risk: requiresManual ? 'Medio' : 'Bajo',
      status: requiresManual ? 'manual' : 'available',
      timeEstimate: routeInsight.durationText,
      truckType: truckType.label,
      window: baseWindow,
    },
    {
      action: 'priorizar despacho',
      estimatedTotal: Math.round(baseTotal * 1.12),
      id: 'fast',
      label: 'Mas rapida',
      pickupDate,
      risk: 'Medio',
      status: routeInsight.coverage === 'out' ? 'unavailable' : 'low',
      timeEstimate: routeInsight.durationText,
      truckType: truckType.label,
      window: '07:00 - 09:00',
    },
    {
      action: 'tomar ventana flexible',
      estimatedTotal: Math.round(baseTotal * 0.96),
      id: 'cheap',
      label: 'Mas barata',
      pickupDate: nextDayLabel(draft.pickupDate),
      risk: 'Bajo',
      status: routeInsight.coverage === 'out' ? 'unavailable' : 'available',
      timeEstimate: routeInsight.durationText,
      truckType: truckType.label,
      window: '15:00 - 18:00',
    },
  ]

  return options
}

function getValidationAlerts(
  draft: ClientFreightDraft,
  routeInsight: ReturnType<typeof getRouteInsight>,
  selectedAvailability: AvailabilityOption | undefined,
  selectedCustomer?: Customer,
) {
  const alerts: Array<{ blocking: boolean; message: string; tone: 'danger' | 'warning' }> = []

  if (!draft.customerName && !selectedCustomer) {
    alerts.push({ blocking: true, message: 'Falta identificar el cliente solicitante.', tone: 'danger' })
  }

  if (!draft.contactEmail && !draft.contactPhone) {
    alerts.push({ blocking: true, message: 'Falta contacto para enviar seguimiento y cotizacion.', tone: 'danger' })
  }

  if (!draft.originAddress || !draft.destinationAddress) {
    alerts.push({ blocking: true, message: 'Direccion de retiro y entrega son obligatorias.', tone: 'danger' })
  }

  if (!draft.pickupDate) {
    alerts.push({ blocking: true, message: 'Fecha de retiro obligatoria.', tone: 'danger' })
  }

  if (routeInsight.coverage === 'out') {
    alerts.push({ blocking: true, message: 'Ruta fuera de cobertura automatica. Solicita validacion manual.', tone: 'danger' })
  }

  if (!draft.cargoType || draft.weightKg <= 0) {
    alerts.push({ blocking: true, message: 'Tipo de carga y peso valido son obligatorios.', tone: 'danger' })
  }

  if (draft.weightKg > 28000 || draft.volumeM3 > 90) {
    alerts.push({ blocking: true, message: 'La carga excede capacidad estandar y requiere operacion especial.', tone: 'danger' })
  }

  if (selectedAvailability?.status === 'unavailable') {
    alerts.push({ blocking: true, message: 'La alternativa seleccionada no tiene disponibilidad.', tone: 'danger' })
  }

  if (selectedCustomer && (!selectedCustomer.creditEnabled || selectedCustomer.riskLevel === 'high')) {
    alerts.push({ blocking: false, message: 'Cliente con credito restringido o riesgo alto. Puede requerir aprobacion interna.', tone: 'warning' })
  }

  if (draft.cargoType === 'HAZARDOUS' || draft.cargoType === 'OVERSIZED') {
    alerts.push({ blocking: false, message: 'Tipo de carga especial. Operaciones validara camion, permisos y tarifa final.', tone: 'warning' })
  }

  return alerts
}

function getSuggestedTruckType(draft: ClientFreightDraft) {
  if (draft.cargoType === 'REFRIGERATED') {
    return { capacity: 'Hasta 22 ton / control temperatura', label: 'Camion refrigerado', requiresValidation: true }
  }

  if (draft.cargoType === 'HAZARDOUS') {
    return { capacity: 'Operacion con permisos', label: 'Camion habilitado carga peligrosa', requiresValidation: true }
  }

  if (draft.cargoType === 'OVERSIZED' || draft.weightKg > 18000 || draft.volumeM3 > 70) {
    return { capacity: 'Hasta 28 ton / alto volumen', label: 'Tracto + rampla', requiresValidation: draft.cargoType === 'OVERSIZED' }
  }

  return { capacity: 'Hasta 12 ton / carga general', label: 'Camion rigido', requiresValidation: false }
}

function estimateKm(origin: string, destination: string) {
  if (!origin || !destination) {
    return 0
  }

  const seed = `${origin}-${destination}`.length

  return Math.max(35, Math.min(1400, seed * 9))
}

function estimateDuration(distanceKm: number) {
  if (distanceKm <= 0) {
    return 'Pendiente'
  }

  const hours = Math.max(1, distanceKm / 62)
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)

  return `${wholeHours}h ${minutes}min`
}

function nextDayLabel(value: string) {
  if (!value) {
    return 'Siguiente dia habil'
  }

  const date = new Date(`${value}T12:00:00`)
  date.setDate(date.getDate() + 1)

  return date.toISOString().slice(0, 10)
}

function toIsoPickupDate(value: string) {
  return value ? new Date(`${value}T12:00:00`).toISOString() : undefined
}

function buildPortalObservation(draft: ClientFreightDraft, option: AvailabilityOption, trackingNumber: string) {
  return [
    `Portal cliente - seguimiento ${trackingNumber}`,
    `Ventana seleccionada: ${option.label} / ${option.window}`,
    draft.documentsNote ? `Documentos: ${draft.documentsNote}` : '',
    draft.cargoDescription ? `Carga: ${draft.cargoDescription}` : '',
  ].filter(Boolean).join('\n')
}

async function createTrackingCommunication(request: FreightRequest, quote: FreightQuote, trackingNumber: string) {
  const now = new Date().toISOString()
  const contactAddress = request.customerEmail || request.customerPhone || 'portal-cliente@truckworkshop.local'
  const subject = `Seguimiento ${trackingNumber} - ${request.requestNumber}`
  const body = [
    `Hola ${request.customerName}, recibimos tu solicitud de flete.`,
    `Numero de seguimiento: ${trackingNumber}.`,
    `Cotizacion estimada: ${quote.quoteNumber} por ${formatCurrency(quote.total)}.`,
    'Estado actual: pendiente de validacion operacional.',
    'Te avisaremos cuando la cotizacion quede confirmada y el camion sea asignado.',
  ].join('\n')
  const conversation = await createResource<CommunicationConversation, Partial<CommunicationConversation>>('/communications/conversations', {
    assignedTo: 'Operaciones logistica',
    channel: 'email',
    contactAddress,
    contactName: request.customerName,
    lastMessageAt: now,
    lastMessagePreview: `Solicitud recibida. Seguimiento ${trackingNumber}.`,
    priority: request.availabilityStatus === 'manual' ? 'high' : 'medium',
    profileId: 'profile-freight-ops',
    profileName: 'Operaciones flete',
    relatedEntityId: request.id,
    relatedEntityLabel: trackingNumber,
    relatedEntityType: 'freight-request',
    status: 'open',
    subject,
    tags: ['portal-cliente', 'flete', trackingNumber],
  })

  await createResource<CommunicationMessage, Partial<CommunicationMessage>>('/communications/messages', {
    attachments: [],
    body,
    channel: 'email',
    conversationId: conversation.id,
    direction: 'outbound',
    fromAddress: 'operaciones@truckworkshop.local',
    fromName: 'Truck Workshop',
    profileId: 'profile-freight-ops',
    provider: 'simulation',
    providerStatus: 'simulated',
    sentAt: now,
    sentByIntegration: true,
    status: 'sent',
    subject,
    toAddress: contactAddress,
    toName: request.customerName,
  })

  await createResource<CommunicationQuoteLink, Partial<CommunicationQuoteLink>>('/communications/quote-links', {
    conversationId: conversation.id,
    customerName: request.customerName,
    linkedBy: 'Portal cliente',
    notes: `Seguimiento ${trackingNumber}`,
    quoteId: quote.id,
    quoteNumber: quote.quoteNumber,
    quoteType: 'freight',
    status: quote.status,
    total: quote.total,
  })
}

function findQuoteForRequest(request: FreightRequest, quotes: FreightQuote[]) {
  return quotes.find((quote) => quote.id === request.quoteId || quote.requestId === request.id)
}

function getHistorySummary(requests: FreightRequest[], quotes: FreightQuote[]) {
  const totalCost = requests.reduce((sum, request) => sum + (findQuoteForRequest(request, quotes)?.total || 0), 0)

  return {
    averageCost: requests.length > 0 ? Math.round(totalCost / requests.length) : 0,
    totalCost,
    totalRequests: requests.length,
  }
}

function getFrequentRoutes(requests: FreightRequest[], quotes: FreightQuote[]) {
  const routes = new Map<string, { count: number; key: string; label: string; query: string; totalCost: number }>()

  requests.forEach((request) => {
    const origin = request.originAddress || 'Origen pendiente'
    const destination = request.destinationAddress || 'Destino pendiente'
    const key = `${origin} -> ${destination}`
    const current = routes.get(key) || {
      count: 0,
      key,
      label: key,
      query: `${origin} ${destination}`,
      totalCost: 0,
    }

    routes.set(key, {
      ...current,
      count: current.count + 1,
      totalCost: current.totalCost + (findQuoteForRequest(request, quotes)?.total || 0),
    })
  })

  return [...routes.values()]
    .sort((first, second) => second.count - first.count || second.totalCost - first.totalCost)
    .slice(0, 6)
}

function getClientNextStep(request: FreightRequest, quote?: FreightQuote) {
  if (!quote) {
    return 'Operaciones debe validar y cotizar'
  }

  if (quote.status === 'DRAFT') {
    return 'Cotizacion en validacion operacional'
  }

  if (quote.status === 'SENT') {
    return 'Revisar y aprobar cotizacion'
  }

  if (quote.status === 'APPROVED' && request.status === 'APPROVED') {
    return 'Asignar camion y chofer'
  }

  if (request.status === 'ASSIGNED') {
    return 'Retiro programado'
  }

  if (request.status === 'IN_TRANSIT') {
    return 'Seguir ruta'
  }

  if (request.status === 'DELIVERED') {
    return 'Cerrar solicitud'
  }

  return 'Esperando actualizacion'
}

function buildTrackingTimeline(request: FreightRequest, quote?: FreightQuote, assignment?: FreightAssignment) {
  const statusOrder = ['NEW', 'QUOTING', 'QUOTE_SENT', 'APPROVED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED']
  const currentIndex = statusOrder.indexOf(request.status)

  return [
    {
      detail: `Recibida como ${request.requestNumber}`,
      done: true,
      label: 'Solicitud recibida',
    },
    {
      current: request.status === 'QUOTING' || quote?.status === 'DRAFT',
      detail: quote ? `Cotizacion ${quote.quoteNumber} en preparacion` : 'Pendiente de tarifa final',
      done: Boolean(quote),
      label: 'En validacion',
    },
    {
      current: quote?.status === 'SENT',
      detail: quote?.status === 'SENT' ? 'Cotizacion enviada al cliente' : 'Aun no enviada',
      done: quote?.status === 'SENT' || quote?.status === 'APPROVED',
      label: 'Cotizacion enviada',
    },
    {
      current: quote?.status === 'APPROVED',
      detail: quote?.status === 'APPROVED' ? 'Aprobada por cliente' : 'Pendiente aprobacion',
      done: quote?.status === 'APPROVED',
      label: 'Aprobada',
    },
    {
      current: request.status === 'ASSIGNED',
      detail: assignment ? `Camion ${assignment.truckId} / chofer ${assignment.driverId}` : 'Pendiente asignacion',
      done: Boolean(assignment) || currentIndex >= 4,
      label: 'Camion asignado',
    },
    {
      current: request.status === 'IN_TRANSIT',
      detail: request.status === 'IN_TRANSIT' ? 'Unidad en ruta' : 'Pendiente salida',
      done: currentIndex >= 5,
      label: 'En ruta',
    },
    {
      current: request.status === 'DELIVERED',
      detail: request.status === 'DELIVERED' ? 'Entrega confirmada' : 'Pendiente entrega',
      done: request.status === 'DELIVERED',
      label: 'Entregado',
    },
  ]
}

function requestToDraft(request: FreightRequest): ClientFreightDraft {
  return {
    ...initialDraft,
    cargoDescription: request.cargoDescription,
    cargoType: request.cargoType,
    contactEmail: request.customerEmail || '',
    contactPhone: request.customerPhone || '',
    customerId: request.customerId || '',
    customerName: request.customerName,
    destinationAddress: request.destinationAddress,
    originAddress: request.originAddress,
    packageCount: request.packageCount || 1,
    pickupDate: request.requestedPickupDate ? request.requestedPickupDate.slice(0, 10) : '',
    pickupWindow: request.pickupWindow || initialDraft.pickupWindow,
    requiresLoadingHelp: request.requiresLoadingHelp,
    requiresUnloadingHelp: request.requiresUnloadingHelp,
    requiresWaitingTime: request.requiresWaitingTime,
    volumeM3: request.volumeM3 || 0,
    waitingHours: request.waitingHours || 0,
    weightKg: request.weightKg || 0,
  }
}

function quoteToCalculation(quote: FreightQuote | undefined, request: FreightRequest): FreightPricingCalculation | null {
  if (!quote) {
    return null
  }

  return {
    baseRate: quote.baseRate,
    cargoType: quote.cargoType,
    cargoTypeSurcharge: quote.cargoTypeSurcharge,
    currencyCode: 'CLP',
    dieselPricePerLiter: quote.dieselPricePerLiter || 0,
    distanceCost: quote.estimatedKm * quote.kmRate,
    estimatedKm: quote.estimatedKm || request.estimatedKm,
    fuelCost: quote.fuelCost || 0,
    fuelKmPerLiter: quote.fuelKmPerLiter || 0,
    fuelLiters: quote.fuelLiters || 0,
    kmRate: quote.kmRate,
    lineItems: [],
    loadingCost: quote.loadingCost,
    marginAmount: quote.marginAmount || 0,
    operationCost: quote.operationCost || 0,
    operationCostPerKm: quote.operationCostPerKm || 0,
    pricingConfigId: quote.pricingConfigId || '',
    pricingSnapshot: quote.pricingSnapshot,
    routePricingSnapshot: quote.routePricingSnapshot,
    subtotal: quote.subtotal,
    taxAmount: quote.taxAmount,
    tollCharge: quote.tollCost || 0,
    tollCost: quote.tollCost || 0,
    unloadingCost: quote.unloadingCost,
    waitingCost: quote.waitingCost,
    total: quote.total,
  }
}

function quoteToAvailability(request: FreightRequest, quote: FreightQuote): AvailabilityOption {
  return {
    action: 'seguir solicitud',
    estimatedTotal: quote.total,
    id: 'tracking',
    label: request.availabilityStatus === 'manual' ? 'Requiere validacion' : 'Opcion seleccionada',
    pickupDate: request.requestedPickupDate ? request.requestedPickupDate.slice(0, 10) : 'Pendiente',
    risk: request.availabilityStatus === 'manual' ? 'Medio' : 'Bajo',
    status: (request.availabilityStatus as AvailabilityTone) || 'available',
    timeEstimate: request.estimatedDurationText || estimateDuration(request.estimatedKm),
    truckType: getSuggestedTruckType(requestToDraft(request)).label,
    window: request.pickupWindow || initialDraft.pickupWindow,
  }
}
