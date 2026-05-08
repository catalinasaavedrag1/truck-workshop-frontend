import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { CasePriorityBadge } from '../../workshop-cases/components/CasePriorityBadge'
import { SlaBadge } from '../../sla/components/SlaBadge'
import type { ScheduleEvent } from '../types/schedule.types'
import { ScheduleConflictBadge } from './ScheduleConflictBadge'
import { ScheduleStatusBadge } from './ScheduleStatusBadge'
import styles from './SchedulePlanner.module.css'

interface ScheduledCaseBlockProps {
  event: ScheduleEvent
  events: ScheduleEvent[]
  leftPercent: number
  widthPercent: number
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function ScheduledCaseBlock({ event, events, leftPercent, widthPercent }: ScheduledCaseBlockProps) {
  return (
    <Link
      className={styles.eventBlock}
      data-status={event.status}
      style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
      title={`${event.caseNumber} - ${event.title}`}
      to={ROUTES.caseDetail(event.caseId)}
    >
      <div className="split-row">
        <strong className={styles.eventTitle}>{event.caseNumber}</strong>
        <ScheduleStatusBadge status={event.status} />
      </div>
      <span className={styles.eventTitle}>{event.title}</span>
      <div className={styles.eventMeta}>
        <span>{formatTime(event.startsAt)}-{formatTime(event.endsAt)}</span>
        <span>{event.truckPlate}</span>
        <span>{event.mechanicName}</span>
      </div>
      <div className="inline-actions">
        <CasePriorityBadge priority={event.priority} />
        <SlaBadge status={event.slaStatus} />
        {event.hasPartsBlock ? <Badge tone="warning">Repuestos</Badge> : null}
        <ScheduleConflictBadge event={event} events={events} />
      </div>
    </Link>
  )
}
