import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Card } from '../../../shared/components/Card/Card'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import styles from '../../diagnostics/components/DiagnosticWorkspace.module.css'
import { diagnosticChecklistsMock } from '../mocks/diagnosticChecklists.mock'
import type { DiagnosticChecklistTemplate } from '../types/diagnosticChecklist.types'

interface DiagnosticChecklistPanelProps {
  compact?: boolean
  templates?: DiagnosticChecklistTemplate[]
  onProgressChange?: (progress: ChecklistProgress) => void
}

export interface ChecklistProgress {
  completedItems: number
  estimatedMinutes: number
  requiredItems: number
  totalItems: number
}

export function DiagnosticChecklistPanel({ compact = false, onProgressChange, templates }: DiagnosticChecklistPanelProps) {
  const { data: fetchedChecklists } = useResourceList<DiagnosticChecklistTemplate>(
    '/diagnostic-checklists',
    diagnosticChecklistsMock,
    { order: 'asc', sort: 'name' },
  )
  const diagnosticChecklists = templates ?? fetchedChecklists
  const visibleTemplates = compact ? diagnosticChecklists.slice(0, 2) : diagnosticChecklists
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>({})
  const progress = useMemo(() => getChecklistProgress(visibleTemplates, checkedState), [checkedState, visibleTemplates])
  const progressPercent = progress.totalItems > 0 ? Math.round((progress.completedItems / progress.totalItems) * 100) : 0

  useEffect(() => {
    onProgressChange?.(progress)
  }, [onProgressChange, progress])

  return (
    <Card className={styles.checklistCard}>
      <div className={styles.checklistHeader}>
        <div>
          <h2>Checklist de diagnostico</h2>
          <p>Marca verificaciones por sistema y confirma el avance real antes de guardar el diagnostico.</p>
        </div>
        <div className={styles.checklistStats}>
          <Badge tone={progressPercent === 100 ? 'success' : 'warning'}>
            {progress.completedItems}/{progress.totalItems} completados
          </Badge>
          <Badge tone="info">{progress.estimatedMinutes} min estimados</Badge>
        </div>
      </div>

      <div className={styles.progressBlock}>
        <div className={styles.progressMeta}>
          <span>Progreso general</span>
          <strong>{progressPercent}%</strong>
        </div>
        <div className={styles.progressBar} aria-hidden>
          <span style={{ width: `${progressPercent}%` }} />
        </div>
        <span className={styles.muted}>{progress.requiredItems} tareas obligatorias en el checklist visible.</span>
      </div>

      <div className={styles.checklistGrid}>
        {visibleTemplates.map((template) => {
          const groupCompleted = template.items.filter((item) => checkedState[item.id] ?? item.checked).length
          const groupPercent = template.items.length > 0 ? Math.round((groupCompleted / template.items.length) * 100) : 0

          return (
            <section className={styles.checklistGroup} key={template.id}>
              <div className={styles.checklistGroupHeader}>
                <div>
                  <strong>{template.name}</strong>
                  <p className={styles.muted}>{template.estimatedMinutes} min estimados</p>
                </div>
                <Badge tone={groupCompleted === template.items.length ? 'success' : 'warning'}>
                  {groupCompleted}/{template.items.length}
                </Badge>
              </div>
              <div className={styles.progressBar} aria-label={`Progreso ${template.name}: ${groupPercent}%`}>
                <span style={{ width: `${groupPercent}%` }} />
              </div>
              <div className={styles.checklistItems}>
                {template.items.map((item) => (
                  <label className={styles.checklistItem} htmlFor={item.id} key={item.id}>
                    <input
                      checked={checkedState[item.id] ?? item.checked}
                      id={item.id}
                      onChange={(event) =>
                        setCheckedState((currentState) => ({
                          ...currentState,
                          [item.id]: event.target.checked,
                        }))
                      }
                      type="checkbox"
                    />
                    <span>{item.label}</span>
                    <Badge tone={item.required ? 'neutral' : 'info'}>{item.required ? 'Obligatorio' : 'Opcional'}</Badge>
                  </label>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </Card>
  )
}

function getChecklistProgress(
  templates: DiagnosticChecklistTemplate[],
  checkedState: Record<string, boolean>,
): ChecklistProgress {
  return templates.reduce(
    (summary, template) => {
      const completed = template.items.filter((item) => checkedState[item.id] ?? item.checked).length

      return {
        completedItems: summary.completedItems + completed,
        estimatedMinutes: summary.estimatedMinutes + template.estimatedMinutes,
        requiredItems: summary.requiredItems + template.items.filter((item) => item.required).length,
        totalItems: summary.totalItems + template.items.length,
      }
    },
    {
      completedItems: 0,
      estimatedMinutes: 0,
      requiredItems: 0,
      totalItems: 0,
    },
  )
}
