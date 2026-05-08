import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState'
import { CasePriorityBadge } from '../../workshop-cases/components/CasePriorityBadge'
import { CaseStatusBadge } from '../../workshop-cases/components/CaseStatusBadge'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import { SlaBadge } from '../../sla/components/SlaBadge'
import styles from './MechanicView.module.css'

interface MechanicCasesListProps {
  cases: WorkshopCase[]
  isLoading?: boolean
  mechanicId: string
}

export function MechanicCasesList({ cases, isLoading = false, mechanicId }: MechanicCasesListProps) {
  const assignedCases = cases.filter((workshopCase) => {
    const assignedMechanicId = workshopCase.mechanicId || workshopCase.assignedMechanicId

    return assignedMechanicId === mechanicId
  }).sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime())

  return (
    <Card className={styles.panel}>
      <div className="stack">
        <div className={styles.sectionHeader}>
          <div>
            <h2>Casos asignados</h2>
            <p>Trabajo activo e historico asociado al mecanico.</p>
          </div>
        </div>
        {isLoading ? <LoadingState label="Cargando casos asignados" /> : null}
        {!isLoading && assignedCases.length === 0 ? (
          <EmptyState title="Sin casos asignados" description="Este mecanico no tiene casos activos o historicos asociados." />
        ) : null}
        {!isLoading
          ? assignedCases.map((workshopCase) => (
              <div className="list-row" key={workshopCase.id}>
                <div>
                  <strong>{workshopCase.code || workshopCase.caseNumber}</strong>
                  <p className="muted-text">
                    {workshopCase.title} - {workshopCase.truckPlate} - {workshopCase.customerName}
                  </p>
                </div>
                <span className={styles.badgeLine}>
                  <CasePriorityBadge priority={workshopCase.priority} />
                  <SlaBadge status={workshopCase.slaStatus} />
                  <CaseStatusBadge status={workshopCase.status} />
                </span>
                <Link to={ROUTES.caseDetail(workshopCase.id)}>Ver caso</Link>
              </div>
            ))
          : null}
      </div>
    </Card>
  )
}
