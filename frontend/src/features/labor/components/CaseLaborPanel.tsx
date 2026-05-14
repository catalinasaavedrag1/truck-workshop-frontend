import { Card } from '../../../shared/components/Card/Card'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { laborTasksMock } from '../mocks/labor.mock'
import type { LaborTask } from '../types/labor.types'
import { LaborTasksTable } from './LaborTasksTable'

interface CaseLaborPanelProps {
  caseId: string
}

export function CaseLaborPanel({ caseId }: CaseLaborPanelProps) {
  const { data: laborTasks } = useResourceList<LaborTask>('/labor/tasks', laborTasksMock, {
    caseId,
    order: 'asc',
    sort: 'updatedAt',
  })
  const tasks = laborTasks.filter((task) => task.caseId === caseId)
  const estimatedTotal = tasks.reduce((total, task) => total + task.estimatedHours * task.hourlyRate, 0)

  return (
    <Card>
      <div className="stack">
        <div className="split-row">
          <div>
            <h2 className="section-title">Mano de obra</h2>
            <p className="muted-text">Horas estimadas, reales y tarifa por mecanico.</p>
          </div>
          <strong>{formatCurrency(estimatedTotal)}</strong>
        </div>
        <LaborTasksTable tasks={tasks} />
      </div>
    </Card>
  )
}
