import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { casesMock } from '../../../mocks/cases.mock'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceItem } from '../../../shared/hooks/useResourceItem'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { DiagnosticChecklistPanel } from '../../diagnostic-checklists/components/DiagnosticChecklistPanel'
import { DiagnosticForm } from '../components/DiagnosticForm'
import { DiagnosticResultCard } from '../components/DiagnosticResultCard'
import { useCaseDiagnostics } from '../hooks/useCaseDiagnostics'
import type { Diagnostic } from '../types/diagnostic.types'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'

export function DiagnosticPage() {
  const { caseId } = useParams()
  const [savedDiagnostic, setSavedDiagnostic] = useState<Diagnostic | null>(null)
  const { data: workshopCase } = useResourceItem<WorkshopCase>('/cases', caseId, casesMock)
  const {
    data: diagnostics,
    errorMessage,
    isLoading,
    prepend,
  } = useCaseDiagnostics(caseId)
  const title = workshopCase ? `Diagnostico ${workshopCase.caseNumber}` : 'Diagnostico tecnico'
  const visibleDiagnostic = savedDiagnostic || diagnostics[0] || null

  const handleSaved = (diagnostic: Diagnostic) => {
    setSavedDiagnostic(diagnostic)
    prepend(diagnostic)
  }

  return (
    <PageContainer>
      <PageHeader
        description="Registro tecnico de sintomas, causa probable y severidad."
        title={title}
      />
      <div className="two-column-grid">
        <DiagnosticForm caseId={caseId} onSaved={handleSaved} />
        <DiagnosticResultCard
          diagnostic={visibleDiagnostic}
          diagnostics={diagnostics}
          errorMessage={errorMessage}
          isLoading={isLoading}
        />
      </div>
      <DiagnosticChecklistPanel compact />
    </PageContainer>
  )
}
