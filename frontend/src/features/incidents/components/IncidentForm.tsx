import type { FormEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Ban,
  Camera,
  CheckCircle2,
  CircleHelp,
  ClipboardList,
  Clock3,
  FileText,
  History,
  Link2,
  Package,
  Route,
  Save,
  Search,
  ShieldAlert,
  TriangleAlert,
  Truck,
  UserRound,
  Wrench,
} from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { casesMock } from '../../../mocks/cases.mock'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { createResource } from '../../../shared/services/resourceApi'
import { driversMock } from '../../drivers/mocks/drivers.mock'
import type { Driver } from '../../drivers/types/driver.types'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import { freightRequestsMock } from '../../freight/mocks/freight.mock'
import type { FreightRequest } from '../../freight/types/freight.types'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import { incidentSeverityLabels, incidentTypeLabels } from '../constants/incidents.constants'
import { incidentsMock } from '../mocks/incidents.mock'
import type { Incident } from '../types/incidents.types'
import styles from './IncidentsModule.module.css'

type LookupKind = 'driver' | 'freight' | 'truck'

interface LookupResult {
  helper: string
  id: string
  kind: LookupKind
  subtitle: string
  title: string
}

const TECHNICAL_TYPES: Incident['incidentType'][] = ['ACCIDENT', 'DAMAGE', 'ROAD_FAILURE']
const FREIGHT_TYPES: Incident['incidentType'][] = ['DELAY', 'CUSTOMER_ISSUE', 'CARGO_ISSUE']

const INCIDENT_TYPE_CARDS: Array<{
  description: string
  icon: ReactNode
  label: string
  value: Incident['incidentType']
}> = [
  {
    description: 'Camion detenido o falla mecanica en ruta.',
    icon: <Wrench aria-hidden size={18} />,
    label: 'Panne / ruta',
    value: 'ROAD_FAILURE',
  },
  {
    description: 'Entrega o retiro con riesgo de atraso.',
    icon: <Clock3 aria-hidden size={18} />,
    label: 'Retraso',
    value: 'DELAY',
  },
  {
    description: 'Evento de seguridad, choque o tercero involucrado.',
    icon: <TriangleAlert aria-hidden size={18} />,
    label: 'Accidente',
    value: 'ACCIDENT',
  },
  {
    description: 'Dano, faltante, rechazo o bloqueo de carga.',
    icon: <Package aria-hidden size={18} />,
    label: 'Carga',
    value: 'CARGO_ISSUE',
  },
  {
    description: 'Parte, documento o infraccion en control.',
    icon: <FileText aria-hidden size={18} />,
    label: 'Multa',
    value: 'FINE',
  },
  {
    description: 'Cliente, chofer, robo, dano u otro evento.',
    icon: <CircleHelp aria-hidden size={18} />,
    label: 'Otro',
    value: 'OTHER',
  },
]

const SEVERITY_CARDS: Array<{
  detail: string
  label: string
  value: Incident['severity']
}> = [
  { detail: 'Se documenta y monitorea.', label: 'Menor', value: 'LOW' },
  { detail: 'Requiere coordinacion del turno.', label: 'Media', value: 'MEDIUM' },
  { detail: 'Afecta continuidad o cliente.', label: 'Alta', value: 'HIGH' },
  { detail: 'Entrega, seguridad o flota en riesgo.', label: 'Critica', value: 'CRITICAL' },
]

