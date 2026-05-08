import type { WorkshopBay } from '../../workshop-bays/types/workshopBay.types'
import type { ScheduleEvent } from '../types/schedule.types'
import { BayTimelineRow } from './BayTimelineRow'
import styles from './SchedulePlanner.module.css'

interface WorkshopScheduleTimelineProps {
  bayId: string
  bays: WorkshopBay[]
  events: ScheduleEvent[]
}

const dayStartHour = 8
const dayEndHour = 19
const hours = Array.from({ length: dayEndHour - dayStartHour }, (_, index) => dayStartHour + index)

export function WorkshopScheduleTimeline({ bayId, bays, events }: WorkshopScheduleTimelineProps) {
  const visibleBays = bayId === 'all' ? bays : bays.filter((bay) => bay.id === bayId)

  return (
    <div className={styles.timelineShell}>
      <div className={styles.timeline}>
        <div className={styles.timeHeader}>
          <div className={styles.timeCell}>Estacion / hora</div>
          {hours.map((hour) => (
            <div className={styles.timeCell} key={hour}>
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>
        {visibleBays.map((bay) => (
          <BayTimelineRow
            bay={bay}
            dayEndHour={dayEndHour}
            dayStartHour={dayStartHour}
            events={events}
            key={bay.id}
          />
        ))}
      </div>
    </div>
  )
}
