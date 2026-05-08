import { Badge } from '../../../shared/components/Badge/Badge'
import type { DiagnosticChecklistTemplate } from '../types/diagnosticChecklist.types'

interface ChecklistTemplateCardProps {
  template: DiagnosticChecklistTemplate
}

export function ChecklistTemplateCard({ template }: ChecklistTemplateCardProps) {
  const completedItems = template.items.filter((item) => item.checked).length

  return (
    <div className="surface-panel">
      <div className="stack">
        <div className="split-row">
          <div>
            <strong>{template.name}</strong>
            <p className="muted-text">{template.estimatedMinutes} min estimados</p>
          </div>
          <Badge tone={completedItems === template.items.length ? 'success' : 'warning'}>
            {completedItems}/{template.items.length}
          </Badge>
        </div>
        {template.items.map((item) => (
          <label className="checkbox-row" htmlFor={item.id} key={item.id}>
            <input checked={item.checked} id={item.id} readOnly type="checkbox" />
            <span>{item.label}</span>
            {item.required ? <Badge tone="neutral">Obligatorio</Badge> : null}
          </label>
        ))}
      </div>
    </div>
  )
}
