import { TireCostPerKmCard } from './TireCostPerKmCard'
import type { TireLifecycle, TireType } from '../types/tirePerformance.types'

interface TirePerformanceSummaryCardsProps {
  tires: TireLifecycle[]
}

function formatCostPerKm(value: number | undefined) {
  return value === undefined ? 'En uso' : `$${value.toFixed(2)}/km`
}

function average(values: number[]) {
  if (values.length === 0) return undefined

  return values.reduce((total, value) => total + value, 0) / values.length
}

function getCompletedTires(tires: TireLifecycle[]) {
  return tires.filter((tire) => tire.kmUsed && tire.kmUsed > 0 && tire.costPerKm)
}

function averageByType(tires: TireLifecycle[], tireType: TireType, key: 'kmUsed' | 'costPerKm') {
  return average(
    getCompletedTires(tires)
      .filter((tire) => tire.tireType === tireType)
      .map((tire) => tire[key])
      .filter((value): value is number => value !== undefined),
  )
}

function getBestByField(tires: TireLifecycle[], groupKey: 'supplierName' | 'brand') {
  const completed = getCompletedTires(tires)
  const groups = new Map<string, number[]>()

  completed.forEach((tire) => {
    groups.set(tire[groupKey], [...(groups.get(tire[groupKey]) || []), tire.costPerKm || 0])
  })

  return Array.from(groups.entries())
    .map(([label, values]) => ({ label, value: average(values) || 0 }))
    .sort((a, b) => a.value - b.value)[0]
}

export function TirePerformanceSummaryCards({ tires }: TirePerformanceSummaryCardsProps) {
  const completed = getCompletedTires(tires)
  const sortedByCost = [...completed].sort((a, b) => (a.costPerKm || 0) - (b.costPerKm || 0))
  const best = sortedByCost[0]
  const worst = sortedByCost.at(-1)
  const avgNewKm = averageByType(tires, 'NEW', 'kmUsed')
  const avgRetreadKm = averageByType(tires, 'RETREADED', 'kmUsed')
  const avgNewCost = averageByType(tires, 'NEW', 'costPerKm')
  const avgRetreadCost = averageByType(tires, 'RETREADED', 'costPerKm')
  const estimatedSaving =
    avgNewCost !== undefined && avgRetreadCost !== undefined ? (avgNewCost - avgRetreadCost) * 100_000 : undefined
  const bestSupplier = getBestByField(tires, 'supplierName')
  const bestBrand = getBestByField(tires, 'brand')
  const installed = tires.filter((tire) => tire.status === 'INSTALLED').length

  return (
    <div className="metric-grid">
      <TireCostPerKmCard
        helper={best ? `${best.skuCode} - ${best.supplierName}` : 'Sin datos'}
        label="Mejor costo/km"
        value={formatCostPerKm(best?.costPerKm)}
      />
      <TireCostPerKmCard
        helper={worst ? `${worst.skuCode} - ${worst.supplierName}` : 'Sin datos'}
        label="Peor costo/km"
        value={formatCostPerKm(worst?.costPerKm)}
      />
      <TireCostPerKmCard
        helper="promedio nuevo"
        label="Km promedio nuevo"
        value={avgNewKm ? `${Math.round(avgNewKm).toLocaleString('es-CL')} km` : 'Sin datos'}
      />
      <TireCostPerKmCard
        helper="promedio recauchado"
        label="Km promedio recauchado"
        value={avgRetreadKm ? `${Math.round(avgRetreadKm).toLocaleString('es-CL')} km` : 'Sin datos'}
      />
      <TireCostPerKmCard helper="neumatico nuevo" label="Costo/km nuevo" value={formatCostPerKm(avgNewCost)} />
      <TireCostPerKmCard helper="neumatico recauchado" label="Costo/km recauchado" value={formatCostPerKm(avgRetreadCost)} />
      <TireCostPerKmCard
        helper="por cada 100.000 km"
        label="Ahorro estimado recauchado"
        value={estimatedSaving ? `$${Math.round(estimatedSaving).toLocaleString('es-CL')}` : 'Sin datos'}
      />
      <TireCostPerKmCard
        helper={bestSupplier ? formatCostPerKm(bestSupplier.value) : 'Sin datos'}
        label="Proveedor mas rentable"
        value={bestSupplier?.label || 'Sin datos'}
      />
      <TireCostPerKmCard
        helper={bestBrand ? formatCostPerKm(bestBrand.value) : 'Sin datos'}
        label="Marca mas rentable"
        value={bestBrand?.label || 'Sin datos'}
      />
      <TireCostPerKmCard
        helper="actualmente en camiones"
        label="Neumaticos instalados"
        value={String(installed)}
      />
    </div>
  )
}
