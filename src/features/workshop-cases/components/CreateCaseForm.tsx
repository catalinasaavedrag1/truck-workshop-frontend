import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { ClipboardCheck, Save, Truck, UserRound } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { driversMock } from '../../drivers/mocks/drivers.mock'
import type { Driver } from '../../drivers/types/driver.types'
import { TruckStatusBadge } from '../../fleet/components/TruckStatusBadge'
import { operationalStatusLabels } from '../../fleet/constants/fleet.constants'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import { CASE_PRIORITY_OPTIONS } from '../constants/casePriority.constants'
import { createWorkshopCase } from '../services/workshopCases.service'
import type {
  WorkshopCaseFailureCategory,
  WorkshopCaseIntakeSource,
  WorkshopCasePriority,
} from '../types/workshopCase.types'
import styles from './CreateCaseForm.module.css'

const intakeSourceOptions: Array<{ label: string; value: WorkshopCaseIntakeSource }> = [
  { label: 'Chofer reporta', value: 'driver' },
  { label: 'Supervisor flota', value: 'fleet' },
  { label: 'Telemetria / alerta', value: 'telematics' },
  { label: 'Mantencion preventiva', value: 'preventive' },
  { label: 'Otro origen', value: 'other' },
]

const failureCategoryOptions: Array<{ label: string; value: WorkshopCaseFailureCategory }> = [
  { label: 'Motor / potencia', value: 'engine' },
  { label: 'Frenos / aire', value: 'brakes' },
  { label: 'Electrico', value: 'electrical' },
  { label: 'Transmision', value: 'transmission' },
  { label: 'Neumaticos', value: 'tires' },
  { label: 'Documentos / legal', value: 'documents' },
  { label: 'Carroceria', value: 'body' },
  { label: 'Preventiva', value: 'preventive' },
  { label: 'Otro', value: 'other' },
]

const INTERNAL_FLEET_CONTEXT = 'Flota interna'

