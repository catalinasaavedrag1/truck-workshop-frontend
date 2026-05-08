import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Card } from '../../../shared/components/Card/Card'
import { TruckStatusBadge } from '../../fleet/components/TruckStatusBadge'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import { maintenanceTypeLabels } from '../constants/preventiveMaintenance.constants'
import type { PreventiveMaintenancePlan } from '../types/preventiveMaintenance.types'
import {
  getMaintenancePlanSnapshot,
  getTruckPreventiveSummary,
} from '../utils/preventiveMaintenanceOperations'
import { MaintenanceDueBadge } from './MaintenanceDueBadge'
import styles from './PreventiveMaintenance.module.css'

interface MaintenanceCoverageBoardProps {
  plans: PreventiveMaintenancePlan[]
  trucks: FleetTruck[]
}

export function MaintenanceCoverageBoard({ plans, trucks }: MaintenanceCoverageBoardProps) {
  const summaries = trucks
    .map((truck) => getTruckPreventiveSummary(truck, plans))
    .sort((first, second) => {
      const riskDiff = second.criticalPlans - first.criticalPlans

      if (riskDiff !== 0) {
        return riskDiff
      }

      return first.truck.plate.localeCompare(second.truck.plate, 'es-CL')
    })

  return (
    <Card className={styles.panel}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>Cobertura por camion</h2>
          <p>Relacion directa entre unidad, odometro, estado operacional y proxima mantencion.</p>
        </div>
        <Badge tone="info">{trucks.length} unidades</Badge>
      </div>

      <div className={styles.coverageGrid}>
        {summaries.map((summary) => {
          const nextPlan = summary.nextPlan
          const snapshot = nextPlan ? getMaintenancePlanSnapshot(nextPlan, summary.truck) : undefined

          return (
            <Link className={styles.truckCard} key={summary.truck.id} to={ROUTES.fleetTruckDetail(summary.truck.id)}>
              <div className={styles.truckCardHeader}>
                <div className={styles.truckCell}>
                  <strong>{summary.truck.plate}</strong>
                  <span className={styles.truckMeta}>{summary.truck.brand} {summary.truck.model}</span>
                </div>
                <TruckStatusBadge status={summary.truck.operationalStatus} />
              </div>

              <div className={styles.truckCell}>
                <span className={styles.truckMeta}>Odometro</span>
                <strong>{summary.truck.currentOdometer.toLocaleString('es-CL')} km</strong>
              </div>

              {nextPlan && snapshot ? (
                <>
                  <div className={styles.badgeLine}>
                    <MaintenanceDueBadge status={snapshot.effectiveRisk} />
                    <Badge tone={snapshot.tone}>{snapshot.dueLabel}</Badge>
                  </div>
                  <div className={styles.truckCell}>
                    <strong>{maintenanceTypeLabels[nextPlan.maintenanceType]}</strong>
                    <span className={styles.truckMeta}>{snapshot.frequencyLabel}</span>
                  </div>
                  <div className={styles.progressTrack} aria-hidden>
                    <span style={{ width: `${snapshot.progress}%` }} />
                  </div>
                </>
              ) : (
                <div className={styles.badgeLine}>
                  <Badge tone="danger">Sin plan preventivo</Badge>
                  <span className={styles.truckMeta}>Crear cobertura minima</span>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
