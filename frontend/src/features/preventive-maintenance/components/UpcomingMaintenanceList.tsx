import { Card } from '../../../shared/components/Card/Card'
import { formatDate } from '../../../shared/utils/formatDate'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import { maintenanceTypeLabels } from '../constants/preventiveMaintenance.constants'
import type { PreventiveMaintenancePlan } from '../types/preventiveMaintenance.types'
import { MaintenanceDueBadge } from './MaintenanceDueBadge'

interface UpcomingMaintenanceListProps {
  plans: PreventiveMaintenancePlan[]
}

export function UpcomingMaintenanceList({ plans }: UpcomingMaintenanceListProps) {
  return (
    <Card>
      <h2 className="section-title">Proximas mantenciones</h2>
      <div className="stack">
        {plans.map((plan) => {
          const truck = fleetTrucksMock.find((item) => item.id === plan.truckId)

          return (
            <div className="list-row" key={plan.id}>
              <div>
                <strong>{truck?.plate || plan.truckId}</strong>
                <p className="muted-text">
                  {maintenanceTypeLabels[plan.maintenanceType]} -{' '}
                  {plan.nextDueAt ? formatDate(plan.nextDueAt) : `${plan.nextDueOdometer?.toLocaleString('es-CL')} km`}
                </p>
              </div>
              <MaintenanceDueBadge status={plan.riskStatus} />
            </div>
          )
        })}
      </div>
    </Card>
  )
}
