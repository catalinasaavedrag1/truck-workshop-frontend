import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { MechanicAvailability } from '../types/mechanic.types'

const availabilityLabels: Record<MechanicAvailability, string> = {
  available: 'Disponible',
  busy: 'Ocupado',
  'off-shift': 'Fuera de turno',
}

const availabilityTones: Record<MechanicAvailability, BadgeTone> = {
  available: 'success',
  busy: 'warning',
  'off-shift': 'neutral',
}

interface MechanicAvailabilityBadgeProps {
  availability: MechanicAvailability
}

export function MechanicAvailabilityBadge({ availability }: MechanicAvailabilityBadgeProps) {
  return <Badge tone={availabilityTones[availability]}>{availabilityLabels[availability]}</Badge>
}
