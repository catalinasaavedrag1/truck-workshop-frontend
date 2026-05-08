import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { BayStatusBadge } from '../../workshop-bays/components/BayStatusBadge'
import { BayTypeBadge } from '../../workshop-bays/components/BayTypeBadge'
import type { WorkshopBay } from '../../workshop-bays/types/workshopBay.types'

interface BayAvailabilityPanelProps {
  bays: WorkshopBay[]
}

export function BayAvailabilityPanel({ bays }: BayAvailabilityPanelProps) {
  return (
    <div className="stack">
      {bays.map((bay) => (
        <div className="list-row" key={bay.id}>
          <div>
            <strong>{bay.name}</strong>
            <div className="inline-actions">
              <BayTypeBadge type={bay.type} />
              <BayStatusBadge status={bay.status} />
            </div>
          </div>
          {bay.currentCaseId ? (
            <Link to={ROUTES.caseDetail(bay.currentCaseId)}>
              <Button size="sm" variant="secondary">
                {bay.currentCaseNumber}
              </Button>
            </Link>
          ) : null}
        </div>
      ))}
    </div>
  )
}
