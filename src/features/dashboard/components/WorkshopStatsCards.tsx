import { Card } from '../../../shared/components/Card/Card'
import type { DashboardMetric } from '../types/dashboard.types'

interface WorkshopStatsCardsProps {
  metrics: DashboardMetric[]
}

export function WorkshopStatsCards({ metrics }: WorkshopStatsCardsProps) {
  const groupedMetrics = metrics.reduce<Record<string, DashboardMetric[]>>((groups, metric) => {
    const groupName = metric.group || 'Operacion'

    return {
      ...groups,
      [groupName]: [...(groups[groupName] || []), metric],
    }
  }, {})

  return (
    <div className="dashboard-metric-sections">
      {Object.entries(groupedMetrics).map(([groupName, groupMetrics]) => (
        <section className="dashboard-metric-section" key={groupName}>
          <div className="section-heading-row">
            <h2 className="section-title">{groupName}</h2>
            <span className="muted-text">{groupMetrics.length} indicadores</span>
          </div>
          <div className="metric-grid">
            {groupMetrics.map((metric) => (
              <Card key={metric.label}>
                <div className="stack">
                  <span className="muted-text">{metric.label}</span>
                  <strong className="metric-value">{metric.value}</strong>
                  <span className="muted-text">{metric.trend}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
