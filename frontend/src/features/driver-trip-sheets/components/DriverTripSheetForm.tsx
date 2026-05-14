import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Calculator, ReceiptText, Route, WalletCards, X } from 'lucide-react'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { Driver } from '../../drivers/types/driver.types'
import type { FreightAssignment, FreightQuote, FreightRequest } from '../../freight/types/freight.types'
import type { Truck } from '../../trucks/types/truck.types'
import { driverTripSheetStatusLabels } from '../constants/driverTripSheetStatus.constants'
import {
  calculateDriverTripSheet,
  createDriverTripSheet,
  getCurrentActorName,
  updateDriverTripSheet,
  type DriverTripSheetDraft,
} from '../services/driverTripSheets.service'
import type { DriverTripSheet, DriverTripSheetStatus } from '../types/driverTripSheet.types'
import styles from './DriverTripSheets.module.css'

interface DriverTripSheetFormProps {
  assignments: FreightAssignment[]
  drivers: Driver[]
  freightQuotes: FreightQuote[]
  freightRequests: FreightRequest[]
  nextSheetNumber: string
  onCancel?: () => void
  onSaved?: (sheet: DriverTripSheet) => void
  quickAssignmentKey?: string
  sheet?: DriverTripSheet | null
  trucks: Truck[]
}

const WAITING_HOUR_RATE = 15000

const statusOptions = (['DRAFT', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'PAID', 'REJECTED'] as DriverTripSheetStatus[]).map(
  (status) => ({
    label: driverTripSheetStatusLabels[status],
    value: status,
  }),
)

