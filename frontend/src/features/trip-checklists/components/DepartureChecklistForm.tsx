import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  Fuel,
  Gauge,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
  UserRound,
  XCircle,
} from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { createResource } from '../../../shared/services/resourceApi'
import { toast } from '../../../shared/services/toastStore'
import { driversMock } from '../../drivers/mocks/drivers.mock'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import { freightRequestsMock } from '../../freight/mocks/freight.mock'
import { departureChecklistItems } from '../constants/tripChecklists.constants'
import type { DepartureChecklistItemKey } from '../constants/tripChecklists.constants'
import type { TripDepartureChecklist } from '../types/tripChecklists.types'
import { ChecklistEvidenceUploader } from './ChecklistEvidenceUploader'
import styles from './TripChecklistModule.module.css'

const initialChecks = departureChecklistItems.reduce(
  (accumulator, item) => ({ ...accumulator, [item.key]: true }),
  {} as Record<DepartureChecklistItemKey, boolean>,
)

const defaultTruck = fleetTrucksMock.find((truck) => truck.operationalStatus === 'AVAILABLE') ?? fleetTrucksMock[0]
const defaultDriverId = defaultTruck?.assignedDriverId ?? driversMock[0]?.id ?? ''
const defaultFreight =
  freightRequestsMock.find((request) => request.status === 'ASSIGNED') ??
  freightRequestsMock.find((request) => request.status === 'APPROVED') ??
  freightRequestsMock[0]

