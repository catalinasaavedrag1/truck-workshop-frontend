import { calculateRemainingHours } from '../mocks/sla.mock'

interface SlaTimerProps {
  dueAt: string
}

function formatHours(hours: number) {
  const absoluteHours = Math.abs(hours)

  if (absoluteHours < 1) {
    return `${Math.round(absoluteHours * 60)} min`
  }

  return `${absoluteHours.toFixed(1)} h`
}

export function SlaTimer({ dueAt }: SlaTimerProps) {
  const remainingHours = calculateRemainingHours(dueAt)

  return (
    <span className="muted-text">
      {remainingHours <= 0 ? `Vencido hace ${formatHours(remainingHours)}` : `Restan ${formatHours(remainingHours)}`}
    </span>
  )
}