export function DriverTripSheetForm({
  assignments,
  drivers,
  freightQuotes,
  freightRequests,
  nextSheetNumber,
  onCancel,
  onSaved,
  quickAssignmentKey,
  sheet,
  trucks,
}: DriverTripSheetFormProps) {
  const quickAssignmentId = quickAssignmentKey?.split('::')[0]
  const [formState, setFormState] = useState<DriverTripSheetDraft>(() =>
    sheet
      ? toDraft(sheet)
      : quickAssignmentId
        ? createDraftFromAssignment(quickAssignmentId, createEmptyDraft(nextSheetNumber), {
            assignments,
            drivers,
            freightQuotes,
            freightRequests,
            trucks,
          })
        : createEmptyDraft(nextSheetNumber),
  )
  const [confirmedMessage, setConfirmedMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [waitingCostTouched, setWaitingCostTouched] = useState(Boolean(sheet?.waitingCost))
  const totals = useMemo(() => calculateDriverTripSheet(formState), [formState])
  const selectedRequest = freightRequests.find((request) => request.id === formState.requestId)
  const selectedAssignment = assignments.find((assignment) => assignment.id === formState.assignmentId)
  const selectedQuote = freightQuotes.find((quote) => quote.id === formState.quoteId || quote.requestId === formState.requestId)
  const marginPercentage = formState.revenue > 0 ? Math.round((totals.netMargin / formState.revenue) * 100) : 0
  const kmDeviation =
    formState.kmPlanned > 0 && formState.kmReal > 0
      ? Math.round(((formState.kmReal - formState.kmPlanned) / formState.kmPlanned) * 100)
      : 0
  const operationalWarnings = buildOperationalWarnings({
    kmDeviation,
    marginPercentage,
    sheet: formState,
    totals,
  })

  const assignmentOptions = [
    { label: 'Seleccionar asignacion o usar solicitud', value: '' },
    ...assignments.map((assignment) => {
      const request = freightRequests.find((item) => item.id === assignment.requestId)
      const driver = drivers.find((item) => item.id === assignment.driverId)
      const truck = trucks.find((item) => item.id === assignment.truckId)

      return {
        label: `${request?.requestNumber || assignment.requestId} - ${truck?.plate || assignment.truckId} - ${driver?.name || assignment.driverId}`,
        value: assignment.id,
      }
    }),
  ]
  const requestOptions = [
    { label: 'Seleccionar solicitud', value: '' },
    ...freightRequests.map((request) => ({
      label: `${request.requestNumber} - ${request.customerName}`,
      value: request.id,
    })),
  ]
  const driverOptions = [
    { label: 'Seleccionar chofer', value: '' },
    ...drivers.map((driver) => ({ label: `${driver.name} - ${driver.company}`, value: driver.id })),
  ]
  const truckOptions = [
    { label: 'Seleccionar camion', value: '' },
    ...trucks.map((truck) => ({ label: `${truck.plate} - ${truck.brand} ${truck.model}`, value: truck.id })),
  ]

  const handleAssignmentChange = (assignmentId: string) => {
    const assignment = assignments.find((item) => item.id === assignmentId)

    if (!assignment) {
      setFormState((current) => ({ ...current, assignmentId: '' }))
      return
    }

    const request = freightRequests.find((item) => item.id === assignment.requestId)
    const quote = freightQuotes.find((item) => item.id === assignment.quoteId || item.requestId === assignment.requestId)
    const driver = drivers.find((item) => item.id === assignment.driverId)
    const truck = trucks.find((item) => item.id === assignment.truckId)

    setFormState((current) => ({
      ...current,
      assignmentId: assignment.id,
      customerId: request?.customerId,
      customerName: request?.customerName || current.customerName,
      deliveredAt: formatDateTimeLocal(assignment.deliveryDate) || current.deliveredAt,
      destinationAddress: request?.destinationAddress || current.destinationAddress,
      driverId: assignment.driverId,
      driverName: driver?.name || current.driverName,
      freightId: request?.id || assignment.requestId,
      fuelCost: current.fuelCost || quote?.fuelCost || 0,
      kmPlanned: request?.estimatedKm || current.kmPlanned,
      kmReal: current.kmReal || request?.estimatedKm || 0,
      originAddress: request?.originAddress || current.originAddress,
      quoteId: assignment.quoteId || request?.quoteId,
      requestId: assignment.requestId,
      revenue: current.revenue || quote?.total || 0,
      tollCost: current.tollCost || quote?.tollCost || 0,
      tripDate: formatDateTimeLocal(assignment.pickupDate) || current.tripDate,
      truckId: assignment.truckId,
      truckPlate: truck?.plate || current.truckPlate,
      waitingCost: current.waitingCost || quote?.waitingCost || (request?.waitingHours ? request.waitingHours * WAITING_HOUR_RATE : 0),
      waitingHours: current.waitingHours || request?.waitingHours || 0,
    }))
  }

  const handleRequestChange = (requestId: string) => {
    const request = freightRequests.find((item) => item.id === requestId)

    if (!request) {
      setField('requestId', '')
      return
    }

    const quote = freightQuotes.find((item) => item.id === request.quoteId || item.requestId === request.id)

    setFormState((current) => ({
      ...current,
      customerId: request.customerId,
      customerName: request.customerName,
      destinationAddress: request.destinationAddress,
      freightId: request.id,
      kmPlanned: request.estimatedKm,
      kmReal: current.kmReal || request.estimatedKm,
      originAddress: request.originAddress,
      quoteId: request.quoteId || quote?.id,
      requestId: request.id,
      revenue: current.revenue || quote?.total || 0,
      tripDate: formatDateTimeLocal(request.requestedPickupDate) || current.tripDate,
      waitingCost: current.waitingCost || quote?.waitingCost || (request.waitingHours ? request.waitingHours * WAITING_HOUR_RATE : 0),
      waitingHours: current.waitingHours || request.waitingHours || 0,
    }))
  }

  const handleDriverChange = (driverId: string) => {
    const driver = drivers.find((item) => item.id === driverId)

    setFormState((current) => ({
      ...current,
      driverId,
      driverName: driver?.name || '',
    }))
  }

  const handleTruckChange = (truckId: string) => {
    const truck = trucks.find((item) => item.id === truckId)

    setFormState((current) => ({
      ...current,
      truckId,
      truckPlate: truck?.plate || '',
    }))
  }

  const setField = <TField extends keyof DriverTripSheetDraft>(field: TField, value: DriverTripSheetDraft[TField]) => {
    setFormState((current) => ({ ...current, [field]: value }))
  }

  const setNumberField = (field: keyof DriverTripSheetDraft, value: string) => {
    setFormState((current) => ({ ...current, [field]: Number(value || 0) }))
  }

  const handleWaitingHoursChange = (value: string) => {
    const waitingHours = Number(value || 0)

    setFormState((current) => ({
      ...current,
      waitingCost: waitingCostTouched ? current.waitingCost : Math.round(waitingHours * WAITING_HOUR_RATE),
      waitingHours,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setConfirmedMessage('')
    setIsSaving(true)

    try {
      const payload = {
        ...formState,
        createdBy: formState.createdBy || getCurrentActorName(),
        deliveredAt: toIsoString(formState.deliveredAt),
        tripDate: toIsoString(formState.tripDate) || formState.tripDate,
        updatedBy: getCurrentActorName(),
      }
      const saved = sheet?.id
        ? await updateDriverTripSheet(sheet.id, payload)
        : await createDriverTripSheet(payload)

      onSaved?.(saved)
      setConfirmedMessage(sheet?.id ? 'Planilla actualizada en la base de datos.' : 'Planilla creada en la base de datos.')

      if (!sheet?.id) {
        setFormState(createEmptyDraft(nextSheetNumber))
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className={styles.formCard}>
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <div>
            <h2>{sheet ? 'Editar planilla' : 'Nueva planilla'}</h2>
            <p>Rinde gastos del viaje y calcula rendimiento operacional del chofer.</p>
          </div>
          {sheet && onCancel ? (
            <Button aria-label="Cancelar edicion" icon={<X size={16} />} onClick={onCancel} size="sm" type="button" variant="ghost" />
          ) : null}
        </div>
        {errorMessage ? (
          <div className="span-2">
            <ErrorState description={errorMessage} title="No se pudo guardar la planilla" />
          </div>
        ) : null}
        <h3 className={styles.sectionTitle}>Viaje</h3>
        <Input label="Nro. planilla" name="sheetNumber" onChange={(event) => setField('sheetNumber', event.target.value)} required value={formState.sheetNumber} />
        <Select label="Estado" name="status" onChange={(event) => setField('status', event.target.value as DriverTripSheetStatus)} options={statusOptions} value={formState.status} />
        <Select label="Asignacion" name="assignmentId" onChange={(event) => handleAssignmentChange(event.target.value)} options={assignmentOptions} value={formState.assignmentId || ''} />
        <Select label="Solicitud" name="requestId" onChange={(event) => handleRequestChange(event.target.value)} options={requestOptions} value={formState.requestId || ''} />
        <Select label="Chofer" name="driverId" onChange={(event) => handleDriverChange(event.target.value)} options={driverOptions} required value={formState.driverId} />
        <Select label="Camion" name="truckId" onChange={(event) => handleTruckChange(event.target.value)} options={truckOptions} required value={formState.truckId} />
        {selectedRequest || selectedAssignment ? (
          <div className={styles.selectedTrip}>
            <div className="split-row">
              <strong>{selectedRequest?.customerName || formState.customerName || 'Viaje seleccionado'}</strong>
              <Badge tone={selectedQuote ? 'success' : 'warning'}>{selectedQuote ? 'Con cotizacion' : 'Sin cotizacion'}</Badge>
            </div>
            <span className="muted-text">
              {formState.originAddress || 'Origen pendiente'} a {formState.destinationAddress || 'destino pendiente'}
            </span>
            <div className={styles.contextGrid}>
              <span>
                <Route aria-hidden size={15} />
                {formState.kmPlanned || 0} km planificados
              </span>
              <span>
                <WalletCards aria-hidden size={15} />
                {formatCurrency(formState.revenue || 0)} ingreso
              </span>
              <span>Flete {selectedRequest?.requestNumber || formState.requestId || 'pendiente'}</span>
            </div>
          </div>
        ) : null}
        <Input label="Salida" name="tripDate" onChange={(event) => setField('tripDate', event.target.value)} required type="datetime-local" value={formState.tripDate} />
        <Input label="Entrega real" name="deliveredAt" onChange={(event) => setField('deliveredAt', event.target.value)} type="datetime-local" value={formState.deliveredAt || ''} />
        <Input label="Km planificados" min="0" name="kmPlanned" onChange={(event) => setNumberField('kmPlanned', event.target.value)} type="number" value={formState.kmPlanned} />
        <Input label="Km reales" min="0" name="kmReal" onChange={(event) => setNumberField('kmReal', event.target.value)} required type="number" value={formState.kmReal} />
        <h3 className={styles.sectionTitle}>Ingresos y gastos</h3>
        <Input label="Ingreso flete" min="0" name="revenue" onChange={(event) => setNumberField('revenue', event.target.value)} required type="number" value={formState.revenue} />
        <Input label="Combustible" min="0" name="fuelCost" onChange={(event) => setNumberField('fuelCost', event.target.value)} type="number" value={formState.fuelCost} />
        <Input label="Peajes" min="0" name="tollCost" onChange={(event) => setNumberField('tollCost', event.target.value)} type="number" value={formState.tollCost} />
        <Input label="Comida" min="0" name="mealCost" onChange={(event) => setNumberField('mealCost', event.target.value)} type="number" value={formState.mealCost} />
        <Input label="Propina" min="0" name="tipCost" onChange={(event) => setNumberField('tipCost', event.target.value)} type="number" value={formState.tipCost} />
        <Input label="Estacionamiento" min="0" name="parkingCost" onChange={(event) => setNumberField('parkingCost', event.target.value)} type="number" value={formState.parkingCost} />
        <Input label="Alojamiento" min="0" name="lodgingCost" onChange={(event) => setNumberField('lodgingCost', event.target.value)} type="number" value={formState.lodgingCost} />
        <Input label="Otros gastos" min="0" name="otherCost" onChange={(event) => setNumberField('otherCost', event.target.value)} type="number" value={formState.otherCost} />
        <Input label="Horas espera" min="0" name="waitingHours" onChange={(event) => handleWaitingHoursChange(event.target.value)} step="0.5" type="number" value={formState.waitingHours} />
        <Input
          helperText={waitingCostTouched ? 'Editado manualmente' : `${formatCurrency(WAITING_HOUR_RATE)} por hora`}
          label="Costo espera"
          min="0"
          name="waitingCost"
          onChange={(event) => {
            setWaitingCostTouched(true)
            setNumberField('waitingCost', event.target.value)
          }}
          type="number"
          value={formState.waitingCost}
        />
        <div className={styles.totalsPanel}>
          <div>
            <span>Gastos</span>
            <strong>{formatCurrency(totals.totalExpenses)}</strong>
          </div>
          <div>
            <span>Margen</span>
            <strong>{formatCurrency(totals.netMargin)}</strong>
          </div>
          <div>
            <span>Score</span>
            <strong>{totals.performanceScore}/100</strong>
          </div>
        </div>
        <div className={styles.readoutPanel}>
          <div>
            <span>Ingreso/km</span>
            <strong>{formatCurrency(totals.revenuePerKm)}</strong>
          </div>
          <div>
            <span>Costo/km</span>
            <strong>{formatCurrency(totals.costPerKm)}</strong>
          </div>
          <div>
            <span>Desvio ruta</span>
            <strong>{kmDeviation > 0 ? `+${kmDeviation}%` : `${kmDeviation}%`}</strong>
          </div>
          <div>
            <span>Margen</span>
            <strong>{marginPercentage}%</strong>
          </div>
        </div>
        {operationalWarnings.length > 0 ? (
          <div className={styles.warningPanel}>
            <strong>Revisar antes de enviar</strong>
            {operationalWarnings.map((warning) => (
              <span key={warning}>{warning}</span>
            ))}
          </div>
        ) : (
          <div className={styles.okPanel}>
            <strong>Planilla coherente</strong>
            <span>Ingreso, km, espera y gastos permiten revisar el viaje sin pasos extra.</span>
          </div>
        )}
        <label className="span-2 text-field" htmlFor="tripSheetNotes">
          <span>Notas operacionales</span>
          <textarea
            id="tripSheetNotes"
            name="notes"
            onChange={(event) => setField('notes', event.target.value)}
            placeholder="Comprobantes faltantes, demoras, observaciones del chofer o diferencias de ruta"
            value={formState.notes || ''}
          />
        </label>
        <div className={styles.actionRow}>
          <Button disabled={isSaving} icon={<ReceiptText size={18} />} type="submit">
            {isSaving ? 'Guardando...' : sheet ? 'Actualizar planilla' : 'Crear planilla'}
          </Button>
          <Button icon={<Calculator size={18} />} onClick={() => setConfirmedMessage('Totales recalculados con los valores actuales.')} type="button" variant="secondary">
            Recalcular
          </Button>
          {confirmedMessage ? <p className="muted-text" role="status">{confirmedMessage}</p> : null}
        </div>
      </form>
    </Card>
  )
}

function createEmptyDraft(sheetNumber: string): DriverTripSheetDraft {
  return {
    createdBy: getCurrentActorName(),
    driverId: '',
    driverName: '',
    fuelCost: 0,
    kmPlanned: 0,
    kmReal: 0,
    lodgingCost: 0,
    mealCost: 0,
    otherCost: 0,
    parkingCost: 0,
    revenue: 0,
    sheetNumber,
    status: 'DRAFT',
    tipCost: 0,
    tollCost: 0,
    tripDate: '',
    truckId: '',
    truckPlate: '',
    updatedBy: getCurrentActorName(),
    waitingCost: 0,
    waitingHours: 0,
  }
}

function createDraftFromAssignment(
  assignmentId: string,
  baseDraft: DriverTripSheetDraft,
  context: {
    assignments: FreightAssignment[]
    drivers: Driver[]
    freightQuotes: FreightQuote[]
    freightRequests: FreightRequest[]
    trucks: Truck[]
  },
) {
  const assignment = context.assignments.find((item) => item.id === assignmentId)

  if (!assignment) {
    return baseDraft
  }

  const request = context.freightRequests.find((item) => item.id === assignment.requestId)
  const quote = context.freightQuotes.find((item) => item.id === assignment.quoteId || item.requestId === assignment.requestId)
  const driver = context.drivers.find((item) => item.id === assignment.driverId)
  const truck = context.trucks.find((item) => item.id === assignment.truckId)
  const waitingHours = request?.waitingHours || 0

  return {
    ...baseDraft,
    assignmentId: assignment.id,
    customerId: request?.customerId,
    customerName: request?.customerName || baseDraft.customerName,
    deliveredAt: formatDateTimeLocal(assignment.deliveryDate) || baseDraft.deliveredAt,
    destinationAddress: request?.destinationAddress || baseDraft.destinationAddress,
    driverId: assignment.driverId,
    driverName: driver?.name || baseDraft.driverName,
    freightId: request?.id || assignment.requestId,
    fuelCost: quote?.fuelCost || baseDraft.fuelCost,
    kmPlanned: request?.estimatedKm || baseDraft.kmPlanned,
    kmReal: request?.estimatedKm || baseDraft.kmReal,
    originAddress: request?.originAddress || baseDraft.originAddress,
    quoteId: assignment.quoteId || request?.quoteId,
    requestId: assignment.requestId,
    revenue: quote?.total || baseDraft.revenue,
    tollCost: quote?.tollCost || baseDraft.tollCost,
    tripDate: formatDateTimeLocal(assignment.pickupDate) || baseDraft.tripDate,
    truckId: assignment.truckId,
    truckPlate: truck?.plate || baseDraft.truckPlate,
    waitingCost: quote?.waitingCost || waitingHours * WAITING_HOUR_RATE || baseDraft.waitingCost,
    waitingHours,
  }
}

function toDraft(sheet: DriverTripSheet): DriverTripSheetDraft {
  return {
    ...sheet,
    deliveredAt: formatDateTimeLocal(sheet.deliveredAt),
    tripDate: formatDateTimeLocal(sheet.tripDate),
  }
}

function formatDateTimeLocal(value?: string) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 16)
}

function toIsoString(value?: string) {
  if (!value) {
    return undefined
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? value : date.toISOString()
}

function buildOperationalWarnings({
  kmDeviation,
  marginPercentage,
  sheet,
  totals,
}: {
  kmDeviation: number
  marginPercentage: number
  sheet: DriverTripSheetDraft
  totals: ReturnType<typeof calculateDriverTripSheet>
}) {
  const warnings: string[] = []

  if (!sheet.assignmentId && !sheet.requestId) {
    warnings.push('Vincula una asignacion o solicitud para dejar trazabilidad del viaje.')
  }

  if (sheet.kmReal <= 0) {
    warnings.push('Registra kilometros reales antes de enviar a revision.')
  }

  if (sheet.revenue <= 0) {
    warnings.push('Falta ingreso del flete para calcular margen.')
  }

  if (totals.totalExpenses <= 0) {
    warnings.push('Sin gastos rendidos: valida si realmente no hubo peajes, combustible o viaticos.')
  }

  if (marginPercentage > 0 && marginPercentage < 18) {
    warnings.push('Margen bajo para el viaje; revisar combustible, peajes y espera.')
  }

  if (sheet.waitingHours > 2) {
    warnings.push('Horas de espera altas; puede afectar rendimiento del chofer.')
  }

  if (kmDeviation > 6) {
    warnings.push('Km reales sobre lo planificado; revisar desvio de ruta.')
  }

  if (['SUBMITTED', 'REVIEWED', 'APPROVED', 'PAID'].includes(sheet.status) && !sheet.deliveredAt) {
    warnings.push('Agrega fecha de entrega real antes de cerrar administrativamente.')
  }

  return warnings
}
