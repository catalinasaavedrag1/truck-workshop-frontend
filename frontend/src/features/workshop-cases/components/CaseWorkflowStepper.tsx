import { CheckCircle2, CircleDot, Clock3, LockKeyhole } from 'lucide-react'
import type { CaseWorkflowStage, CaseWorkflowStageId } from '../utils/workshopCaseWorkflow'
import styles from './WorkshopCaseLayout.module.css'

interface CaseWorkflowStepperProps {
  activeStageId: CaseWorkflowStageId
  onSelectStage: (stageId: CaseWorkflowStageId) => void
  stages: CaseWorkflowStage[]
}

export function CaseWorkflowStepper({ activeStageId, onSelectStage, stages }: CaseWorkflowStepperProps) {
  return (
    <nav aria-label="Workflow del caso" className={styles.workflow}>
      {stages.map((stage) => {
        const stateClass = {
          blocked: styles.stageButtonBlocked,
          complete: styles.stageButtonComplete,
          current: styles.stageButtonCurrent,
          pending: '',
        }[stage.state]

        return (
          <button
            aria-current={activeStageId === stage.id ? 'step' : undefined}
            className={[styles.stageButton, stateClass].filter(Boolean).join(' ')}
            key={stage.id}
            onClick={() => onSelectStage(stage.id)}
            type="button"
          >
            <span className={styles.stageNumber}>{String(stage.order).padStart(2, '0')}</span>
            <span className={styles.stageText}>
              <strong>{stage.shortLabel}</strong>
              <span>{stage.stateLabel}</span>
            </span>
            <span className={styles.stageIcon}>{getStateIcon(stage.state)}</span>
            {stage.alert ? <span className={styles.stageAlert}>{stage.alert}</span> : null}
          </button>
        )
      })}
    </nav>
  )
}

function getStateIcon(state: CaseWorkflowStage['state']) {
  if (state === 'complete') {
    return <CheckCircle2 aria-hidden size={18} />
  }

  if (state === 'current') {
    return <CircleDot aria-hidden size={18} />
  }

  if (state === 'blocked') {
    return <LockKeyhole aria-hidden size={18} />
  }

  return <Clock3 aria-hidden size={18} />
}
