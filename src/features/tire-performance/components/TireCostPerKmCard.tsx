import { Card } from '../../../shared/components/Card/Card'

interface TireCostPerKmCardProps {
  label: string
  value: string
  helper: string
}

export function TireCostPerKmCard({ label, value, helper }: TireCostPerKmCardProps) {
  return (
    <Card>
      <div className="stack">
        <span className="muted-text">{label}</span>
        <strong className="metric-value">{value}</strong>
        <span className="muted-text">{helper}</span>
      </div>
    </Card>
  )
}
