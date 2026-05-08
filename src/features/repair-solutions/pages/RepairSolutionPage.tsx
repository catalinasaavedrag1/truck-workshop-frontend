import { useParams } from 'react-router-dom'
import { casesMock } from '../../../mocks/cases.mock'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceItem } from '../../../shared/hooks/useResourceItem'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { ApprovalRequiredBanner } from '../components/ApprovalRequiredBanner'
import { EstimatedCostCard } from '../components/EstimatedCostCard'
import { RepairSolutionForm } from '../components/RepairSolutionForm'
import { RequiredPartsList } from '../components/RequiredPartsList'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'

export function RepairSolutionPage() {
  const { caseId } = useParams()
  const { data: workshopCase } = useResourceItem<WorkshopCase>('/cases', caseId, casesMock)
  const title = workshopCase ? `Solucion ${workshopCase.code}` : 'Solucion de reparacion'

  return (
    <PageContainer>
      <PageHeader
        description="Define repuestos, horas, costo y aprobacion antes de ejecutar la reparacion."
        title={title}
      />
      <ApprovalRequiredBanner />
      <div className="two-column-grid">
        <RepairSolutionForm caseId={caseId} />
        <div className="stack">
          <RequiredPartsList />
          <EstimatedCostCard laborCost={180000} partsCost={363900} />
        </div>
      </div>
    </PageContainer>
  )
}
