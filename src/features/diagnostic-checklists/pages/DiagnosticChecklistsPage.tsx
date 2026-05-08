import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { DiagnosticChecklistPanel } from '../components/DiagnosticChecklistPanel'

export function DiagnosticChecklistsPage() {
  return (
    <PageContainer>
      <PageHeader
        description="Plantillas por motor, frenos, electrico, neumaticos, suspension y transmision."
        title="Checklists de diagnostico"
      />
      <DiagnosticChecklistPanel />
    </PageContainer>
  )
}
