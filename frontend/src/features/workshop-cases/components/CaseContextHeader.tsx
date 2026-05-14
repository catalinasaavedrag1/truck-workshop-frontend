import { Badge } from '../../../shared/components/Badge/Badge'
import { EntityLink } from '../../../shared/components/EntityLink'
import { formatDate } from '../../../shared/utils/formatDate'
import { getSlaSnapshot } from '../../sla/mocks/sla.mock'
import type { WorkshopCase } from '../types/workshopCase.types'
import type { CaseNextStep } from '../utils/workshopCaseWorkflow'
import { getStageDefinition } from '../utils/workshopCaseWorkflow'
import { CaseStatusBadges } from './CaseStatusBadges'
import styles from './WorkshopCaseLayout.module.css'

interface CaseContextHeaderProps {
  nextStep: CaseNextStep
  workshopCase: WorkshopCase
}

export function CaseContextHeader({ nextStep, workshopCase }: CaseContextHeaderProps) {
  const slaSnapshot = getSlaSnapshot(workshopCase.slaId, workshopCase.slaDueAt, workshopCase.createdAt)
  const remainingHours = Math.abs(slaSnapshot.remainingHours).toFixed(1)
  const slaCopy = slaSnapshot.remainingHours <= 0 ? `${remainingHours}h vencido` : `${remainingHours}h restante`
  const nextStage = getStageDefinition(nextStep.stageId)

  return (
    <header className={styles.contextHeader}>
      <div className={styles.contextMain}>
        <div className={styles.contextTitleRow}>
          <h1 className={styles.caseTitle}>
            Caso{' '}
            <EntityLink id={workshopCase.id} type="case">
              {workshopCase.caseNumber}
            </EntityLink>
            {' · '}Camion{' '}
            <EntityLink id={workshopCase.truckId} type="workshopTruck">
              {workshopCase.truckPlate}
            </EntityLink>
          </h1>
          <CaseStatusBadges workshopCase={workshopCase} />
        </div>
        <p className={styles.failureCopy}>{workshopCase.failureDescription}</p>
        <div className={styles.contextMeta}>
          <div className={styles.metaItem}>
            <span>Cliente</span>
            <strong>
              {workshopCase.customerId ? (
                <EntityLink id={workshopCase.customerId} type="customer" variant="subtle">
                  {workshopCase.customerName || workshopCase.customer}
                </EntityLink>
              ) : (
                workshopCase.customerName || workshopCase.customer || 'Sin cliente'
              )}
            </strong>
          </div>
          <div className={styles.metaItem}>
            <span>Chofer</span>
            <strong>
              <EntityLink fallback="Sin chofer" id={workshopCase.driverId} type="driver" variant="subtle">
                {workshopCase.driverName}
              </EntityLink>
            </strong>
          </div>
          <div className={styles.metaItem}>
            <span>Responsable</span>
            <strong>
              <EntityLink
                fallback="Sin asignar"
                id={workshopCase.mechanicId || workshopCase.assignedMechanicId}
                type="mechanic"
                variant="subtle"
              >
                {workshopCase.mechanicName}
              </EntityLink>
            </strong>
          </div>
          <div className={styles.metaItem}>
            <span>Ultima actividad</span>
            <strong>{formatDate(workshopCase.updatedAt)}</strong>
          </div>
        </div>
      </div>
      <aside className={styles.nextStepPanel} aria-label="Proximo paso recomendado">
        <div className="stack-tight">
          <small>Proximo paso</small>
          <strong>{nextStep.actionLabel}</strong>
          <p>{nextStep.description}</p>
        </div>
        <div className={styles.badgeRow}>
          <Badge tone={nextStep.tone}>{nextStage.label}</Badge>
          <Badge tone={workshopCase.slaStatus === 'BREACHED' ? 'danger' : workshopCase.slaStatus === 'AT_RISK' ? 'warning' : 'success'}>
            {slaCopy}
          </Badge>
        </div>
      </aside>
    </header>
  )
}
