import { Card } from '../../../shared/components/Card/Card'
import type { TireLifecycle, TireType } from '../types/tirePerformance.types'

interface TireDecisionPanelProps {
  tires: TireLifecycle[]
}

function average(values: number[]) {
  if (values.length === 0) return undefined

  return values.reduce((total, value) => total + value, 0) / values.length
}

function averageCostPerKm(tires: TireLifecycle[], tireType: TireType) {
  return average(
    tires
      .filter((tire) => tire.tireType === tireType && tire.costPerKm)
      .map((tire) => tire.costPerKm || 0),
  )
}

export function TireDecisionPanel({ tires }: TireDecisionPanelProps) {
  const newCost = averageCostPerKm(tires, 'NEW')
  const retreadCost = averageCostPerKm(tires, 'RETREADED')
  const installed = tires.filter((tire) => tire.status === 'INSTALLED').length
  const stock = tires.filter((tire) => tire.status === 'IN_STOCK' || tire.status === 'PURCHASED').length
  const risk = tires.filter((tire) => tire.costPerKm && tire.costPerKm > 2.8).length
  const saving = newCost !== undefined && retreadCost !== undefined ? (newCost - retreadCost) * 100_000 : undefined

  return (
    <Card>
      <div className="stack">
        <div className="section-heading-row">
          <h2 className="section-title">Lectura rapida</h2>
          <span className="muted-text">decision costo/km</span>
        </div>
        <div className="decision-grid">
          <div>
            <span className="muted-text">Conclusion</span>
            <p>
              {newCost !== undefined && retreadCost !== undefined && retreadCost < newCost
                ? 'El recauchado esta entregando menor costo por kilometro en los datos actuales.'
                : 'El neumatico nuevo esta competitivo o faltan datos para cerrar la decision.'}
            </p>
          </div>
          <div>
            <span className="muted-text">Ahorro estimado</span>
            <strong>{saving ? `$${Math.round(saving).toLocaleString('es-CL')}` : 'Sin datos'}</strong>
            <small className="muted-text">por cada 100.000 km</small>
          </div>
          <div>
            <span className="muted-text">Operacion</span>
            <strong>{installed} instalados</strong>
            <small className="muted-text">{stock} en stock</small>
          </div>
          <div>
            <span className="muted-text">Atencion</span>
            <strong>{risk}</strong>
            <small className="muted-text">con costo/km alto</small>
          </div>
        </div>
      </div>
    </Card>
  )
}
