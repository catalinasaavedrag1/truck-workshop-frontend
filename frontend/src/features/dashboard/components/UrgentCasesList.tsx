import { Card } from '../../../shared/components/Card/Card'
import { formatDate } from '../../../shared/utils/formatDate'
import { SlaBadge } from '../../sla/components/SlaBadge'
import { SlaTimer } from '../../sla/components/SlaTimer'
import { CasePriorityBadge } from '../../workshop-cases/components/CasePriorityBadge'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'

interface UrgentCasesListProps {
  cases: WorkshopCase[]
}

export function UrgentCasesList({ cases }: UrgentCasesListProps) {
  return (
    <Card>
      <div className="stack">
        <h2 className="section-title">Atencion prioritaria</h2>
        {cases.map((workshopCase) => (
          <div className="list-row" key={workshopCase.id}>
            <div>
              <strong>{workshopCase.caseNumber}</strong>
              <p className="muted-text">{workshopCase.failureDescription}</p>
            </div>
            <div className="stack">
              <CasePriorityBadge priority={workshopCase.priority} />
              <SlaBadge status={workshopCase.slaStatus} />
              <SlaTimer dueAt={workshopCase.slaDueAt} />
              <span className="muted-text">{formatDate(workshopCase.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
