import { Card } from '../../../shared/components/Card/Card'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { scheduleEventsMock } from '../mocks/schedule.mock'
import type { ScheduleEvent } from '../types/schedule.types'
import { ScheduleStatusBadge } from './ScheduleStatusBadge'

interface CaseSchedulePanelProps {
  caseId: string
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

export function CaseSchedulePanel({ caseId }: CaseSchedulePanelProps) {
  const { data: scheduleEvents } = useResourceList<ScheduleEvent>('/schedule/events', scheduleEventsMock, {
    caseId,
    order: 'asc',
    sort: 'startsAt',
  })
  const event = scheduleEvents.find((item) => item.caseId === caseId)

  return (
    <Card>
      <div className="stack">
        <h2 className="section-title">Agenda y estacion</h2>
        {event ? (
          <dl className="detail-list">
            <div>
              <dt>Programacion</dt>
              <dd>
                {formatDateTime(event.startsAt)} - {formatDateTime(event.endsAt)}
              </dd>
            </div>
            <div>
              <dt>Estacion</dt>
              <dd>{event.bayName}</dd>
            </div>
            <div>
              <dt>Mecanico</dt>
              <dd>{event.mechanicName}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>
                <ScheduleStatusBadge status={event.status} />
              </dd>
            </div>
          </dl>
        ) : (
          <p className="muted-text">Caso pendiente de programacion.</p>
        )}
      </div>
    </Card>
  )
}
