import { BayStatusBadge } from '../../workshop-bays/components/BayStatusBadge'
import { BayTypeBadge } from '../../workshop-bays/components/BayTypeBadge'
import type { WorkshopBay } from '../../workshop-bays/types/workshopBay.types'
import type { ScheduleEvent } from '../types/schedule.types'
import { ScheduledCaseBlock } from './ScheduledCaseBlock'
import styles from './SchedulePlanner.module.css'

interface BayTimelineRowProps {
  bay: WorkshopBay
  events: ScheduleEvent[]
  dayStartHour: number
  dayEndHour: number
}

function minutesFromDayStart(value: string, dayStartHour: number) {
  const date = new Date(value)
  return (date.getHours() - dayStartHour) * 60 + date.getMinutes()
}

export function BayTimelineRow({ bay, events, dayEndHour, dayStartHour }: BayTimelineRowProps) {
  const bayEvents = events.filter((event) => event.bayId === bay.id)
  const totalMinutes = (dayEndHour - dayStartHour) * 60

  return (
    <div className={styles.bayRow}>
      <div className={styles.bayLabel}>
        <strong>{bay.name}</strong>
        <div className="inline-actions">
          <BayTypeBadge type={bay.type} />
          <BayStatusBadge status={bay.status} />
        </div>
      </div>
      <div className={styles.lane}>
        {bayEvents.length === 0 ? <span className={styles.emptyLane}>Sin trabajos agendados</span> : null}
        {bayEvents.map((event) => {
          const start = Math.max(minutesFromDayStart(event.startsAt, dayStartHour), 0)
          const end = Math.min(minutesFromDayStart(event.endsAt, dayStartHour), totalMinutes)
          const leftPercent = (start / totalMinutes) * 100
          const widthPercent = Math.max(((end - start) / totalMinutes) * 100, 9)

          return (
            <ScheduledCaseBlock
              event={event}
              events={events}
              key={event.id}
              leftPercent={leftPercent}
              widthPercent={widthPercent}
            />
          )
        })}
      </div>
    </div>
  )
}
