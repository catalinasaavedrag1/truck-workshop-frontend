import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ClipboardSignature,
  Fuel,
  Gauge,
  MapPin,
  PackageCheck,
  RotateCcw,
  Truck,
  UserRound,
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
import { arrivalOutcomeOptions } from '../constants/tripChecklists.constants'
import type { TripArrivalChecklist } from '../types/tripChecklists.types'
import { ChecklistEvidenceUploader } from './ChecklistEvidenceUploader'
import styles from './TripChecklistModule.module.css'

const defaultTruck =
  fleetTrucksMock.find((truck) => truck.operationalStatus === 'ON_ROUTE') ??
  fleetTrucksMock.find((truck) => truck.operationalStatus === 'AVAILABLE') ??
  fleetTrucksMock[0]
const defaultDriverId = defaultTruck?.assignedDriverId ?? driversMock[0]?.id ?? ''
const defaultFreight =
  freightRequestsMock.find((request) => request.status === 'ASSIGNED') ??
  freightRequestsMock.find((request) => request.status === 'APPROVED') ??
  freightRequestsMock[0]

export function ArrivalChecklistForm() {
  const [truckId, setTruckId] = useState(defaultTruck?.id ?? '')
  const [driverId, setDriverId] = useState(defaultDriverId)
  const [freightId, setFreightId] = useState(defaultFreight?.id ?? '')
  const [cargoStatus, setCargoStatus] = useState('ok')
  const [newDamages, setNewDamages] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const hasObservation = cargoStatus !== 'ok' || newDamages
  const selectedTruck = fleetTrucksMock.find((truck) => truck.id === truckId)
  const selectedDriver = driversMock.find((driver) => driver.id === driverId)
  const selectedFreight = freightRequestsMock.find((request) => request.id === freightId)
  const selectedOutcome = arrivalOutcomeOptions.find((option) => option.value === cargoStatus)

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
      await createResource<TripArrivalChecklist, Omit<TripArrivalChecklist, 'id'>>('/trip-checklists/arrivals', {
        arrivalAt: toIsoDateTime(String(formData.get('arrivalAt') || '')) || new Date().toISOString(),
        cargoStatus,
        driverId: String(formData.get('driverId') || driverId || 'manual'),
        freightId: String(formData.get('freightId') || freightId || 'manual'),
        fuelLevelEnd: Number(formData.get('fuelLevelEnd') || 0),
        newDamages,
        observations: String(formData.get('observations') || '').trim(),
        odometerEnd: Number(formData.get('odometerEnd') || 0),
        photos: [],
        receiverName: String(formData.get('receiverName') || '').trim(),
        status: hasObservation ? 'WITH_OBSERVATIONS' : 'COMPLETED',
        truckId: String(formData.get('truckId') || truckId || ''),
      })

      if (hasObservation) {
        toast.warning('Entrada cerrada con novedad', 'Quedo marcada para seguimiento operacional.')
      } else {
        toast.success('Entrada cerrada conforme', 'El retorno quedo registrado en backend.')
      }
      form.reset()
      setTruckId(defaultTruck?.id ?? '')
      setDriverId(defaultDriverId)
      setFreightId(defaultFreight?.id ?? '')
      setCargoStatus('ok')
      setNewDamages(false)
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
          {errorMessage ? <ErrorState description={errorMessage} title="No se pudo cerrar la entrada" /> : null}
          <section className={styles.inspectionHero}>
            <div className={styles.inspectionHeroMain}>
              <span className={styles.phaseLabel}>Entrada a patio</span>
              <h2>Cerrar retorno del camion con evidencia</h2>
              <p className={styles.muted}>
                Compara kilometraje, combustible, carga y danos antes de liberar el camion o generar seguimiento.
              </p>
            </div>
            <Badge tone={hasObservation ? 'warning' : 'success'}>{hasObservation ? 'Entrada con novedad' : 'Entrada conforme'}</Badge>
          </section>
          <section className={styles.formSection}>
            <div className={styles.formSectionHeader}>
              <div className={styles.formHeaderCopy}>
                <h2>Contexto de retorno</h2>
                <p className={styles.muted}>Asocia la entrada al flete, camion y chofer para que el cierre sea trazable.</p>
              </div>
              <Badge tone="info">Post-ruta</Badge>
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
              <Input label="Kilometraje final" min={0} name="odometerEnd" placeholder="94305" type="number" />
              <Input label="Combustible restante %" max={100} min={0} name="fuelLevelEnd" placeholder="61" type="number" />
              <Input label="Fecha entrada" name="arrivalAt" type="datetime-local" />
            </div>
            <div className={styles.contextGrid}>
              <div className={styles.contextTile}>
                <span className={styles.contextIcon}>
                  <Truck aria-hidden size={16} />
                </span>
                <div>
                  <span className={styles.contextLabel}>Unidad</span>
                  <strong>{selectedTruck ? `${selectedTruck.plate} - ${selectedTruck.bodyType}` : 'Sin camion seleccionado'}</strong>
                  <small>{selectedTruck?.mainBlocker ?? 'Sin bloqueo declarado'}</small>
                </div>
              </div>
              <div className={styles.contextTile}>
                <span className={styles.contextIcon}>
                  <UserRound aria-hidden size={16} />
                </span>
                <div>
                  <span className={styles.contextLabel}>Chofer</span>
                  <strong>{selectedDriver?.name ?? 'Sin chofer seleccionado'}</strong>
                  <small>{selectedDriver ? `${selectedDriver.company} - ${selectedDriver.phone}` : 'Asigna responsable de retorno'}</small>
                </div>
              </div>
              <div className={styles.contextTileWide}>
                <span className={styles.contextIcon}>
                  <MapPin aria-hidden size={16} />
                </span>
                <div>
                  <span className={styles.contextLabel}>Ruta cerrada</span>
                  <strong>{selectedFreight ? `${selectedFreight.originAddress} -> ${selectedFreight.destinationAddress}` : 'Flete no asociado'}</strong>
                  <small>
                    {selectedFreight
                      ? `${selectedFreight.customerName} - ${selectedFreight.cargoDescription}`
                      : 'Selecciona flete para ver cliente y carga'}
                  </small>
                </div>
              </div>
            </div>
          </section>
          <section className={styles.formSection}>
            <div className={styles.formSectionHeader}>
              <div className={styles.formHeaderCopy}>
                <h2>Resultado de entrada</h2>
                <p className={styles.muted}>Clasifica recepcion y danos en un solo bloque operativo.</p>
              </div>
              <Badge tone={hasObservation ? 'warning' : 'success'}>{hasObservation ? 'Requiere seguimiento' : 'Cierre simple'}</Badge>
            </div>
            <input name="cargoStatus" type="hidden" value={cargoStatus} />
            <div className={styles.outcomeGrid}>
              {arrivalOutcomeOptions.map((option) => {
                const selected = cargoStatus === option.value

                return (
                  <button
                    aria-pressed={selected}
                    className={[styles.outcomeCard, selected ? styles.outcomeCardSelected : ''].filter(Boolean).join(' ')}
                    key={option.value}
                    onClick={() => setCargoStatus(option.value)}
                    type="button"
                  >
                    <div className={styles.outcomeHeader}>
                      <strong>{option.label}</strong>
                      {selected ? <CheckCircle2 aria-hidden size={17} /> : <PackageCheck aria-hidden size={17} />}
                    </div>
                    <span className={styles.muted}>
                      {option.value === 'ok'
                        ? 'Cierra sin novedad y libera continuidad operacional.'
                        : option.value === 'observed'
                          ? 'Registra diferencia menor o comentario de recepcion.'
                          : 'Genera alerta por dano visible o reclamo de carga.'}
                    </span>
                  </button>
                )
              })}
              <button
                aria-pressed={newDamages}
                className={[styles.outcomeCard, newDamages ? styles.outcomeCardWarning : ''].filter(Boolean).join(' ')}
                onClick={() => setNewDamages((current) => !current)}
                type="button"
              >
                <div className={styles.outcomeHeader}>
                  <strong>Danos nuevos</strong>
                  <AlertTriangle aria-hidden size={17} />
                </div>
                <span className={styles.muted}>Marca si el camion o la carga vuelven con dano visible.</span>
              </button>
            </div>
            <div className="form-grid">
              <Input label="Recibe" name="receiverName" placeholder="Nombre receptor" />
              <Input label="Observaciones" name="observations" placeholder="Detalle de novedad, dano o diferencia" />
            </div>
          </section>
          <section className={styles.formSection}>
            <div className={styles.formSectionHeader}>
              <div className={styles.formHeaderCopy}>
                <h2>Evidencia de entrada</h2>
                <p className={styles.muted}>Respalda recepcion, kilometraje, dano y firma del receptor.</p>
              </div>
              <Badge tone="info">Cierre</Badge>
            </div>
            <ChecklistEvidenceUploader slots={['Carga recibida', 'Odometro final', 'Dano si aplica', 'Firma receptor']} />
          </section>
          <div className={styles.formActions}>
            <Button loading={isSaving} type="submit" variant={hasObservation ? 'secondary' : 'primary'}>
              {hasObservation ? 'Cerrar con novedad' : 'Cerrar entrada conforme'}
            </Button>
            {hasObservation ? (
              <span className={styles.muted}>La entrada quedara marcada para seguimiento operacional.</span>
            ) : (
              <span className={styles.muted}>La unidad queda lista para continuidad si no hay bloqueo externo.</span>
            )}
          </div>
        </form>
      </Card>
      <Card className={[styles.asideCard, styles.stickyDecision].join(' ')}>
        <div className={[styles.decisionBanner, styles[hasObservation ? 'warning' : 'success']].join(' ')}>
          <span className={styles.decisionIcon}>
            {hasObservation ? <AlertTriangle aria-hidden size={20} /> : <RotateCcw aria-hidden size={20} />}
          </span>
          <div>
            <span className={styles.label}>Decision de entrada</span>
            <strong>{hasObservation ? 'Cerrar con seguimiento' : 'Cerrar y liberar unidad'}</strong>
            <p>{hasObservation ? 'Revisar dano, diferencia o recepcion antes de liberar.' : 'Recepcion conforme, con evidencia minima.'}</p>
          </div>
        </div>
        <div className={styles.decisionList}>
          <span>
            <PackageCheck aria-hidden size={15} />
            Resultado carga: {selectedOutcome?.label ?? 'Sin clasificar'}.
          </span>
          <span>
            <Camera aria-hidden size={15} />
            Adjunta fotos si hay novedad o dano visible.
          </span>
          <span>
            <ClipboardSignature aria-hidden size={15} />
            Firma receptor respalda el cierre del flete.
          </span>
          <span>
            <Gauge aria-hidden size={15} />
            Kilometraje final alimenta costo y mantenimiento.
          </span>
          <span>
            <Fuel aria-hidden size={15} />
            Combustible restante compara consumo real de ruta.
          </span>
        </div>
        <div className={styles.ruleList}>
          <div className={styles.ruleItem}>
            <span className={styles.ruleIcon}>
              <CheckCircle2 aria-hidden size={16} />
            </span>
            <div>
              <strong>Entrada conforme</strong>
              <p className={styles.muted}>Carga recibida sin diferencias ni danos.</p>
            </div>
          </div>
          <div className={styles.ruleItem}>
            <span className={styles.ruleIcon}>
              <AlertTriangle aria-hidden size={16} />
            </span>
            <div>
              <strong>Entrada con novedad</strong>
              <p className={styles.muted}>Diferencia, dano o comentario operativo.</p>
            </div>
          </div>
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