export function CreateCaseForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedTruckId, setSelectedTruckId] = useState(searchParams.get('truckId') || '')
  const [selectedDriverId, setSelectedDriverId] = useState(searchParams.get('driverId') || '')
  const [priority, setPriority] = useState<WorkshopCasePriority>(
    (searchParams.get('priority') as WorkshopCasePriority) || 'medium',
  )
  const [safetyImpact, setSafetyImpact] = useState(searchParams.get('priority') === 'critical')
  const [immobilized, setImmobilized] = useState(searchParams.get('priority') === 'critical')
  const { data: drivers } = useResourceList<Driver>('/drivers', driversMock, { order: 'asc', sort: 'name' })
  const { data: trucks } = useResourceList<FleetTruck>('/fleet/trucks', fleetTrucksMock, { order: 'asc', sort: 'plate' })
  const selectedTruck = trucks.find((truck) => truck.id === selectedTruckId)
  const selectedDriver = drivers.find((driver) => driver.id === selectedDriverId)
  const driverOptions = drivers.map((driver) => ({
    label: `${driver.name} - ${driver.company}`,
    value: driver.id,
  }))
  const truckOptions = trucks
    .filter((truck) => truck.operationalStatus !== 'SOLD')
    .map((truck) => ({
      label: `${truck.plate} - ${truck.brand} ${truck.model} - ${operationalStatusLabels[truck.operationalStatus]}`,
      value: truck.id,
    }))
  const suggestedPriority = useMemo<WorkshopCasePriority>(() => {
    if (safetyImpact || immobilized) {
      return 'critical'
    }

    if (selectedTruck?.operationalStatus === 'BLOCKED' || selectedTruck?.operationalStatus === 'OUT_OF_SERVICE') {
      return 'high'
    }

    return priority
  }, [immobilized, priority, safetyImpact, selectedTruck?.operationalStatus])

  const handleTruckChange = (truckId: string) => {
    const truck = trucks.find((item) => item.id === truckId)

    setSelectedTruckId(truckId)

    if (truck?.assignedDriverId) {
      setSelectedDriverId(truck.assignedDriverId)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage('')

    const formData = new FormData(event.currentTarget)
    const driverId = String(formData.get('driverId') || '')
    const truckId = String(formData.get('truckId') || '')
    const driver = drivers.find((item) => item.id === driverId)
    const truck = trucks.find((item) => item.id === truckId)
    const failureCategory = String(formData.get('failureCategory') || 'other') as WorkshopCaseFailureCategory
    const title = String(formData.get('title') || 'Caso sin descripcion').trim()
    const estimatedDeliveryAt = String(formData.get('estimatedDeliveryAt') || '')
    const now = new Date().toISOString()
    const finalPriority = String(formData.get('priority') || suggestedPriority) as WorkshopCasePriority
    const dueAt = estimatedDeliveryAt
      ? new Date(`${estimatedDeliveryAt}T18:00:00`).toISOString()
      : buildSlaDueAt(finalPriority)
    const symptoms = String(formData.get('symptoms') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    if (!driver || !truck) {
      setIsSaving(false)
      setErrorMessage('Selecciona un camion y un chofer validos antes de crear el caso.')
      return
    }

    try {
      const savedCase = await createWorkshopCase({
        caseNumber: `TW-2026-${String(Date.now()).slice(-5)}`,
        currentStep: 'Crear caso de taller',
        customer: INTERNAL_FLEET_CONTEXT,
        customerId: undefined,
        customerName: INTERNAL_FLEET_CONTEXT,
        diagnosisRequested: String(formData.get('diagnosisRequested') || '').trim(),
        driverId,
        driverName: driver.name,
        downtimeImpact: String(formData.get('downtimeImpact') || '').trim(),
        escalationLevel: 'LEVEL_0_NORMAL',
        estimatedCost: 0,
        estimatedDeliveryAt: estimatedDeliveryAt ? dueAt : undefined,
        failureDescription: title,
        failureCategory,
        immobilized,
        intakeLocation: String(formData.get('intakeLocation') || '').trim(),
        intakeSource: String(formData.get('intakeSource') || 'driver') as WorkshopCaseIntakeSource,
        odometerAtEntry: Number(formData.get('odometerAtEntry') || truck.currentOdometer || 0),
        priority: finalPriority,
        purchaseRequestIds: [],
        reportedByName: String(formData.get('reportedByName') || driver.name).trim(),
        reportedByPhone: String(formData.get('reportedByPhone') || driver.phone || '').trim(),
        requiredParts: [],
        safetyImpact,
        serviceType: String(formData.get('serviceType') || 'corrective').trim(),
        slaDueAt: dueAt,
        slaId: `sla-${finalPriority}`,
        slaStatus: finalPriority === 'critical' ? 'AT_RISK' : 'OK',
        status: 'new',
        symptoms,
        title,
        truckId: truck.id,
        truckPlate: truck.plate,
        updatedAt: now,
      })

      navigate(ROUTES.caseDetail(savedCase.id))
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={styles.intakeLayout}>
      <Card>
        <form className="form-grid" onSubmit={handleSubmit}>
          {errorMessage ? (
            <div className="span-2">
              <ErrorState description={errorMessage} title="No se pudo crear el caso" />
            </div>
          ) : null}

          <h2 className={styles.sectionTitle}>
            <Truck aria-hidden size={15} />
            Unidad y responsable
          </h2>
          <Select
            className="span-2"
            label="Camion de flota"
            name="truckId"
            onChange={(event) => handleTruckChange(event.target.value)}
            options={[{ label: 'Selecciona camion', value: '' }, ...truckOptions]}
            required
            value={selectedTruckId}
          />
          <Select
            label="Chofer / reportante operacional"
            name="driverId"
            onChange={(event) => setSelectedDriverId(event.target.value)}
            options={[{ label: 'Selecciona chofer', value: '' }, ...driverOptions]}
            required
            value={selectedDriverId}
          />
          <Input
            label="Odometro ingreso"
            min={0}
            name="odometerAtEntry"
            placeholder={selectedTruck?.currentOdometer ? String(selectedTruck.currentOdometer) : '0'}
            type="number"
          />
          <Input
            defaultValue={searchParams.get('location') || ''}
            label="Ubicacion ingreso"
            name="intakeLocation"
            placeholder="Patio, ruta, base, bahia..."
          />

          <h2 className={styles.sectionTitle}>
            <ClipboardCheck aria-hidden size={15} />
            Reporte de falla
          </h2>
          <Select
            defaultValue={searchParams.get('source') === 'incident' ? 'fleet' : 'driver'}
            label="Origen reporte"
            name="intakeSource"
            options={intakeSourceOptions}
          />
          <Select
            defaultValue={searchParams.get('failureCategory') || 'other'}
            label="Categoria falla"
            name="failureCategory"
            options={failureCategoryOptions}
          />
          <Input
            className="span-2"
            defaultValue={searchParams.get('title') || ''}
            label="Problema reportado"
            name="title"
            placeholder="Ej: fuga de aire al frenar"
            required
          />
          <Input
            className="span-2"
            label="Sintomas separados por coma"
            name="symptoms"
            placeholder="ruido, perdida potencia, fuga, alerta tablero"
          />
          <label className="span-2 text-field" htmlFor="diagnosisRequested">
            <span>Contexto para diagnostico</span>
            <textarea
              defaultValue={
                searchParams.get('incidentId')
                  ? `Derivado desde incidente ${searchParams.get('incidentId')}: ${searchParams.get('description') || ''}`
                  : ''
              }
              id="diagnosisRequested"
              name="diagnosisRequested"
              placeholder="Que paso, desde cuando, condiciones de ruta, alertas, fotos disponibles, pruebas realizadas"
            />
          </label>

          <h2 className={styles.sectionTitle}>Impacto operacional y SLA</h2>
          <Select
            label="Prioridad"
            name="priority"
            onChange={(event) => setPriority(event.target.value as WorkshopCasePriority)}
            options={CASE_PRIORITY_OPTIONS.filter((item) => item.value !== 'all')}
            value={suggestedPriority}
          />
          <Input label="Entrega estimada" name="estimatedDeliveryAt" type="date" />
          <Input
            className="span-2"
            label="Impacto en operacion"
            name="downtimeImpact"
            placeholder="Flete comprometido, carga detenida, reemplazo requerido..."
          />
          <Input label="Tipo servicio" name="serviceType" placeholder="corrective, preventive, inspection" />
          <Input label="Reportado por" name="reportedByName" placeholder={selectedDriver?.name || 'Nombre'} />
          <Input label="Telefono reportante" name="reportedByPhone" placeholder={selectedDriver?.phone || '+56 9 ...'} />
          <div className={styles.checkGrid}>
            <label className="checkbox-row" htmlFor="safetyImpact">
              <input
                checked={safetyImpact}
                id="safetyImpact"
                name="safetyImpact"
                onChange={(event) => setSafetyImpact(event.target.checked)}
                type="checkbox"
              />
              <span>Impacta seguridad o cumplimiento legal</span>
            </label>
            <label className="checkbox-row" htmlFor="immobilized">
              <input
                checked={immobilized}
                id="immobilized"
                name="immobilized"
                onChange={(event) => setImmobilized(event.target.checked)}
                type="checkbox"
              />
              <span>Camion inmovilizado / no puede salir</span>
            </label>
          </div>

          <div className="span-2 inline-actions">
            <Button disabled={isSaving} icon={<Save size={18} />} type="submit">
              {isSaving ? 'Creando...' : 'Crear caso y bloquear unidad'}
            </Button>
            <Button onClick={() => navigate(ROUTES.cases)} type="button" variant="secondary">
              Cancelar
            </Button>
          </div>
        </form>
      </Card>

      <aside className={styles.summaryRail}>
        <Card>
          <div className={styles.truckContext}>
            <div className={styles.truckHero}>
              <div>
                <strong>{selectedTruck?.plate || 'Selecciona camion'}</strong>
                <p>
                  {selectedTruck
                    ? `${selectedTruck.brand} ${selectedTruck.model} / ${selectedTruck.currentOdometer.toLocaleString('es-CL')} km`
                    : 'El contexto de flota se carga al elegir unidad.'}
                </p>
              </div>
              {selectedTruck ? <TruckStatusBadge status={selectedTruck.operationalStatus} /> : <Badge>Sin unidad</Badge>}
            </div>
            <div className={styles.contextList}>
              <div className={styles.contextRow}>
                <span>Chofer asignado</span>
                <strong>{selectedTruck?.assignedDriverName || selectedDriver?.name || 'Sin definir'}</strong>
              </div>
              <div className={styles.contextRow}>
                <span>Bloqueo actual</span>
                <strong>{selectedTruck?.mainBlocker || 'Sin bloqueo registrado'}</strong>
              </div>
              <div className={styles.contextRow}>
                <span>Disponible estimado</span>
                <strong>{selectedTruck?.estimatedAvailableAt ? formatDateLabel(selectedTruck.estimatedAvailableAt) : 'Por calcular'}</strong>
              </div>
              <div className={styles.contextRow}>
                <span>SLA sugerido</span>
                <strong>{suggestedPriority === 'critical' ? 'Critico / riesgo inmediato' : 'Operacional estandar'}</strong>
              </div>
            </div>
            <div className={styles.impactPanel}>
              <strong>Que hara el sistema al crear</strong>
              <p>Creara el caso, cambiara la unidad a taller, registrara timeline de flota y la dejara en cola de agenda.</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className={styles.truckContext}>
            <div className={styles.truckHero}>
              <div>
                <strong>{INTERNAL_FLEET_CONTEXT}</strong>
                <p>El caso queda asociado al activo de flota, chofer reportante y taller interno.</p>
              </div>
              <Badge tone="info">Flota</Badge>
            </div>
            <div className={styles.contextList}>
              <div className={styles.contextRow}>
                <span>Reportante</span>
                <strong>{selectedDriver?.name || 'Sin chofer'}</strong>
              </div>
              <div className={styles.contextRow}>
                <span>Empresa chofer</span>
                <strong>{selectedDriver?.company || 'No informada'}</strong>
              </div>
              <div className={styles.contextRow}>
                <span>Contacto</span>
                <strong>{selectedDriver?.phone || 'Sin telefono'}</strong>
              </div>
            </div>
            <div className={styles.driverSignal}>
              <UserRound aria-hidden size={16} />
              <span>Si el chofer es externo, se registra como reportante o responsable operacional, no como cliente.</span>
            </div>
          </div>
        </Card>
        <Card>
          <div className={styles.quickSteps}>
            {[
              ['Ingreso', 'Queda trazado el reporte con camion, chofer y sintomas.'],
              ['Diagnostico', 'El taller recibe contexto para revisar sin volver a preguntar todo.'],
              ['Agenda', 'La flota queda bloqueada y visible para planificar recursos.'],
            ].map(([title, description], index) => (
              <div className={styles.quickStep} key={title}>
                <span className={styles.quickStepNumber}>{index + 1}</span>
                <div>
                  <strong>{title}</strong>
                  <span>{description}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </aside>
    </div>
  )
}

function buildSlaDueAt(priority: WorkshopCasePriority) {
  const targetHours: Record<WorkshopCasePriority, number> = {
    critical: 6,
    high: 24,
    low: 96,
    medium: 48,
  }
  const date = new Date()

  date.setHours(date.getHours() + targetHours[priority])

  return date.toISOString()
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(value))
}
