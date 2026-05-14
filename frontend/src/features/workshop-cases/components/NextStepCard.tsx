import { Badge } from '../../../shared/components/Badge/Badge'
import type { WorkshopCase } from '../types/workshopCase.types'
import type { CaseNextStep } from '../utils/workshopCaseWorkflow'
import { getStageDefinition } from '../utils/workshopCaseWorkflow'
import styles from './WorkshopCaseLayout.module.css'

interface NextStepCardProps {
  nextStep: CaseNextStep
  workshopCase: WorkshopCase
}

export function NextStepCard({ nextStep, workshopCase }: NextStepCardProps) {
  const stage = getStageDefinition(nextStep.stageId)
  const requiredPurchases = workshopCase.requiredParts.filter((part) => part.requiresPurchase && part.status !== 'available')

  return (
    <section className={styles.nextStepCard}>
      <div className={styles.summaryHeader}>
        <h2>Proximo paso recomendado</h2>
        <div className={styles.badgeRow}>
          <Badge tone={nextStep.tone}>{stage.label}</Badge>
          {requiredPurchases.length > 0 ? <Badge tone="warning">{requiredPurchases.length} compra pendiente</Badge> : null}
        </div>
      </div>
      <p>{nextStep.description}</p>
    </section>
  )
}
