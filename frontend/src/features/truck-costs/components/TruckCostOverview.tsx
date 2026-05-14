import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { TruckCostAnalytics } from '../types/truckCosts.types'
import styles from './TruckCostsModule.module.css'

interface TruckCostOverviewProps {
  analytics: TruckCostAnalytics
}

export function TruckCostOverview({ analytics }: TruckCostOverviewProps) {
  const mostExpensive = analytics.trucks[0]

  return (
    <div className={styles.overviewGrid}>
      <div className={styles.costHero}>
        <span>Costo {analytics.period.mode === 'annual' ? 'anual' : 'mensual'}</span>
        <strong>{formatCurrency(analytics.fleet.totalCost)}</strong>
        <small>{analytics.period.label} - {analytics.fleet.trucksCount} camiones medidos</small>
      </div>
      <Metric label="Equivalente mensual" value={formatCurrency(analytics.fleet.monthlyEquivalent)} helper="Promedio operativo del periodo" />
      <Metric label="Proyeccion anual" value={formatCurrency(analytics.fleet.annualProjected)} helper="Run-rate si se mantiene el ritmo" />
      <Metric
        label="Costo por km"
        value={analytics.fleet.totalKm > 0 ? formatCurrency(analytics.fleet.costPerKm) : 'Sin km'}
        helper={analytics.fleet.totalKm > 0 ? `${analytics.fleet.totalKm.toLocaleString('es-CL')} km conectados` : 'Sin kilometraje conectado'}
      />
      <Metric
        label="Camion mas costoso"
        value={mostExpensive?.plate || '-'}
        helper={mostExpensive ? `${formatCurrency(mostExpensive.totalCost)} - ${mostExpensive.topCategory?.label || 'sin categoria'}` : 'Sin datos'}
      />
    </div>
  )
}

interface MetricProps {
  helper: string
  label: string
  value: string
}

function Metric({ helper, label, value }: MetricProps) {
  return (
    <div className={styles.costMetric}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{helper}</small>
    </div>
  )
}
