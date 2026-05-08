import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { casesMock } from '../../../mocks/cases.mock'
import { Button } from '../../../shared/components/Button/Button'
import { formatDate } from '../../../shared/utils/formatDate'
import { CasePriorityBadge } from '../../workshop-cases/components/CasePriorityBadge'
import { CaseStatusBadge } from '../../workshop-cases/components/CaseStatusBadge'

interface DriverCasesHistoryProps {
  caseIds: string[]
}

export function DriverCasesHistory({ caseIds }: DriverCasesHistoryProps) {
  const cases = casesMock.filter((workshopCase) => caseIds.includes(workshopCase.id))

  if (cases.length === 0) {
    return <p className="muted-text">Este chofer no tiene casos asociados.</p>
  }

  return (
    <div className="stack">
      {cases.map((workshopCase) => (
        <div className="list-row" key={workshopCase.id}>
          <div>
            <strong>{workshopCase.caseNumber}</strong>
            <p className="muted-text">
              {workshopCase.failureDescription} · {formatDate(workshopCase.createdAt)}
            </p>
            <div className="inline-actions">
              <CaseStatusBadge status={workshopCase.status} />
              <CasePriorityBadge priority={workshopCase.priority} />
            </div>
          </div>
          <Link to={ROUTES.caseDetail(workshopCase.id)}>
            <Button size="sm" variant="secondary">
              Ver caso
            </Button>
          </Link>
        </div>
      ))}
    </div>
  )
}
