import { Card } from '../../../shared/components/Card/Card'
import type { CasesByStatus } from '../types/dashboard.types'

interface CasesByStatusChartProps {
  data: CasesByStatus[]
}

export function CasesByStatusChart({ data }: CasesByStatusChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 1)

  return (
    <Card>
      <div className="stack">
        <h2 className="section-title">Casos por estado</h2>
        {data.map((item) => (
          <div className="chart-row" key={item.label}>
            <span className="muted-text">{item.label}</span>
            <div className="progress-bar">
              <span style={{ width: `${(item.value / maxValue) * 100}%` }} />
            </div>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </Card>
  )
}
