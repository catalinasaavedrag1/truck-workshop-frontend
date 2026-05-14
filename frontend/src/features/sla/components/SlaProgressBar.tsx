import type { SlaStatus } from '../types/sla.types'

const STATUS_COLORS: Record<SlaStatus, string> = {
  AT_RISK: 'var(--color-warning)',
  BREACHED: 'var(--color-danger)',
  OK: 'var(--color-success)',
}

interface SlaProgressBarProps {
  consumedPercent: number
  status: SlaStatus
}

export function SlaProgressBar({ consumedPercent, status }: SlaProgressBarProps) {
  return (
    <div aria-label={`SLA consumido ${consumedPercent}%`} className="progress-bar">
      <span style={{ background: STATUS_COLORS[status], width: `${consumedPercent}%` }} />
    </div>
  )
}
