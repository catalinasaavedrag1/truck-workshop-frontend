import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { CalendarCheck } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { formatDate } from '../../../shared/utils/formatDate'
import type { Driver } from '../../drivers/types/driver.types'
import type { Truck } from '../../trucks/types/truck.types'
import { CARGO_TYPE_LABELS } from '../constants/cargoType.constants'
import { createFreightAssignment, getCurrentActorName } from '../services/freightAssignments.service'
import type { FreightAssignment, FreightRequest } from '../types/freight.types'
import { FreightRequestStatusBadge } from './FreightRequestStatusBadge'
import styles from './FreightModule.module.css'

interface FreightAssignmentFormProps {
  drivers: Driver[]
  freightRequests: FreightRequest[]
  onSaved?: (assignment: FreightAssignment) => void
  trucks: Truck[]
}

export function FreightAssignmentForm({ drivers, freightRequests, onSaved, trucks }: FreightAssignmentFormProps) {
  const [assignedRequestIds, setAssignedRequestIds] = useState<string[]>([])
  const approvedRequests = useMemo(
    () => freightRequests.filter((request) => request.status === 'APPROVED' && request.quoteId && !assignedRequestIds.includes(request.id)),
    [assignedRequestIds, freightRequests],
  )
  const [selectedRequestId, setSelectedRequestId] = useState(approvedRequests[0]?.id || '')
  const [confirmedMessage, setConfirmedMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const selectedRequest = approvedRequests.find((request) => request.id === selectedRequestId) || approvedRequests[0]
  const availableTrucks = trucks.filter((truck) => truck.status === 'available')
  const activeDrivers = drivers.filter((driver) => driver.status === 'active')
  const requestOptions = approvedRequests.length
    ? approvedRequests.map((request) => ({
        label: `${request.requestNumber} - ${request.customerName}`,
        value: request.id,
      }))
    : [{ label: 'Sin solicitudes aprobadas pendientes', value: '' }]
  const truckOptions = availableTrucks.length
    ? availableTrucks.map((truck) => ({
        label: `${truck.plate} - ${truck.brand} ${truck.model}`,
        value: truck.id,
      }))
    : [{ label: 'Sin camiones disponibles', value: '' }]
  const driverOptions = activeDrivers.length
    ? activeDrivers.map((driver) => ({
        label: `${driver.name} - ${driver.company}`,
        value: driver.id,
      }))
    : [{ label: 'Sin choferes activos', value: '' }]
  const unavailableTrucks = trucks.filter((truck) => truck.status !== 'available')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const requestId = String(formData.get('requestId') || '').trim()
    const request = freightRequests.find((item) => item.id === requestId)

    setIsSaving(true)
    setErrorMessage('')
    setConfirmedMessage('')

    try {
      const assignment = await createFreightAssignment({
        assignedBy: String(formData.get('assignedBy') || getCurrentActorName()).trim(),
        deliveryDate: String(formData.get('deliveryDate') || '').trim() || undefined,
        driverId: String(formData.get('driverId') || '').trim(),
        notes: String(formData.get('notes') || '').trim(),
        pickupDate: String(formData.get('pickupDate') || '').trim(),
        quoteId: request?.quoteId,
        requestId,
        status: 'SCHEDULED',
        truckId: String(formData.get('truckId') || '').trim(),
      })

      onSaved?.(assignment)
      setAssignedRequestIds((current) => Array.from(new Set([...current, assignment.requestId])))
      setConfirmedMessage('Flete programado y guardado en la base de datos.')
      event.currentTarget.reset()
      setSelectedRequestId(approvedRequests.find((item) => item.id !== requestId)?.id || '')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <form className="form-grid" onSubmit={handleSubmit}>
        {errorMessage ? (
          <div className="span-2">
            <ErrorState description={errorMessage} title="No se pudo asignar el flete" />
          </div>
        ) : null}
        <h2 className={styles.formSectionTitle}>Flete aprobado</h2>
        <Select
          label="Solicitud aprobada"
          name="requestId"
          onChange={(event) => setSelectedRequestId(event.target.value)}
          options={requestOptions}
          required
          value={selectedRequest?.id || ''}
        />
        <Input defaultValue={getCurrentActorName()} label="Asignado por" name="assignedBy" required />
        {selectedRequest ? (
          <div className="span-2 surface-panel stack-tight">
            <div className="split-row">
              <strong>
                {selectedRequest.requestNumber} - {selectedRequest.customerName}
              </strong>
              <FreightRequestStatusBadge status={selectedRequest.status} />
            </div>
            <p className="muted-text">
              {selectedRequest.originAddress} a {selectedRequest.destinationAddress}
            </p>
            <p className="muted-text">
              {CARGO_TYPE_LABELS[selectedRequest.cargoType]} - retiro{' '}
              {selectedRequest.requestedPickupDate ? formatDate(selectedRequest.requestedPickupDate) : 'por definir'}
            </p>
          </div>
        ) : null}
        <h2 className={styles.formSectionTitle}>Recursos y programacion</h2>
        <Select label="Camion disponible" name="truckId" options={truckOptions} required />
        <Select label="Chofer disponible" name="driverId" options={driverOptions} required />
        <Input
          defaultValue={formatDateTimeLocal(selectedRequest?.requestedPickupDate)}
          key={`pickup-${selectedRequest?.id || 'empty'}`}
          label="Fecha de retiro"
          name="pickupDate"
          required
          type="datetime-local"
        />
        <Input label="Entrega estimada" name="deliveryDate" type="datetime-local" />
        <label className="span-2 text-field" htmlFor="assignmentNotes">
          <span>Notas</span>
          <textarea id="assignmentNotes" name="notes" placeholder="Condiciones de carga, temperatura, permisos o contacto en destino" />
        </label>
        <div className="span-2 stack">
          <Button disabled={isSaving} icon={<CalendarCheck size={18} />} type="submit">
            {isSaving ? 'Guardando...' : 'Confirmar asignacion'}
          </Button>
          {confirmedMessage ? <p className="muted-text" role="status">{confirmedMessage}</p> : null}
          <p className="muted-text">
            Camiones no disponibles para flete: {unavailableTrucks.map((truck) => truck.plate).join(', ') || 'ninguno'}
          </p>
        </div>
      </form>
    </Card>
  )
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
