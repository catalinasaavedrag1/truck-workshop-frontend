import type { FormEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ClipboardList, Link2, Save, Truck, UserRound } from 'lucide-react'
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
import styles from './IncidentsModule.module.css'
import { incidentSeverityOptions, incidentTypeOptions } from '../constants/incidents.constants'
import type { Incident } from '../types/incidents.types'

export function IncidentForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [selectedTruckId, setSelectedTruckId] = useState(searchParams.get('truckId') || '')
  const [selectedDriverId, setSelectedDriverId] = useState(searchParams.get('driverId') || '')
  const [selectedFreightId, setSelectedFreightId] = useState(searchParams.get('freightId') || '')
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
  const selectedTruck = trucks.find((truck) => truck.id === selectedTruckId)
  const selectedDriver = drivers.find((driver) => driver.id === selectedDriverId)
  const selectedFreight = freightRequests.find((freight) => freight.id === selectedFreightId)
  const openWorkshopCase = workshopCases.find(
    (workshopCase) => workshopCase.truckId === selectedTruckId && workshopCase.status !== 'closed',
  )
  const truckOptions = trucks.map((truck) => ({
    label: `${truck.plate} / ${truck.brand} ${truck.model}`,
    value: truck.id,
  }))
  const driverOptions = drivers.map((driver) => ({
    label: `${driver.name} / ${driver.company}`,
    value: driver.id,
  }))
  const freightOptions = freightRequests.map((freight) => ({
    label: `${freight.requestNumber} / ${freight.customerName} / ${freight.originAddress} -> ${freight.destinationAddress}`,
    value: freight.id,
  }))
  const suggestedConnections = useMemo(() => getSuggestedConnections(incidentType, severity), [incidentType, severity])

  const handleTruckChange = (truckId: string) => {
    const truck = trucks.find((item) => item.id === truckId)

    setSelectedTruckId(truckId)
    if (truck?.assignedDriverId) {
      setSelectedDriverId(truck.assignedDriverId)
    }
  }

  const handleFreightChange = (freightId: string) => {
    const freight = freightRequests.find((item) => item.id === freightId)

    setSelectedFreightId(freightId)
    if (freight?.assignedTruckId) {
      setSelectedTruckId(freight.assignedTruckId)
    }
    if (freight?.assignedDriverId) {
      setSelectedDriverId(freight.assignedDriverId)
    }
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
    <div className={styles.formLayout}>
      <Card className={styles.formStack}>
        <form className={styles.formGrid} onSubmit={handleSubmit}>
          {errorMessage ? (
            <div className={styles.span2}>
              <ErrorState description={errorMessage} title="No se pudo registrar el incidente" />
            </div>
          ) : null}

          <h2 className={[styles.sectionTitle, styles.span2].join(' ')}>Contexto operacional</h2>
          <Select
            className={styles.span2}
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
          <Select
            label="Caso taller existente"
            name="workshopCaseId"
            options={[
              { label: 'Sin caso taller', value: '' },
              ...workshopCases
                .filter((workshopCase) => !selectedTruckId || workshopCase.truckId === selectedTruckId)
                .map((workshopCase) => ({ label: `${workshopCase.caseNumber} / ${workshopCase.title}`, value: workshopCase.id })),
            ]}
          />
          <Input
            label="Fecha y hora"
            name="occurredAt"
            type="datetime-local"
          />

          <h2 className={[styles.sectionTitle, styles.span2].join(' ')}>Clasificacion e impacto</h2>
          <Select
            label="Tipo"
            name="incidentType"
            onChange={(event) => setIncidentType(event.target.value as Incident['incidentType'])}
            options={incidentTypeOptions}
            value={incidentType}
          />
          <Select
            label="Severidad"
            name="severity"
            onChange={(event) => setSeverity(event.target.value as Incident['severity'])}
            options={incidentSeverityOptions}
            value={severity}
          />
          <Input label="Costo estimado" min={0} name="estimatedCost" type="number" />
          <Input label="Ubicacion" name="location" placeholder="Ruta, taller, planta o ciudad" />
          <Input
            className={styles.span2}
            defaultValue={searchParams.get('description') || ''}
            label="Resumen operativo"
            name="description"
            placeholder="Que paso y que modulo debe enterarse"
            required
          />
          <label className={[styles.textareaField, styles.span2].join(' ')} htmlFor="notes">
            <span>Notas de seguimiento</span>
            <textarea
              id="notes"
              name="notes"
              placeholder="Evidencia, responsable, proxima accion, si requiere taller, si afecta flete o documentacion"
            />
          </label>
          <Input className={styles.span2} label="Documentos adjuntos" name="documents" placeholder="/parte.pdf, /multa.pdf" />
          <Input className={styles.span2} label="Fotos adjuntas" name="photos" placeholder="/foto1.jpg, /foto2.jpg" />

          <div className={[styles.span2, styles.formActions].join(' ')}>
            <Button disabled={isSaving} icon={<Save size={18} />} type="submit">
              {isSaving ? 'Registrando...' : 'Registrar y conectar incidente'}
            </Button>
          </div>
        </form>
      </Card>

      <aside className={styles.sideStack}>
        <Card className={styles.contextSummary}>
          <div className={styles.contextSummaryHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Contexto detectado</h2>
              <p className={styles.metaText}>La incidencia se conecta con estos modulos al guardar.</p>
            </div>
            <Badge tone={severity === 'CRITICAL' ? 'danger' : 'info'}>{severity}</Badge>
          </div>
          <div className={styles.contextList}>
            <ContextItem icon={<Truck size={16} />} label="Camion" value={selectedTruck?.plate || 'Sin camion'} />
            <ContextItem icon={<UserRound size={16} />} label="Chofer" value={selectedDriver?.name || 'Sin chofer'} />
            <ContextItem icon={<Link2 size={16} />} label="Flete" value={selectedFreight?.requestNumber || 'Sin flete'} />
            <ContextItem icon={<ClipboardList size={16} />} label="Caso abierto" value={openWorkshopCase?.caseNumber || 'No detectado'} />
          </div>
        </Card>

        <Card className={styles.contextSummary}>
          <h2 className={styles.sectionTitle}>Derivacion sugerida</h2>
          <div className={styles.suggestionList}>
            {suggestedConnections.map((item) => (
              <div className={styles.suggestionItem} key={item.title}>
                <strong>{item.title}</strong>
                <span className={styles.metaText}>{item.text}</span>
              </div>
            ))}
          </div>
        </Card>
      </aside>
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

function getSuggestedConnections(type: Incident['incidentType'], severity: Incident['severity']) {
  const base = [
    {
      text: 'Siempre queda asociado a camion para costos, disponibilidad y trazabilidad de flota.',
      title: 'Flota y costos',
    },
  ]

  if (['ACCIDENT', 'DAMAGE', 'ROAD_FAILURE'].includes(type) || severity === 'CRITICAL') {
    base.push({
      text: 'Requiere caso de taller si afecta seguridad, continuidad o disponibilidad.',
      title: 'Taller',
    })
  }

  if (['FINE', 'DELAY'].includes(type)) {
    base.push({
      text: 'Debe quedar visible en la ficha del chofer y sus multas/incumplimientos.',
      title: 'Chofer',
    })
  }

  if (['DELAY', 'CUSTOMER_ISSUE', 'CARGO_ISSUE'].includes(type)) {
    base.push({
      text: 'Debe vincularse al flete para que operaciones y comercial vean el impacto.',
      title: 'Flete',
    })
  }

  return base
}

function splitComma(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}
