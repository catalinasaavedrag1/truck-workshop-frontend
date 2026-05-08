import { Badge } from '../../../shared/components/Badge/Badge'
import type { ScheduleEvent } from '../types/schedule.types'

interface ScheduleConflictBadgeProps {
  event: ScheduleEvent
  events: ScheduleEvent[]
}

function overlaps(a: ScheduleEvent, b: ScheduleEvent) {
  const startsA = new Date(a.startsAt).getTime()
  const endsA = new Date(a.endsAt).getTime()
  const startsB = new Date(b.startsAt).getTime()
  const endsB = new Date(b.endsAt).getTime()

  return startsA < endsB && startsB < endsA
}

export function ScheduleConflictBadge({ event, events }: ScheduleConflictBadgeProps) {
  const hasBayConflict = events.some((candidate) => candidate.id !== event.id && candidate.bayId === event.bayId && overlaps(event, candidate))
  const hasMechanicConflict = events.some(
    (candidate) => candidate.id !== event.id && candidate.mechanicId === event.mechanicId && overlaps(event, candidate),
  )

  if (hasBayConflict) {
    return <Badge tone="danger">Choque estacion</Badge>
  }

  if (hasMechanicConflict) {
    return <Badge tone="warning">Choque mecanico</Badge>
  }

  return null
}
