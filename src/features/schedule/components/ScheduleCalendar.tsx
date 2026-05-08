import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import type { ScheduleEvent } from '../types/schedule.types'
import { ScheduleStatusBadge } from './ScheduleStatusBadge'

interface ScheduleCalendarProps {
  events: ScheduleEvent[]
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function ScheduleCalendar({ events }: ScheduleCalendarProps) {
  return (
    <div className="stack">
      {events.map((event) => (
        <div className="list-row" key={event.id}>
          <div>
            <strong>
              {formatTime(event.startsAt)} - {formatTime(event.endsAt)} · {event.caseNumber}
            </strong>
            <p className="muted-text">
              {event.title} · {event.mechanicName} · {event.bayName}
            </p>
            <div className="inline-actions">
              <ScheduleStatusBadge status={event.status} />
              <span className="muted-text">{event.estimatedHours} h estimadas</span>
            </div>
          </div>
          <Link to={ROUTES.caseDetail(event.caseId)}>
            <Button size="sm" variant="secondary">
              Ver caso
            </Button>
          </Link>
        </div>
      ))}
    </div>
  )
}
