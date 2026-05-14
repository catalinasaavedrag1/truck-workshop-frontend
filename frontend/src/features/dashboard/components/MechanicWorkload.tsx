import { Card } from '../../../shared/components/Card/Card'
import type { MechanicWorkloadItem } from '../types/dashboard.types'

interface MechanicWorkloadProps {
  workload: MechanicWorkloadItem[]
}

export function MechanicWorkload({ workload }: MechanicWorkloadProps) {
  return (
    <Card>
      <div className="stack">
        <h2 className="section-title">Carga de mecanicos</h2>
        {workload.map((item) => {
          const usage = Math.round((item.assignedCases / item.maxCases) * 100)

          return (
            <div className="stack" key={item.mechanicId}>
              <div className="split-row">
                <strong>{item.mechanicName}</strong>
                <span className="muted-text">
                  {item.assignedCases}/{item.maxCases}
                </span>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${usage}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
