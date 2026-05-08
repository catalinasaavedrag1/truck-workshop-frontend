import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { CalendarClock, Save } from 'lucide-react'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Modal } from '../../../shared/components/Modal/Modal'
import { Select } from '../../../shared/components/Select/Select'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import type { Mechanic } from '../../mechanics/types/mechanic.types'
import type { WorkshopBay } from '../../workshop-bays/types/workshopBay.types'
import { planScheduleEvent } from '../services/schedule.service'
import type { ScheduleEvent, SchedulePlanResponse, WaitingQueueItem } from '../types/schedule.types'
import { addHours, buildLocalDateTime, eventsOverlap, getDateKey } from '../utils/scheduleTime'
import styles from './SchedulePlanner.module.css'

interface PlanCaseModalProps {
  defaultDate: string
  events: ScheduleEvent[]
  mechanics: Mechanic[]
  bays: WorkshopBay[]
  queueItem: WaitingQueueItem | null
  onClose: () => void
  onScheduled: (response: SchedulePlanResponse) => void
}

export function PlanCaseModal({
  bays,
  defaultDate,
  events,
  mechanics,
  onClose,
  onScheduled,
  queueItem,
}: PlanCaseModalProps) {
  const availableBays = useMemo(() => bays.filter((bay) => bay.status !== 'maintenance'), [bays])
  const assignableMechanics = useMemo(
    () => mechanics.filter((mechanic) => mechanic.availability !== 'off-shift'),
    [mechanics],
  )

  return (
    <Modal onClose={onClose} open={Boolean(queueItem)} title="Agendar caso">
      {queueItem ? (
        <PlanCaseForm
          assignableMechanics={assignableMechanics}
          availableBays={availableBays}
          bays={bays}
          defaultDate={defaultDate}
          events={events}
          key={queueItem.id}
          mechanics={mechanics}
          onClose={onClose}
          onScheduled={onScheduled}
          queueItem={queueItem}
        />
      ) : null}
    </Modal>
  )
}

interface PlanCaseFormProps {
  assignableMechanics: Mechanic[]
  availableBays: WorkshopBay[]
  bays: WorkshopBay[]
  defaultDate: string
  events: ScheduleEvent[]
  mechanics: Mechanic[]
  queueItem: WaitingQueueItem
  onClose: () => void
  onScheduled: (response: SchedulePlanResponse) => void
}

function PlanCaseForm({
  assignableMechanics,
  availableBays,
  bays,
  defaultDate,
  events,
  mechanics,
  onClose,
  onScheduled,
  queueItem,
}: PlanCaseFormProps) {
  const [date, setDate] = useState(defaultDate)
  const [startsAt, setStartsAt] = useState('08:00')
  const [estimatedHours, setEstimatedHours] = useState(queueItem.estimatedHours || 2)
  const [bayId, setBayId] = useState(availableBays[0]?.id || '')
  const [mechanicId, setMechanicId] = useState(assignableMechanics[0]?.id || '')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const conflict = useMemo(() => {
    if (!date || !startsAt || !bayId || !mechanicId || !estimatedHours) {
      return null
    }

    const start = buildLocalDateTime(date, startsAt)
    const end = addHours(start, estimatedHours)
    const sameDayEvents = events.filter((event) => getDateKey(event.date) === date && event.status !== 'done')

    return (
      sameDayEvents.find(
        (event) =>
          event.bayId === bayId &&
          eventsOverlap(
            { startsAt: start.toISOString(), endsAt: end.toISOString() },
            { startsAt: event.startsAt, endsAt: event.endsAt },
          ),
      ) ||
      sameDayEvents.find(
        (event) =>
          event.mechanicId === mechanicId &&
          eventsOverlap(
            { startsAt: start.toISOString(), endsAt: end.toISOString() },
            { startsAt: event.startsAt, endsAt: event.endsAt },
          ),
      ) ||
      null
    )
  }, [bayId, date, estimatedHours, events, mechanicId, startsAt])

  const selectedBay = bays.find((bay) => bay.id === bayId)
  const selectedMechanic = mechanics.find((mechanic) => mechanic.id === mechanicId)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (conflict) {
      return
    }

    setIsSaving(true)
    setErrorMessage('')

    try {
      const response = await planScheduleEvent({
        bayId,
        caseId: queueItem.caseId,
        date,
        estimatedHours,
        mechanicId,
        queueItemId: queueItem.id,
        startsAt,
      })

      onScheduled(response)
      onClose()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="span-2">
        <div className={styles.planSummary}>
          <CalendarClock size={18} />
          <div>
            <strong>{queueItem.caseNumber}</strong>
            <p className="muted-text">
              {queueItem.truckPlate} - {queueItem.customerName} - {queueItem.reason}
            </p>
          </div>
          {queueItem.hasPartsBlock ? <Badge tone="warning">Repuestos</Badge> : null}
        </div>
      </div>

      {errorMessage ? (
        <div className="span-2">
          <ErrorState description={errorMessage} title="No se pudo agendar" />
        </div>
      ) : null}

      {conflict ? (
        <div className="span-2">
          <ErrorState
            description={`${conflict.caseNumber} ya ocupa ${conflict.bayName} o ${conflict.mechanicName} en ese horario.`}
            title="Choque de agenda"
          />
        </div>
      ) : null}

      <Input label="Fecha" name="date" onChange={(event) => setDate(event.target.value)} required type="date" value={date} />
      <Input
        label="Hora inicio"
        name="startsAt"
        onChange={(event) => setStartsAt(event.target.value)}
        required
        type="time"
        value={startsAt}
      />
      <Input
        label="Duracion estimada"
        max={12}
        min={0.5}
        name="estimatedHours"
        onChange={(event) => setEstimatedHours(Number(event.target.value))}
        required
        step={0.5}
        type="number"
        value={estimatedHours}
      />
      <Select
        label="Estacion"
        name="bayId"
        onChange={(event) => setBayId(event.target.value)}
        options={availableBays.map((bay) => ({ label: `${bay.name} (${bay.status})`, value: bay.id }))}
        required
        value={bayId}
      />
      <Select
        className="span-2"
        label="Mecanico"
        name="mechanicId"
        onChange={(event) => setMechanicId(event.target.value)}
        options={assignableMechanics.map((mechanic) => ({
          label: `${mechanic.name} - ${mechanic.specialty} (${mechanic.activeCases}/${mechanic.maxCases})`,
          value: mechanic.id,
        }))}
        required
        value={mechanicId}
      />

      <div className="span-2 detail-list">
        <div>
          <dt>Estacion seleccionada</dt>
          <dd>{selectedBay?.name || 'Sin estacion'}</dd>
        </div>
        <div>
          <dt>Responsable</dt>
          <dd>{selectedMechanic?.name || 'Sin mecanico'}</dd>
        </div>
      </div>

      <div className="span-2 inline-actions">
        <Button disabled={Boolean(conflict) || isSaving || !bayId || !mechanicId} icon={<Save size={18} />} type="submit">
          {isSaving ? 'Agendando...' : 'Confirmar agenda'}
        </Button>
        <Button onClick={onClose} type="button" variant="secondary">
          Cancelar
        </Button>
      </div>
    </form>
  )
}