export function DepartureChecklistForm() {
  const [checks, setChecks] = useState(initialChecks)
  const [truckId, setTruckId] = useState(defaultTruck?.id ?? '')
  const [driverId, setDriverId] = useState(defaultDriverId)
  const [freightId, setFreightId] = useState(defaultFreight?.id ?? '')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const blockingItems = departureChecklistItems.filter((item) => item.critical && !checks[item.key])
  const observedItems = departureChecklistItems.filter((item) => !item.critical && !checks[item.key])
  const failedItems = departureChecklistItems.filter((item) => !checks[item.key])
  const blocked = blockingItems.length > 0
  const passedCount = departureChecklistItems.length - failedItems.length
  const selectedTruck = fleetTrucksMock.find((truck) => truck.id === truckId)
  const selectedDriver = driversMock.find((driver) => driver.id === driverId)
  const selectedFreight = freightRequestsMock.find((request) => request.id === freightId)
  const statusTone = blocked ? 'danger' : observedItems.length > 0 ? 'warning' : 'success'
  const statusLabel = blocked ? 'Salida bloqueada' : observedItems.length > 0 ? 'Salida con observacion' : 'Camion apto para salir'

  const handleTruckChange = (nextTruckId: string) => {
    const nextTruck = fleetTrucksMock.find((truck) => truck.id === nextTruckId)
    setTruckId(nextTruckId)

    if (nextTruck?.assignedDriverId) {
      setDriverId(nextTruck.assignedDriverId)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    setErrorMessage('')
    setIsSaving(true)

    try {
      await createResource<TripDepartureChecklist, Omit<TripDepartureChecklist, 'id'>>('/trip-checklists/departures', {
        brakesOk: checks.brakesOk,
        cargoSecured: checks.cargoSecured,
        departureAt: toIsoDateTime(String(formData.get('departureAt') || '')) || new Date().toISOString(),
        documentsOk: checks.documentsOk,
        driverId: String(formData.get('driverId') || driverId || 'manual'),
        freightId: String(formData.get('freightId') || freightId || 'manual'),
        fuelLevelStart: Number(formData.get('fuelLevelStart') || 0),
        lightsOk: checks.lightsOk,
        odometerStart: Number(formData.get('odometerStart') || 0),
        observations: String(formData.get('observations') || '').trim(),
        oilOk: checks.oilOk,
        photos: [],
        status: blocked ? 'BLOCKED' : observedItems.length > 0 ? 'WITH_OBSERVATIONS' : 'COMPLETED',
        tiresOk: checks.tiresOk,
        truckId: String(formData.get('truckId') || truckId || ''),
        waterOk: checks.waterOk,
      })

      if (blocked) {
        toast.warning('Salida bloqueada', 'Se registro la inspeccion con bloqueo critico pendiente.')
      } else {
        toast.success('Salida registrada', 'La inspeccion de salida quedo guardada en backend.')
      }
      form.reset()
      setChecks(initialChecks)
      setTruckId(defaultTruck?.id ?? '')
      setDriverId(defaultDriverId)
      setFreightId(defaultFreight?.id ?? '')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={styles.formShell}>
      <Card className={styles.formCard}>
        <form className={styles.formStack} onSubmit={handleSubmit}>
          {errorMessage ? <ErrorState description={errorMessage} title="No se pudo guardar la salida" /> : null}
          <section className={styles.inspectionHero}>
            <div className={styles.inspectionHeroMain}>
              <span className={styles.phaseLabel}>Salida de patio</span>
              <h2>Validar camion antes de despachar</h2>
              <p className={styles.muted}>
                Selecciona flete, camion y chofer. La decision queda visible mientras marcas los puntos criticos.
              </p>
            </div>
            <Badge tone={statusTone}>{statusLabel}</Badge>
          </section>
          <section className={styles.formSection}>
            <div className={styles.formSectionHeader}>
              <div className={styles.formHeaderCopy}>
                <h2>Contexto operacional</h2>
                <p className={styles.muted}>El checklist parte desde datos conectados: flete, unidad y responsable.</p>
              </div>
              <Badge tone="info">Pre-ruta</Badge>
            </div>
            <div className="form-grid">
              <Select
                label="Flete"
                name="freightId"
                onChange={(event) => setFreightId(event.target.value)}
                options={freightRequestsMock.map((request) => ({
                  label: `${request.requestNumber} - ${request.customerName}`,
                  value: request.id,
                }))}
                value={freightId}
              />
              <Select
                label="Camion"
                name="truckId"
                onChange={(event) => handleTruckChange(event.target.value)}
                options={fleetTrucksMock.map((truck) => ({
                  label: `${truck.plate} - ${truck.brand} ${truck.model}`,
                  value: truck.id,
                }))}
                value={truckId}
              />
              <Select
                label="Chofer"
                name="driverId"
                onChange={(event) => setDriverId(event.target.value)}
                options={driversMock.map((driver) => ({ label: `${driver.name} - ${driver.license}`, value: driver.id }))}
                value={driverId}
              />
              <Input label="Kilometraje inicial" min={0} name="odometerStart" placeholder="94120" type="number" />
              <Input label="Combustible %" max={100} min={0} name="fuelLevelStart" placeholder="92" type="number" />
              <Input label="Fecha salida" name="departureAt" type="datetime-local" />
            </div>
            <div className={styles.contextGrid}>
              <div className={styles.contextTile}>
                <span className={styles.contextIcon}>
                  <Truck aria-hidden size={16} />
                </span>
                <div>
                  <span className={styles.contextLabel}>Unidad</span>
                  <strong>{selectedTruck ? `${selectedTruck.plate} - ${selectedTruck.bodyType}` : 'Sin camion seleccionado'}</strong>
                  <small>{selectedTruck ? `${selectedTruck.currentOdometer.toLocaleString('es-CL')} km actuales` : 'Selecciona una unidad'}</small>
                </div>
              </div>
              <div className={styles.contextTile}>
                <span className={styles.contextIcon}>
                  <UserRound aria-hidden size={16} />
                </span>
                <div>
                  <span className={styles.contextLabel}>Chofer</span>
                  <strong>{selectedDriver?.name ?? 'Sin chofer seleccionado'}</strong>
                  <small>{selectedDriver ? `${selectedDriver.license} - ${selectedDriver.phone}` : 'Asigna responsable de ruta'}</small>
                </div>
              </div>
              <div className={styles.contextTileWide}>
                <span className={styles.contextIcon}>
                  <MapPin aria-hidden size={16} />
                </span>
                <div>
                  <span className={styles.contextLabel}>Ruta y carga</span>
                  <strong>{selectedFreight ? `${selectedFreight.originAddress} -> ${selectedFreight.destinationAddress}` : 'Flete no asociado'}</strong>
                  <small>
                    {selectedFreight
                      ? `${selectedFreight.cargoDescription} - ${selectedFreight.estimatedKm} km`
                      : 'Selecciona flete para ver ruta'}
                  </small>
                </div>
              </div>
            </div>
          </section>
          <section className={styles.formSection}>
            <div className={styles.formSectionHeader}>
              <div className={styles.formHeaderCopy}>
                <h2>Inspeccion de salida</h2>
                <p className={styles.muted}>Marca cada punto como operativo. Frenos y documentos bloquean despacho.</p>
              </div>
              <Badge tone={statusTone}>{passedCount}/{departureChecklistItems.length} OK</Badge>
            </div>
            <div className={styles.controlGrid}>
              {departureChecklistItems.map((item) => {
                const checked = checks[item.key]
                const controlClassName = [
                  styles.controlCard,
                  checked ? styles.controlCardChecked : item.critical ? styles.controlCardBlocked : styles.controlCardObserved,
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <button
                    aria-pressed={checked}
                    className={controlClassName}
                    key={item.key}
                    onClick={() => {
                      setChecks((current) => ({ ...current, [item.key]: !current[item.key] }))
                    }}
                    type="button"
                  >
                    <div className={styles.controlHeader}>
                      <div className={styles.controlCopy}>
                        <span className={styles.controlTitleLine}>
                          <span className={[styles.statusDot, checked ? styles.statusDotOk : styles.statusDotFail].join(' ')} />
                          <strong>{item.label}</strong>
                        </span>
                        <span className={styles.muted}>{item.helper}</span>
                      </div>
                      {checked ? <CheckCircle2 aria-hidden size={19} /> : <XCircle aria-hidden size={19} />}
                    </div>
                    <div className={styles.controlFooter}>
                      <Badge tone={item.critical ? 'danger' : 'neutral'}>{item.critical ? 'Critico' : item.category}</Badge>
                      <Badge tone={checked ? 'success' : item.critical ? 'danger' : 'warning'}>
                        {checked ? 'OK' : item.critical ? 'Bloquea' : 'Observa'}
                      </Badge>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
          <section className={styles.formSection}>
            <div className={styles.formSectionHeader}>
              <div className={styles.formHeaderCopy}>
                <h2>Evidencia requerida</h2>
                <p className={styles.muted}>Fotos minimas para respaldar salida: unidad, seguridad, carga y documentos.</p>
              </div>
              <Badge tone="info">Patio</Badge>
            </div>
            <ChecklistEvidenceUploader slots={['Frontal unidad', 'Neumaticos', 'Carga / sellos', 'Documentos']} />
          </section>
          <label className="text-field" htmlFor="departureObservations">
            <span>Observaciones de salida</span>
            <textarea id="departureObservations" name="observations" placeholder="Detalle de falla, bloqueo, responsable o autorizacion excepcional" />
          </label>
          <div className={styles.formActions}>
            <Button loading={isSaving} type="submit" variant={blocked ? 'danger' : 'primary'}>
              {blocked ? 'Guardar salida bloqueada' : 'Autorizar salida'}
            </Button>
            {blocked ? (
              <span className={styles.muted}>Corregir antes de despachar: {blockingItems.map((item) => item.label).join(', ')}.</span>
            ) : observedItems.length > 0 ? (
              <span className={styles.muted}>Sale con seguimiento: {observedItems.map((item) => item.label).join(', ')}.</span>
            ) : (
              <span className={styles.muted}>Todo listo para salida con evidencia minima.</span>
            )}
          </div>
        </form>
      </Card>
      <Card className={[styles.asideCard, styles.stickyDecision].join(' ')}>
        <div className={[styles.decisionBanner, styles[statusTone]].join(' ')}>
          <span className={styles.decisionIcon}>
            {blocked ? <AlertTriangle aria-hidden size={20} /> : observedItems.length > 0 ? <FileWarning aria-hidden size={20} /> : <ShieldCheck aria-hidden size={20} />}
          </span>
          <div>
            <span className={styles.label}>Decision operacional</span>
            <strong>{statusLabel}</strong>
            <p>{blocked ? 'No despachar hasta corregir punto critico.' : 'Puede continuar si la evidencia queda registrada.'}</p>
          </div>
        </div>
        <div className={styles.decisionMeter}>
          <div>
            <strong>{passedCount} controles aprobados</strong>
            <span>{failedItems.length} pendientes o no conformes</span>
          </div>
          <div className={styles.progressTrack}>
            <span style={{ width: `${(passedCount / departureChecklistItems.length) * 100}%` }} />
          </div>
        </div>
        <div className={styles.ruleList}>
          <div className={styles.ruleItem}>
            <span className={styles.ruleIcon}>
              <ShieldCheck aria-hidden size={16} />
            </span>
            <div>
              <strong>Salida habilitada</strong>
              <p className={styles.muted}>Todos los controles quedan OK.</p>
            </div>
          </div>
          <div className={styles.ruleItem}>
            <span className={styles.ruleIcon}>
              <FileWarning aria-hidden size={16} />
            </span>
            <div>
              <strong>Salida con observacion</strong>
              <p className={styles.muted}>Falla no critica viaja con seguimiento.</p>
            </div>
          </div>
          <div className={styles.ruleItem}>
            <span className={styles.ruleIcon}>
              <AlertTriangle aria-hidden size={16} />
            </span>
            <div>
              <strong>Salida bloqueada</strong>
              <p className={styles.muted}>Frenos o documentos no aptos impiden despacho.</p>
            </div>
          </div>
        </div>
        <div className={styles.decisionList}>
          <span>
            <Gauge aria-hidden size={15} />
            Km inicial y combustible visibles para control de ruta.
          </span>
          <span>
            <Fuel aria-hidden size={15} />
            Registra combustible antes de salir para comparar al retorno.
          </span>
          <span>
            <PackageCheck aria-hidden size={15} />
            Carga asegurada queda como evidencia operacional.
          </span>
        </div>
        <div className={styles.linkGrid}>
          {selectedTruck ? (
            <Link to={ROUTES.fleetTruckDetail(selectedTruck.id)}>
              <Button fullWidth size="sm" variant="secondary">
                Ver camion
              </Button>
            </Link>
          ) : null}
          {selectedDriver ? (
            <Link to={ROUTES.driverDetail(selectedDriver.id)}>
              <Button fullWidth size="sm" variant="secondary">
                Ver chofer
              </Button>
            </Link>
          ) : null}
        </div>
      </Card>
    </div>
  )
}

function toIsoDateTime(value: string) {
  if (!value) {
    return undefined
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}
