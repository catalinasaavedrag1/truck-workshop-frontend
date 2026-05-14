import { Card } from '../../../shared/components/Card/Card'
import type { PreventiveMaintenancePlan } from '../types/preventiveMaintenance.types'
import { MaintenanceDueBadge } from './MaintenanceDueBadge'

interface MaintenanceRiskCardProps {
  title: string
  plans: PreventiveMaintenancePlan[]
}

export function MaintenanceRiskCard({ title, plans }: MaintenanceRiskCardProps) {
  return (
    <Card>
      <h2 className="section-title">{title}</h2>
      <strong className="metric-value">{plans.length}</strong>
      <div className="stack-tight">
        {plans.slice(0, 3).map((plan) => (
          <div className="split-row" key={plan.id}>
            <span>{plan.description}</span>
            <MaintenanceDueBadge status={plan.riskStatus} />
          </div>
        ))}
      </div>
    </Card>
  )
}
