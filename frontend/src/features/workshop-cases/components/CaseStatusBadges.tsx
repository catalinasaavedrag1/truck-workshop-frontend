import { SlaBadge } from '../../sla/components/SlaBadge'
import type { WorkshopCase } from '../types/workshopCase.types'
import { CasePriorityBadge } from './CasePriorityBadge'
import { CaseStatusBadge } from './CaseStatusBadge'
import styles from './WorkshopCaseLayout.module.css'

interface CaseStatusBadgesProps {
  workshopCase: WorkshopCase
}

export function CaseStatusBadges({ workshopCase }: CaseStatusBadgesProps) {
  return (
    <div className={styles.badgeRow}>
      <CaseStatusBadge status={workshopCase.status} />
      <CasePriorityBadge priority={workshopCase.priority} />
      <SlaBadge status={workshopCase.slaStatus} />
    </div>
  )
}
