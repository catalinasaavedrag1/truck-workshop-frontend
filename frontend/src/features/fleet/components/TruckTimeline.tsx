import { Card } from '../../../shared/components/Card/Card'
import { EntityLink } from '../../../shared/components/EntityLink'
import type { EntityType } from '../../../shared/navigation/entityRoutes'
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
              {event.relatedEntityId ? (
                <p>
                  <TimelineEntityLink event={event} />
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function TimelineEntityLink({ event }: { event: TruckTimelineEvent }) {
  const entityType = getTimelineEntityType(event.relatedEntityType)

  if (!entityType) {
    return <span className="muted-text">{event.relatedEntityId}</span>
  }

  return (
    <EntityLink id={event.relatedEntityId} type={entityType} variant="subtle">
      {getTimelineEntityLabel(event.relatedEntityType, event.relatedEntityId)}
    </EntityLink>
  )
}

function getTimelineEntityType(type?: string): EntityType | undefined {
  const entityTypes: Record<string, EntityType> = {
    case: 'case',
    document: 'truckDocument',
    freight: 'freightRequest',
    maintenance: 'maintenancePlan',
  }

  return type ? entityTypes[type] : undefined
}

function getTimelineEntityLabel(type?: string, id?: string) {
  const labels: Record<string, string> = {
    case: 'Abrir caso conectado',
    document: 'Abrir documento',
    freight: 'Abrir flete',
    maintenance: 'Abrir mantencion',
  }

  return type ? labels[type] || id || 'Abrir entidad' : id || 'Abrir entidad'
}
