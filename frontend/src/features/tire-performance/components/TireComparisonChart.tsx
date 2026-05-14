import { Card } from '../../../shared/components/Card/Card'
import { TIRE_TYPE_LABELS } from '../constants/tirePerformance.constants'
import type { TireLifecycle, TireType } from '../types/tirePerformance.types'

interface TireComparisonChartProps {
  tires: TireLifecycle[]
}

function average(values: number[]) {
  if (values.length === 0) return 0

  return values.reduce((total, value) => total + value, 0) / values.length
}

function getStats(tires: TireLifecycle[], tireType: TireType) {
  const completed = tires.filter((tire) => tire.tireType === tireType && tire.kmUsed && tire.costPerKm)

  return {
    averageCost: average(completed.map((tire) => tire.purchaseCost)),
    averageKm: average(completed.map((tire) => tire.kmUsed || 0)),
    averageCostPerKm: average(completed.map((tire) => tire.costPerKm || 0)),
  }
}

function rankBy(tires: TireLifecycle[], field: 'supplierName' | 'brand') {
  const groups = new Map<string, number[]>()

  tires
    .filter((tire) => tire.costPerKm)
    .forEach((tire) => {
      groups.set(field === 'supplierName' ? tire.supplierName : tire.brand, [
        ...(groups.get(field === 'supplierName' ? tire.supplierName : tire.brand) || []),
        tire.costPerKm || 0,
      ])
    })

  return Array.from(groups.entries())
    .map(([label, values]) => ({ label, value: average(values) }))
    .sort((a, b) => a.value - b.value)
}

export function TireComparisonChart({ tires }: TireComparisonChartProps) {
  const newStats = getStats(tires, 'NEW')
  const retreadStats = getStats(tires, 'RETREADED')
  const maxCostPerKm = Math.max(newStats.averageCostPerKm, retreadStats.averageCostPerKm, 1)
  const saving = (newStats.averageCostPerKm - retreadStats.averageCostPerKm) * 100_000
  const supplierRanking = rankBy(tires, 'supplierName')
  const brandRanking = rankBy(tires, 'brand')

  return (
    <div className="two-column-grid">
      <Card>
        <div className="stack">
          <h2 className="section-title">Nuevo vs recauchado</h2>
          {[
            { label: TIRE_TYPE_LABELS.NEW, stats: newStats },
            { label: TIRE_TYPE_LABELS.RETREADED, stats: retreadStats },
          ].map((item) => (
            <div className="stack" key={item.label}>
              <div className="split-row">
                <strong>{item.label}</strong>
                <span className="muted-text">${item.stats.averageCostPerKm.toFixed(2)}/km</span>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${(item.stats.averageCostPerKm / maxCostPerKm) * 100}%` }} />
              </div>
              <p className="muted-text">
                compra promedio ${Math.round(item.stats.averageCost).toLocaleString('es-CL')} - km promedio{' '}
                {Math.round(item.stats.averageKm).toLocaleString('es-CL')}
              </p>
            </div>
          ))}
          <div className="surface-panel">
            <strong>Conclusion</strong>
            <p className="muted-text">
              El recauchado tiene menor rendimiento en kilometros, pero mejor costo por kilometro. Ahorro estimado:{' '}
              ${Math.round(saving).toLocaleString('es-CL')} cada 100.000 km.
            </p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="stack">
          <h2 className="section-title">Rankings de rentabilidad</h2>
          <div className="two-column-grid compact-grid">
            <div className="stack">
              <strong>Proveedor</strong>
              {supplierRanking.map((item) => (
                <div className="split-row" key={item.label}>
                  <span className="muted-text">{item.label}</span>
                  <strong>${item.value.toFixed(2)}/km</strong>
                </div>
              ))}
            </div>
            <div className="stack">
              <strong>Marca</strong>
              {brandRanking.map((item) => (
                <div className="split-row" key={item.label}>
                  <span className="muted-text">{item.label}</span>
                  <strong>${item.value.toFixed(2)}/km</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
