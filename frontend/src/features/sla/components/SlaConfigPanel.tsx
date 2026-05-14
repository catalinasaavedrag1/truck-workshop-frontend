import { Card } from '../../../shared/components/Card/Card'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { slaConfigsMock } from '../mocks/sla.mock'
import type { SlaConfig } from '../types/sla.types'

export function SlaConfigPanel() {
  const { data: slaConfigs } = useResourceList<SlaConfig>('/sla/configs', slaConfigsMock, {
    order: 'asc',
    sort: 'priority',
  })

  return (
    <Card>
      <div className="stack">
        <h2 className="section-title">Configuracion SLA</h2>
        {slaConfigs.map((config) => (
          <div className="list-row" key={config.id}>
            <div>
              <strong>{config.name}</strong>
              <p className="muted-text">Prioridad {config.priority}</p>
            </div>
            <span className="muted-text">{config.targetHours} h objetivo</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
