import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { LaborTasksTable } from '../components/LaborTasksTable'
import { laborTasksMock } from '../mocks/labor.mock'
import type { LaborTask } from '../types/labor.types'

export function LaborPage() {
  const { data: laborTasks } = useResourceList<LaborTask>('/labor', laborTasksMock, { order: 'asc', sort: 'status' })
  const estimatedHours = laborTasks.reduce((total, task) => total + task.estimatedHours, 0)
  const realHours = laborTasks.reduce((total, task) => total + (task.realHours || 0), 0)

  return (
    <PageContainer>
      <PageHeader
        description="Tareas de mano de obra con horas estimadas, reales, mecanico y tarifa."
        title="Mano de obra"
      />
      <div className="three-column-grid">
        <Card>
          <div className="stack">
            <span className="muted-text">Horas estimadas</span>
            <strong className="metric-value">{estimatedHours}</strong>
          </div>
        </Card>
        <Card>
          <div className="stack">
            <span className="muted-text">Horas reales registradas</span>
            <strong className="metric-value">{realHours.toFixed(1)}</strong>
          </div>
        </Card>
        <Card>
          <div className="stack">
            <span className="muted-text">Trabajos en curso</span>
            <strong className="metric-value">
              {laborTasks.filter((task) => task.status === 'in_progress').length}
            </strong>
          </div>
        </Card>
      </div>
      <Card>
        <LaborTasksTable tasks={laborTasks} />
      </Card>
    </PageContainer>
  )
}
