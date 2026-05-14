import type { WorkshopCase } from '../types/workshopCase.types'
import type { CaseNextStep } from '../utils/workshopCaseWorkflow'
import { getCaseWorkflowProgress, getStageDefinition } from '../utils/workshopCaseWorkflow'
import styles from './WorkshopCaseLayout.module.css'

interface StickyCaseFooterProps {
  nextStep: CaseNextStep
  workshopCase: WorkshopCase
}

export function StickyCaseFooter({ nextStep, workshopCase }: StickyCaseFooterProps) {
  const progress = getCaseWorkflowProgress(workshopCase)
  const nextStage = getStageDefinition(nextStep.stageId)

  return (
    <section className={styles.stickyFooter} aria-label="Progreso del caso">
      <div className={styles.progressTrack}>
        <div className={styles.progressMeta}>
          <span>Progreso del workflow</span>
          <span>{progress}%</span>
        </div>
        <div className={styles.progressBar}>
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className={styles.footerNext}>
        {nextStage.label}: {nextStep.actionLabel}
      </div>
    </section>
  )
}
