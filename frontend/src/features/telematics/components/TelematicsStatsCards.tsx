import { Activity, Fuel, RadioTower, Route } from 'lucide-react'
import { getTelematicsSummary } from '../utils/telematicsOperations'
import type { TelematicsFleetItem } from '../utils/telematicsOperations'
import styles from './TelematicsModule.module.css'

interface TelematicsStatsCardsProps {
  items: TelematicsFleetItem[]
  totalFleet: number
}

export function TelematicsStatsCards({ items, totalFleet }: TelematicsStatsCardsProps) {
  const summary = getTelematicsSummary(items, totalFleet)

  return (
    <div className={styles.opsGrid}>
      <div className={styles.opsItem}>
        <RadioTower aria-hidden size={18} />
        <small>Cobertura GPS</small>
        <strong>{summary.withSignal}/{summary.totalFleet}</strong>
        <span className={styles.helper}>{summary.coveragePercent}% de la flota con telemetria</span>
      </div>
      <div className={styles.opsItem}>
        <Activity aria-hidden size={18} />
        <small>Alertas activas</small>
        <strong>{summary.alertCount}</strong>
        <span className={styles.helper}>{summary.signalLost} sin senal / {summary.delayedSignals} atrasadas</span>
      </div>
      <div className={styles.opsItem}>
        <Route aria-hidden size={18} />
        <small>En movimiento</small>
        <strong>{summary.moving}</strong>
        <span className={styles.helper}>Velocidad prom. {summary.averageSpeed} km/h</span>
      </div>
      <div className={styles.opsItem}>
        <Fuel aria-hidden size={18} />
        <small>Riesgo combustible</small>
        <strong>{summary.fuelRisks}</strong>
        <span className={styles.helper}>Unidades con carga baja o alerta</span>
      </div>
    </div>
  )
}
