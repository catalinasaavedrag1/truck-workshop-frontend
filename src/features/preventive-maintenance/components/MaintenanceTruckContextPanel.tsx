import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Card } from '../../../shared/components/Card/Card'
import { formatDate } from '../../../shared/utils/formatDate'
import { TruckStatusBadge } from '../../fleet/components/TruckStatusBadge'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import { MaintenanceDueBadge } from './MaintenanceDueBadge'
import styles from './PreventiveMaintenance.module.css'
import type { PreventiveMaintenancePlan } from '../types/preventiveMaintenance.types'
import {
  getMaintenancePlanSnapshot,
  getTruckPreventiveSummary,
} from '../utils/preventiveMaintenanceOperations'

interface MaintenanceTruckContextPanelProps {
  activePlan?: PreventiveMaintenancePlan
  plans: PreventiveMaintenancePlan[]
  truck?: FleetTruck
}

export function MaintenanceTruckContextPanel({ activePlan, plans, truck }: MaintenanceTruckContextPanelProps) {
  if (!truck) {
    return (
      <Card className={styles.contextPanel}>
        <div className={styles.contextHeader}>
          <div>
            <h2>Camion asociado</h2>
            <p>No se encontro la unidad asociada al plan.</p>
          </div>
          <Badge tone="danger">Sin conexion</Badge>
        </div>
      </Card>
    )
  }

  const summary = getTruckPreventiveSummary(truck, plans)
  const snapshot = activePlan ? getMaintenancePlanSnapshot(activePlan, truck) : summary.nextSnapshot

  return (
    <Card className={styles.contextPanel}>
      <div className={styles.contextHeader}>
        <div>
          <h2>Camion asociado</h2>
          <p>{truck.brand} {truck.model} - {truck.bodyType}</p>
        </div>
        <span className={styles.badgeLine}>
          <TruckStatusBadge status={truck.operationalStatus} />
          {snapshot ? <MaintenanceDueBadge status={snapshot.effectiveRisk} /> : <Badge tone="neutral">Sin plan</Badge>}
        </span>
      </div>

      <div className={styles.contextGrid}>
        <div className={styles.contextRow}>
          <span>Patente</span>
          <strong>{truck.plate}</strong>
        </div>
        <div className={styles.contextRow}>
          <span>Odometro actual</span>
          <strong>{truck.currentOdometer.toLocaleString('es-CL')} km</strong>
        </div>
        <div className={styles.contextRow}>
          <span>Chofer asignado</span>
          <strong>{truck.assignedDriverName || 'Sin chofer'}</strong>
        </div>
        <div className={styles.contextRow}>
          <span>Disponibilidad estimada</span>
          <strong>{truck.estimatedAvailableAt ? formatDate(truck.estimatedAvailableAt) : 'Disponible hoy'}</strong>
        </div>
        <div className={styles.contextRow}>
          <span>Bloqueo actual</span>
          <strong>{truck.mainBlocker || 'Sin bloqueo'}</strong>
        </div>
        <div className={styles.contextRow}>
          <span>Cobertura preventiva</span>
          <strong>{summary.coverageLabel} - {summary.plans.length} planes</strong>
        </div>
      </div>

      {snapshot ? (
        <div className={[styles.heroPanel, styles[snapshot.tone]].join(' ')}>
          <div className="split-row">
            <div>
              <strong>{snapshot.decisionLabel}</strong>
              <p className={styles.helperText}>{snapshot.decisionHelper}</p>
            </div>
            <Badge tone={snapshot.tone}>{snapshot.dueLabel}</Badge>
          </div>
          <div className={styles.progressTrack} aria-label="Avance del ciclo preventivo">
            <span style={{ width: `${snapshot.progress}%` }} />
          </div>
          <p className={styles.helperText}>{snapshot.distanceLabel}</p>
        </div>
      ) : null}

      <div className={styles.quickActions}>
        <Link to={ROUTES.fleetTruckDetail(truck.id)}>Abrir ficha camion</Link>
        <Link to={ROUTES.caseNew}>Crear caso taller</Link>
      </div>
    </Card>
  )
}
