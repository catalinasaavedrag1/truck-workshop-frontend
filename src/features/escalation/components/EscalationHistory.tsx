import { formatDate } from '../../../shared/utils/formatDate'
import type { EscalationEvent } from '../types/escalation.types'
import { EscalationReasonBadge } from './EscalationReasonBadge'

interface EscalationHistoryProps {
  events: EscalationEvent[]
}

export function EscalationHistory({ events }: EscalationHistoryProps) {
  if (events.length === 0) {
    return <p className="muted-text">Sin escalamiento registrado.</p>
  }

  return (
    <div className="timeline">
      {events.map((event) => (
        <div className="timeline-step" key={event.id}>
          <span className="timeline-dot">!</span>
          <div className="stack">
            <div className="split-row">
              <strong>{event.toLevel.replaceAll('_', ' ')}</strong>
              <EscalationReasonBadge reason={event.reason} />
            </div>
            <p>{event.comment}</p>
            <p className="muted-text">
              {formatDate(event.createdAt)} por {event.createdBy}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
