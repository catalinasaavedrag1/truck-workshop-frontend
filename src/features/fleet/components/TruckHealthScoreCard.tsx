import { Badge } from '../../../shared/components/Badge/Badge'
import { Card } from '../../../shared/components/Card/Card'
import { healthStatusLabels, healthStatusTones } from '../constants/fleet.constants'
import type { FleetTruck, TruckHealthScore } from '../types/fleet.types'

interface TruckHealthScoreCardProps {
  score: TruckHealthScore
  truck?: FleetTruck
}

export function TruckHealthScoreCard({ score, truck }: TruckHealthScoreCardProps) {
  return (
    <Card>
      <div className="split-row">
        <div>
          <h2 className="section-title">{truck ? truck.plate : 'Health Score'}</h2>
          <p className="muted-text">{score.summary}</p>
        </div>
        <Badge tone={healthStatusTones[score.status]}>{healthStatusLabels[score.status]}</Badge>
      </div>
      <strong className="metric-value">{score.score}/100</strong>
      <div className="progress-bar" aria-label={`Score ${score.score}`}>
        <span style={{ width: `${score.score}%` }} />
      </div>
      <div className="stack-tight">
        {score.deductions.map((deduction) => (
          <div className="split-row" key={deduction.label}>
            <span>{deduction.label}</span>
            <strong>-{deduction.points}</strong>
          </div>
        ))}
      </div>
    </Card>
  )
}
