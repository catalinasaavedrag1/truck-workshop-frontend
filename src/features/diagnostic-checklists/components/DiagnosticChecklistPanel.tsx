import { Card } from '../../../shared/components/Card/Card'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { diagnosticChecklistsMock } from '../mocks/diagnosticChecklists.mock'
import type { DiagnosticChecklistTemplate } from '../types/diagnosticChecklist.types'
import { ChecklistTemplateCard } from './ChecklistTemplateCard'

interface DiagnosticChecklistPanelProps {
  compact?: boolean
}

export function DiagnosticChecklistPanel({ compact = false }: DiagnosticChecklistPanelProps) {
  const { data: diagnosticChecklists } = useResourceList<DiagnosticChecklistTemplate>(
    '/diagnostic-checklists',
    diagnosticChecklistsMock,
    { order: 'asc', sort: 'name' },
  )
  const templates = compact ? diagnosticChecklists.slice(0, 2) : diagnosticChecklists

  return (
    <Card>
      <div className="stack">
        <h2 className="section-title">Checklist de diagnostico</h2>
        <div className="three-column-grid">
          {templates.map((template) => (
            <ChecklistTemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </Card>
  )
}