export function IncidentForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [lookupQuery, setLookupQuery] = useState('')
  const [selectedTruckId, setSelectedTruckId] = useState(searchParams.get('truckId') || '')
  const [selectedDriverId, setSelectedDriverId] = useState(searchParams.get('driverId') || '')
  const [selectedFreightId, setSelectedFreightId] = useState(searchParams.get('freightId') || '')
  const [selectedWorkshopCaseId, setSelectedWorkshopCaseId] = useState('')
  const [incidentType, setIncidentType] = useState<Incident['incidentType']>(
    (searchParams.get('incidentType') as Incident['incidentType']) || 'ROAD_FAILURE',
  )
  const [severity, setSeverity] = useState<Incident['severity']>(
    (searchParams.get('severity') as Incident['severity']) || 'MEDIUM',
  )
  const { data: trucks } = useResourceList<FleetTruck>('/fleet/trucks', fleetTrucksMock, { order: 'asc', sort: 'plate' })
  const { data: drivers } = useResourceList<Driver>('/drivers', driversMock, { order: 'asc', sort: 'name' })
  const { data: freightRequests } = useResourceList<FreightRequest>('/freight/requests', freightRequestsMock, {
    order: 'desc',
    sort: 'updatedAt',
  })
  const { data: workshopCases } = useResourceList<WorkshopCase>('/workshop-cases', casesMock, {
    order: 'desc',
    sort: 'updatedAt',
  })
  const { data: incidents } = useResourceList<Incident>('/incidents', incidentsMock, {
    order: 'desc',
    sort: 'occurredAt',
  })

  const selectedTruck = trucks.find((truck) => truck.id === selectedTruckId)
  const selectedDriver = drivers.find((driver) => driver.id === selectedDriverId)
  const selectedFreight = freightRequests.find((freight) => freight.id === selectedFreightId)
  const detectedWorkshopCase = workshopCases.find(
    (workshopCase) => workshopCase.truckId === selectedTruckId && workshopCase.status !== 'closed',
  )
  const selectedWorkshopCase = selectedWorkshopCaseId
    ? workshopCases.find((workshopCase) => workshopCase.id === selectedWorkshopCaseId)
    : undefined
  const contextWorkshopCase = selectedWorkshopCase || detectedWorkshopCase
  const truckOptions = trucks.map((truck) => ({
    label: `${truck.plate} / ${truck.brand} ${truck.model}`,
    value: truck.id,
  }))
  const driverOptions = drivers.map((driver) => ({
    label: `${driver.name} / ${driver.company}`,
    value: driver.id,
  }))
  const freightOptions = freightRequests.map((freight) => ({
    label: `${freight.requestNumber} / ${freight.customerName} / ${freight.originAddress} - ${freight.destinationAddress}`,
    value: freight.id,
  }))
  const suggestedConnections = useMemo(() => getSuggestedConnections(incidentType, severity), [incidentType, severity])
  const impactItems = useMemo(
    () => getImpactItems({ incidentType, openWorkshopCase: contextWorkshopCase, selectedFreight, selectedTruck, severity }),
    [contextWorkshopCase, incidentType, selectedFreight, selectedTruck, severity],
  )
  const guidance = getContextualGuidance(incidentType)
  const sla = getSlaCopy(severity)
  const showWorkshopField = TECHNICAL_TYPES.includes(incidentType) || severity === 'HIGH' || severity === 'CRITICAL'
  const truckIncidentsThisMonth = getTruckIncidentsThisMonth(incidents, selectedTruckId)

  const handleTruckChange = (truckId: string) => {
    const truck = trucks.find((item) => item.id === truckId)
    const nextWorkshopCase = workshopCases.find(
      (workshopCase) => workshopCase.truckId === truckId && workshopCase.status !== 'closed',
    )

    setSelectedTruckId(truckId)
    setSelectedWorkshopCaseId(nextWorkshopCase?.id || '')
    if (truck?.assignedDriverId) {
      setSelectedDriverId(truck.assignedDriverId)
    }
  }

  const handleFreightChange = (freightId: string) => {
    const freight = freightRequests.find((item) => item.id === freightId)

    setSelectedFreightId(freightId)
    if (freight?.assignedTruckId) {
      handleTruckChange(freight.assignedTruckId)
    }
    if (freight?.assignedDriverId) {
      setSelectedDriverId(freight.assignedDriverId)
    }
  }

  const lookupResults = useMemo(
    () => buildLookupResults({ drivers, freightRequests, query: lookupQuery, trucks }),
    [drivers, freightRequests, lookupQuery, trucks],
  )

  const handleLookupSelect = (result: LookupResult) => {
    if (result.kind === 'truck') {
      handleTruckChange(result.id)
    }

    if (result.kind === 'driver') {
      setSelectedDriverId(result.id)
    }

    if (result.kind === 'freight') {
      handleFreightChange(result.id)
    }

    setLookupQuery('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const estimatedCost = Number(formData.get('estimatedCost') || 0)
    const occurredAtInput = String(formData.get('occurredAt') || '')
    const truckId = String(formData.get('truckId') || '')
    const driverId = String(formData.get('driverId') || '')

    if (!truckId) {
      setErrorMessage('Selecciona el camion afectado para conectar la incidencia con flota y costos.')
      return
    }

    setErrorMessage('')
    setIsSaving(true)

    try {
      const incident = await createResource<Incident, Omit<Incident, 'id'>>('/incidents', {
        description: String(formData.get('description') || '').trim(),
        documents: splitComma(String(formData.get('documents') || '')),
        driverId: driverId || undefined,
        estimatedCost: estimatedCost > 0 ? estimatedCost : undefined,
        freightId: String(formData.get('freightId') || '') || undefined,
        incidentNumber: `INC-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
        incidentType,
        location: String(formData.get('location') || 'Sin ubicacion').trim(),
        notes: String(formData.get('notes') || '').trim(),
        occurredAt: occurredAtInput ? new Date(occurredAtInput).toISOString() : new Date().toISOString(),
        photos: splitComma(String(formData.get('photos') || '')),
        severity,
        status: 'OPEN',
        truckId,
        workshopCaseId: String(formData.get('workshopCaseId') || '') || undefined,
      })

      navigate(ROUTES.incidentDetail(incident.id))
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className={styles.incidentWorkbench} onSubmit={handleSubmit}>
      {errorMessage ? (
        <div className={styles.workbenchAlert}>
          <ErrorState description={errorMessage} title="No se pudo registrar el incidente" />
        </div>
      ) : null}

      <div className={styles.incidentMainStack}>
        <Card className={styles.operationalSection}>
          <SectionLabel kicker="1. Que paso" title="Clasifica el evento en segundos" />
          <div className={styles.spotlightSearch}>
            <label htmlFor="incidentLookup">
              <Search aria-hidden size={16} />
              <span>Buscar patente, chofer, flete o cliente</span>
            </label>
            <input
              autoComplete="off"
              id="incidentLookup"
              onChange={(event) => setLookupQuery(event.target.value)}
              placeholder="KL-DF-91, Marcela Soto, FLE-2026..."
              type="search"
              value={lookupQuery}
            />
            {lookupResults.length > 0 ? (
              <div className={styles.lookupResults}>
                {lookupResults.map((result) => (
                  <button key={`${result.kind}-${result.id}`} onClick={() => handleLookupSelect(result)} type="button">
                    <span className={styles.entityIcon}>{getLookupIcon(result.kind)}</span>
                    <span>
                      <strong>{result.title}</strong>
                      <small>{result.subtitle}</small>
                    </span>
                    <em>{result.helper}</em>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className={styles.typeCardGrid} role="radiogroup" aria-label="Tipo de incidencia">
            {INCIDENT_TYPE_CARDS.map((item) => (
              <button
                aria-checked={incidentType === item.value}
                className={[styles.typeCard, incidentType === item.value ? styles.typeCardActive : ''].filter(Boolean).join(' ')}
                key={item.value}
                onClick={() => setIncidentType(item.value)}
                role="radio"
                type="button"
              >
                <span className={styles.typeIcon}>{item.icon}</span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </button>
            ))}
          </div>

          <label className={[styles.textareaField, styles.operationalTextarea].join(' ')} htmlFor="description">
            <span>Que ocurrio exactamente?</span>
            <textarea
              defaultValue={searchParams.get('description') || ''}
              id="description"
              name="description"
              placeholder={guidance.descriptionPlaceholder}
              required
            />
          </label>
        </Card>

        <Card className={styles.operationalSection}>
          <SectionLabel kicker="2. A que afecta" title="Contexto operacional" />
          <div className={styles.formGrid}>
            <Select
              className={FREIGHT_TYPES.includes(incidentType) ? styles.highlightField : undefined}
              label="Flete relacionado"
              name="freightId"
              onChange={(event) => handleFreightChange(event.target.value)}
              options={[{ label: 'Sin flete relacionado', value: '' }, ...freightOptions]}
              value={selectedFreightId}
            />
            <Select
              label="Camion afectado"
              name="truckId"
              onChange={(event) => handleTruckChange(event.target.value)}
              options={[{ label: 'Selecciona camion', value: '' }, ...truckOptions]}
              required
              value={selectedTruckId}
            />
            <Select
              label="Chofer involucrado"
              name="driverId"
              onChange={(event) => setSelectedDriverId(event.target.value)}
              options={[{ label: 'Sin chofer asociado', value: '' }, ...driverOptions]}
              value={selectedDriverId}
            />
            <Input defaultValue={getDatetimeLocalDefault()} label="Fecha y hora" name="occurredAt" type="datetime-local" />
            {showWorkshopField ? (
              <Select
                className={styles.span2}
                label="Caso taller existente"
                name="workshopCaseId"
                onChange={(event) => setSelectedWorkshopCaseId(event.target.value)}
                options={[
                  { label: 'Sin caso taller', value: '' },
                  ...workshopCases
                    .filter((workshopCase) => !selectedTruckId || workshopCase.truckId === selectedTruckId)
                    .map((workshopCase) => ({ label: `${workshopCase.caseNumber} / ${workshopCase.title}`, value: workshopCase.id })),
                ]}
                value={selectedWorkshopCaseId}
              />
            ) : null}
            <Input
              label={incidentType === 'FINE' ? 'Monto multa' : 'Costo estimado'}
              min={0}
              name="estimatedCost"
              type="number"
            />
            <Input
              label="Ubicacion"
              name="location"
              placeholder={incidentType === 'FINE' ? 'Control, comuna o ruta' : 'Ruta, taller, planta o ciudad'}
            />
          </div>
        </Card>

        <Card className={styles.operationalSection}>
          <SectionLabel kicker="3. Que hacemos" title="Derivacion e impacto inmediato" />
          <div className={styles.severityCardGrid} role="radiogroup" aria-label="Severidad de la incidencia">
            {SEVERITY_CARDS.map((item) => (
              <button
                aria-checked={severity === item.value}
                className={[
                  styles.severityCard,
                  styles[`severity${item.value}`],
                  severity === item.value ? styles.severityCardActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={item.value}
                onClick={() => setSeverity(item.value)}
                role="radio"
                type="button"
              >
                <strong>{incidentSeverityLabels[item.value]}</strong>
                <span>{item.label}</span>
                <small>{item.detail}</small>
              </button>
            ))}
          </div>

          <div className={styles.derivationGrid}>
            {suggestedConnections.map((item) => (
              <div className={styles.derivationCard} key={item.title}>
                <div className={styles.derivationHeader}>
                  <span className={styles.entityIcon}>{item.icon}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                </div>
                <ul>
                  {item.steps.map((step) => (
                    <li key={step}>
                      <CheckCircle2 aria-hidden size={15} />
                      {step}
                    </li>
                  ))}
                </ul>
                <div className={styles.quickActionLine}>
                  {item.actions.map((action) => (
                    <Button key={action} size="sm" type="button" variant="secondary">
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className={styles.operationalSection}>
          <SectionLabel kicker="4. Trazabilidad" title="Evidencia y seguimiento" />
          <div className={styles.formGrid}>
            <label className={[styles.textareaField, styles.span2].join(' ')} htmlFor="notes">
              <span>Notas de seguimiento</span>
              <textarea
                id="notes"
                name="notes"
                placeholder={guidance.notesPlaceholder}
              />
            </label>
            <Input
              className={styles.span2}
              label={incidentType === 'FINE' ? 'Documento multa' : 'Documentos adjuntos'}
              name="documents"
              placeholder="/parte.pdf, /multa.pdf"
            />
            <Input className={styles.span2} label="Fotos adjuntas" name="photos" placeholder="/foto1.jpg, /foto2.jpg" />
          </div>
        </Card>
      </div>

      <aside className={styles.incidentSideRail}>
        <Card className={styles.contextSummary}>
          <div className={styles.contextSummaryHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Contexto detectado</h2>
              <p className={styles.metaText}>Se actualiza mientras eliges camion, chofer y flete.</p>
            </div>
            <Badge tone={severity === 'CRITICAL' || severity === 'HIGH' ? 'danger' : 'info'}>{sla.label}</Badge>
          </div>
          <div className={styles.detectedHero}>
            <span className={styles.entityIcon}>
              <Truck aria-hidden size={18} />
            </span>
            <div>
              <strong>{selectedTruck?.plate || 'Camion pendiente'}</strong>
              <p>{selectedTruck ? `${selectedTruck.brand} ${selectedTruck.model}` : 'Selecciona patente para activar contexto.'}</p>
            </div>
          </div>
          <div className={styles.contextList}>
            <ContextItem icon={<UserRound size={16} />} label="Chofer" value={selectedDriver?.name || selectedTruck?.assignedDriverName || 'Sin chofer'} />
            <ContextItem icon={<Route size={16} />} label="Flete" value={selectedFreight?.requestNumber || selectedTruck?.nextFreightId || 'Sin flete'} />
            <ContextItem icon={<Link2 size={16} />} label="Ruta" value={selectedFreight ? `${selectedFreight.originAddress} - ${selectedFreight.destinationAddress}` : 'Sin ruta'} />
            <ContextItem icon={<Wrench size={16} />} label="Taller" value={contextWorkshopCase?.caseNumber || 'No detectado'} />
          </div>
          {selectedTruck && truckIncidentsThisMonth > 0 ? (
            <div className={styles.liveWarning}>
              <TriangleAlert aria-hidden size={16} />
              <span>Camion con {truckIncidentsThisMonth} incidencias este mes.</span>
            </div>
          ) : null}
        </Card>

        <Card className={[styles.contextSummary, styles.impactPanel, styles[`impact${severity}`]].join(' ')}>
          <div className={styles.contextSummaryHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Impacto operacional</h2>
              <p className={styles.metaText}>{sla.detail}</p>
            </div>
            <ShieldAlert aria-hidden size={20} />
          </div>
          <div className={styles.impactList}>
            {impactItems.map((item) => (
              <span key={item}>
                <TriangleAlert aria-hidden size={14} />
                {item}
              </span>
            ))}
          </div>
        </Card>

        <Card className={styles.contextSummary}>
          <div className={styles.contextSummaryHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Bitacora</h2>
              <p className={styles.metaText}>Progreso antes de guardar.</p>
            </div>
            <History aria-hidden size={18} />
          </div>
          <div className={styles.timelinePreview}>
            <TimelinePreviewItem done title="Tipo definido" text={incidentTypeLabels[incidentType]} />
            <TimelinePreviewItem done={Boolean(selectedTruck)} title="Camion asociado" text={selectedTruck?.plate || 'Pendiente'} />
            <TimelinePreviewItem done title="Severidad" text={incidentSeverityLabels[severity]} />
            <TimelinePreviewItem done={Boolean(selectedFreight || contextWorkshopCase)} title="Modulo conectado" text={selectedFreight?.requestNumber || contextWorkshopCase?.caseNumber || 'Pendiente'} />
          </div>
        </Card>

        <Card className={styles.contextSummary}>
          <h2 className={styles.sectionTitle}>Accesos rapidos</h2>
          <div className={styles.sideActions}>
            <Link to={ROUTES.caseNew}>
              <Button fullWidth icon={<Wrench size={16} />} size="sm" type="button" variant="secondary">
                Abrir caso taller
              </Button>
            </Link>
            <Link to={ROUTES.fleetAvailability}>
              <Button fullWidth icon={<Ban size={16} />} size="sm" type="button" variant="secondary">
                Revisar disponibilidad
              </Button>
            </Link>
            <Link to={ROUTES.freightRequests}>
              <Button fullWidth icon={<Route size={16} />} size="sm" type="button" variant="secondary">
                Ver fletes
              </Button>
            </Link>
          </div>
        </Card>
      </aside>

      <div className={styles.incidentStickyFooter}>
        <div>
          <strong>Incidencia abierta</strong>
          <span>{selectedTruck ? `${selectedTruck.plate} / ${incidentSeverityLabels[severity]}` : 'Falta camion afectado'}</span>
        </div>
        <div className="inline-actions">
          <Link to={ROUTES.incidents}>
            <Button icon={<ArrowLeft size={16} />} type="button" variant="secondary">
              Cancelar
            </Button>
          </Link>
          <Button disabled={isSaving} icon={<Save size={18} />} type="submit">
            {isSaving ? 'Registrando...' : 'Registrar incidencia'}
          </Button>
        </div>
      </div>
    </form>
  )
}

function SectionLabel({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className={styles.operationLabel}>
      <span>{kicker}</span>
      <h2>{title}</h2>
    </div>
  )
}

function ContextItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className={styles.contextItem}>
      <span className={styles.entityIcon}>{icon}</span>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function TimelinePreviewItem({ done, text, title }: { done: boolean; text: string; title: string }) {
  return (
    <div className={done ? styles.timelinePreviewDone : undefined}>
      <span>{done ? <CheckCircle2 aria-hidden size={14} /> : <Clock3 aria-hidden size={14} />}</span>
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
    </div>
  )
}

function buildLookupResults({
  drivers,
  freightRequests,
  query,
  trucks,
}: {
  drivers: Driver[]
  freightRequests: FreightRequest[]
  query: string
  trucks: FleetTruck[]
}): LookupResult[] {
  const normalizedQuery = normalizeText(query)

  if (!normalizedQuery) {
    return []
  }

  const truckResults = trucks
    .filter((truck) => normalizeText(`${truck.plate} ${truck.brand} ${truck.model} ${truck.assignedDriverName || ''}`).includes(normalizedQuery))
    .slice(0, 3)
    .map((truck) => ({
      helper: truck.operationalStatus.replaceAll('_', ' '),
      id: truck.id,
      kind: 'truck' as const,
      subtitle: `${truck.brand} ${truck.model}`,
      title: truck.plate,
    }))

  const driverResults = drivers
    .filter((driver) => normalizeText(`${driver.name} ${driver.company} ${driver.license}`).includes(normalizedQuery))
    .slice(0, 2)
    .map((driver) => ({
      helper: driver.status === 'active' ? 'Chofer activo' : 'Chofer inactivo',
      id: driver.id,
      kind: 'driver' as const,
      subtitle: driver.company,
      title: driver.name,
    }))

  const freightResults = freightRequests
    .filter((freight) =>
      normalizeText(`${freight.requestNumber} ${freight.customerName} ${freight.originAddress} ${freight.destinationAddress}`).includes(
        normalizedQuery,
      ),
    )
    .slice(0, 3)
    .map((freight) => ({
      helper: freight.status.replaceAll('_', ' '),
      id: freight.id,
      kind: 'freight' as const,
      subtitle: freight.customerName,
      title: freight.requestNumber,
    }))

  return [...truckResults, ...freightResults, ...driverResults].slice(0, 6)
}

function getLookupIcon(kind: LookupKind) {
  if (kind === 'driver') {
    return <UserRound aria-hidden size={16} />
  }

  if (kind === 'freight') {
    return <Route aria-hidden size={16} />
  }

  return <Truck aria-hidden size={16} />
}

function getSuggestedConnections(type: Incident['incidentType'], severity: Incident['severity']) {
  const suggestions = [
    {
      actions: ['Notificar turno'],
      icon: <ClipboardList aria-hidden size={16} />,
      steps: ['Mantener trazabilidad en flota', 'Registrar ubicacion y evidencia', 'Asignar responsable operativo'],
      text: 'Toda incidencia queda visible para disponibilidad, costos y control operacional.',
      title: 'Flota y control',
    },
  ]

  if (TECHNICAL_TYPES.includes(type) || severity === 'CRITICAL') {
    suggestions.push({
      actions: ['Abrir caso taller', 'Bloquear camion'],
      icon: <Wrench aria-hidden size={16} />,
      steps: ['Evaluar continuidad del viaje', 'Revisar necesidad de grua', 'Bloquear disponibilidad si hay riesgo'],
      text: 'Conviene derivar a taller si hay seguridad, panne, dano o continuidad comprometida.',
      title: 'Taller',
    })
  }

  if (type === 'FINE') {
    suggestions.push({
      actions: ['Adjuntar multa', 'Revisar chofer'],
      icon: <FileText aria-hidden size={16} />,
      steps: ['Registrar monto y documento', 'Vincular chofer', 'Revisar vencimientos asociados'],
      text: 'Las multas deben quedar trazadas contra chofer, camion y documento fiscalizador.',
      title: 'Documentacion',
    })
  }

  if (FREIGHT_TYPES.includes(type)) {
    suggestions.push({
      actions: ['Ver flete', 'Avisar cliente'],
      icon: <Route aria-hidden size={16} />,
      steps: ['Confirmar entrega afectada', 'Actualizar operaciones', 'Dejar observacion para cliente'],
      text: 'El flete necesita visibilidad inmediata para reasignar, informar o ajustar promesa.',
      title: 'Flete y cliente',
    })
  }

  if (severity === 'HIGH' || severity === 'CRITICAL') {
    suggestions.push({
      actions: ['Escalar supervisor', 'Adjuntar fotos'],
      icon: <Camera aria-hidden size={16} />,
      steps: ['Dejar evidencia visual', 'Confirmar responsable', 'Actualizar estado del activo'],
      text: 'La severidad requiere evidencia y escalamiento antes de que se pierda contexto.',
      title: 'Evidencia urgente',
    })
  }

  return suggestions
}

function getImpactItems({
  incidentType,
  openWorkshopCase,
  selectedFreight,
  selectedTruck,
  severity,
}: {
  incidentType: Incident['incidentType']
  openWorkshopCase?: WorkshopCase
  selectedFreight?: FreightRequest
  selectedTruck?: FleetTruck
  severity: Incident['severity']
}) {
  const items: string[] = []

  if (severity === 'CRITICAL') {
    items.push('Riesgo alto para seguridad o entrega')
  }

  if (severity === 'HIGH') {
    items.push('Requiere coordinacion del supervisor')
  }

  if (FREIGHT_TYPES.includes(incidentType) || selectedFreight) {
    items.push('Entrega o cliente puede verse afectado')
  }

  if (TECHNICAL_TYPES.includes(incidentType) || openWorkshopCase) {
    items.push('Puede bloquear disponibilidad de camion')
  }

  if (selectedTruck?.operationalStatus === 'BLOCKED' || selectedTruck?.operationalStatus === 'OUT_OF_SERVICE') {
    items.push('Camion ya registra bloqueo operacional')
  }

  if (incidentType === 'FINE') {
    items.push('Revisar documento, monto y chofer asociado')
  }

  return items.length > 0 ? items : ['Sin impacto critico detectado por ahora']
}

function getContextualGuidance(type: Incident['incidentType']) {
  if (type === 'FINE') {
    return {
      descriptionPlaceholder: 'Ejemplo: Control carretero cursa multa por documentacion. Indicar entidad, motivo y documento asociado.',
      notesPlaceholder: 'Entidad fiscalizadora, vencimiento, responsable de pago, documento adjunto.',
    }
  }

  if (type === 'DELAY') {
    return {
      descriptionPlaceholder: 'Ejemplo: Camion detenido por espera en planta cliente. Estimar atraso, cliente afectado y proxima accion.',
      notesPlaceholder: 'Nuevo ETA, quien fue notificado, impacto comercial y responsable de seguimiento.',
    }
  }

  if (type === 'ACCIDENT') {
    return {
      descriptionPlaceholder: 'Ejemplo: Colision lateral en Ruta 5 Sur km 214. Chofer informa dano visible y requiere evaluacion.',
      notesPlaceholder: 'Fotos, parte, terceros involucrados, estado del chofer, bloqueo de camion y contacto supervisor.',
    }
  }

  if (type === 'CARGO_ISSUE') {
    return {
      descriptionPlaceholder: 'Ejemplo: Cliente rechaza carga por dano en embalaje. Indicar bultos afectados y evidencia.',
      notesPlaceholder: 'Cantidad afectada, cliente notificado, fotos, responsable y resolucion esperada.',
    }
  }

  return {
    descriptionPlaceholder: 'Ejemplo: El camion quedo detenido por falla mecanica en Ruta 5 Sur km 214. Chofer informa perdida de potencia.',
    notesPlaceholder: 'Responsable, evidencia, proxima accion, si requiere taller, si afecta flete o documentacion.',
  }
}

function getSlaCopy(severity: Incident['severity']) {
  const labels: Record<Incident['severity'], { detail: string; label: string }> = {
    CRITICAL: { detail: 'Respuesta sugerida inmediata. Escalar y bloquear si aplica.', label: 'SLA ahora' },
    HIGH: { detail: 'Resolver coordinacion inicial antes de 30 min.', label: 'SLA 30 min' },
    LOW: { detail: 'Seguimiento operativo sin bloqueo inmediato.', label: 'Monitoreo' },
    MEDIUM: { detail: 'Coordinar responsable durante el turno.', label: 'SLA turno' },
  }

  return labels[severity]
}

function getTruckIncidentsThisMonth(incidents: Incident[], truckId: string) {
  if (!truckId) {
    return 0
  }

  const currentMonth = new Date().toISOString().slice(0, 7)

  return incidents.filter((incident) => incident.truckId === truckId && incident.occurredAt.slice(0, 7) === currentMonth).length
}

function getDatetimeLocalDefault() {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())

  return date.toISOString().slice(0, 16)
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function splitComma(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}
