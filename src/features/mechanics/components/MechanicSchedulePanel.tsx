import { CalendarClock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { formatDate } from '../../../shared/utils/formatDate'
import { ScheduleStatusBadge } from '../../schedule/components/ScheduleStatusBadge'
import type { ScheduleEvent } from '../../schedule/types/schedule.types'
import { SlaBadge } from '../../sla/components/SlaBadge'
import styles from './MechanicView.module.css'

interface MechanicSchedulePanelProps {
  events: ScheduleEvent[]
}

export function MechanicSchedulePanel({ events }: MechanicSchedulePanelProps) {
  const visibleEvents = [...events]
    .sort((first, second) => new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime())
    .slice(0, 6)

  return (
    <Card className={styles.panel}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>Agenda del mecanico</h2>
          <p>Bloques planificados, estacion, SLA y estado del trabajo.</p>
        </div>
        <Badge tone={events.length > 0 ? 'info' : 'neutral'}>{events.length} bloques</Badge>
      </div>

      {visibleEvents.length === 0 ? (
        <EmptyState
          description="Este mecanico no tiene agenda registrada. Puedes asignarlo desde agenda o asignaciones."
          icon={<CalendarClock size={20} />}
          title="Sin agenda registrada"
        />
      ) : (
        <div className={styles.timelineList}>
          {visibleEvents.map((event) => (
            <Link className={styles.timelineRow} key={event.id} to={ROUTES.caseDetail(event.caseId)}>
              <div className={styles.timeCell}>
                <strong>{formatTime(event.startsAt)}</strong>
                <span>{formatTime(event.endsAt)}</span>
              </div>
              <div className={styles.timelineBody}>
                <strong>{event.caseNumber} - {event.title}</strong>
                <span>{formatDate(event.startsAt)} - {event.bayName} - {event.truckPlate}</span>
              </div>
              <div className={styles.badgeColumn}>
                <ScheduleStatusBadge status={event.status} />
                <SlaBadge status={event.slaStatus} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
