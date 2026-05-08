import { Card } from '../../../shared/components/Card/Card'
import { formatDate } from '../../../shared/utils/formatDate'
import { timelineEventLabels } from '../constants/fleet.constants'
import type { TruckTimelineEvent } from '../types/fleet.types'

interface TruckTimelineProps {
  events: TruckTimelineEvent[]
}

export function TruckTimeline({ events }: TruckTimelineProps) {
  return (
    <Card>
      <h2 className="section-title">Timeline completo</h2>
      <div className="timeline">
        {events.map((event, index) => (
          <div className="timeline-step" key={event.id}>
            <span className="timeline-dot">{index + 1}</span>
            <div>
              <div className="split-row">
                <strong>{event.title}</strong>
                <small className="muted-text">{formatDate(event.eventDate)}</small>
              </div>
              <p className="muted-text">{event.description}</p>
              <small>
                {timelineEventLabels[event.eventType]} - {event.createdBy}
              </small>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
