import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import { maintenanceRiskLabels } from '../constants/preventiveMaintenance.constants'
import type {
  MaintenanceRiskStatus,
  PreventiveMaintenancePlan,
} from '../types/preventiveMaintenance.types'

const MS_PER_DAY = 1000 * 60 * 60 * 24

const riskWeight: Record<MaintenanceRiskStatus, number> = {
  OK: 0,
  WARNING: 1,
  CRITICAL: 2,
  OVERDUE: 3,
}

const riskTone: Record<MaintenanceRiskStatus, BadgeTone> = {
  CRITICAL: 'danger',
  OK: 'success',
  OVERDUE: 'danger',
  WARNING: 'warning',
}

export interface MaintenancePlanSnapshot {
  daysRemaining?: number
  decisionHelper: string
  decisionLabel: string
  distanceLabel: string
  dueLabel: string
  effectiveRisk: MaintenanceRiskStatus
  frequencyLabel: string
  kmRemaining?: number
  progress: number
  tone: BadgeTone
}

export interface TruckPreventiveSummary {
  coverageLabel: string
  criticalPlans: number
  nextPlan?: PreventiveMaintenancePlan
  nextSnapshot?: MaintenancePlanSnapshot
  plans: PreventiveMaintenancePlan[]
  truck: FleetTruck
  warningPlans: number
}

export function getMaintenancePlanSnapshot(
  plan: PreventiveMaintenancePlan,
  truck?: FleetTruck,
  now = new Date(),
): MaintenancePlanSnapshot {
  const daysRemaining = plan.nextDueAt
    ? Math.ceil((new Date(plan.nextDueAt).getTime() - now.getTime()) / MS_PER_DAY)
    : undefined
  const kmRemaining = plan.nextDueOdometer && truck
    ? plan.nextDueOdometer - truck.currentOdometer
    : undefined
  const effectiveRisk = getEffectiveRisk(plan, daysRemaining, kmRemaining)
  const progress = getMaintenanceProgress(plan, truck, daysRemaining, kmRemaining)
  const dueLabel = getDueLabel(daysRemaining, kmRemaining)
  const frequencyLabel = getFrequencyLabel(plan)
  const distanceLabel = getDistanceLabel(plan, truck)

  return {
    daysRemaining,
    decisionHelper: getDecisionHelper(effectiveRisk, daysRemaining, kmRemaining, truck),
    decisionLabel: getDecisionLabel(effectiveRisk, truck),
    distanceLabel,
    dueLabel,
    effectiveRisk,
    frequencyLabel,
    kmRemaining,
    progress,
    tone: riskTone[effectiveRisk],
  }
}

export function getTruckPreventiveSummary(
  truck: FleetTruck,
  plans: PreventiveMaintenancePlan[],
): TruckPreventiveSummary {
  const truckPlans = plans.filter((plan) => plan.truckId === truck.id)
  const sortedPlans = [...truckPlans].sort((first, second) => {
    const firstSnapshot = getMaintenancePlanSnapshot(first, truck)
    const secondSnapshot = getMaintenancePlanSnapshot(second, truck)
    const riskDiff = riskWeight[secondSnapshot.effectiveRisk] - riskWeight[firstSnapshot.effectiveRisk]

    if (riskDiff !== 0) {
      return riskDiff
    }

    return getComparableDue(firstSnapshot) - getComparableDue(secondSnapshot)
  })
  const nextPlan = sortedPlans[0]
  const nextSnapshot = nextPlan ? getMaintenancePlanSnapshot(nextPlan, truck) : undefined
  const warningPlans = sortedPlans.filter((plan) => {
    const snapshot = getMaintenancePlanSnapshot(plan, truck)
    return snapshot.effectiveRisk === 'WARNING'
  }).length
  const criticalPlans = sortedPlans.filter((plan) => {
    const snapshot = getMaintenancePlanSnapshot(plan, truck)
    return snapshot.effectiveRisk === 'CRITICAL' || snapshot.effectiveRisk === 'OVERDUE'
  }).length

  return {
    coverageLabel: getCoverageLabel(sortedPlans.length),
    criticalPlans,
    nextPlan,
    nextSnapshot,
    plans: sortedPlans,
    truck,
    warningPlans,
  }
}

export function getWorstMaintenanceRisk(plans: PreventiveMaintenancePlan[], truck?: FleetTruck) {
  return plans.reduce<MaintenanceRiskStatus>((currentRisk, plan) => {
    const snapshot = getMaintenancePlanSnapshot(plan, truck)

    return riskWeight[snapshot.effectiveRisk] > riskWeight[currentRisk] ? snapshot.effectiveRisk : currentRisk
  }, 'OK')
}

function getEffectiveRisk(
  plan: PreventiveMaintenancePlan,
  daysRemaining?: number,
  kmRemaining?: number,
): MaintenanceRiskStatus {
  if (daysRemaining !== undefined && daysRemaining < 0) {
    return 'OVERDUE'
  }

  if (kmRemaining !== undefined && kmRemaining <= 0) {
    return 'OVERDUE'
  }

  if (plan.riskStatus === 'OVERDUE') {
    return 'OVERDUE'
  }

  if ((daysRemaining !== undefined && daysRemaining <= 7) || (kmRemaining !== undefined && kmRemaining <= 500)) {
    return 'CRITICAL'
  }

  if (plan.riskStatus === 'CRITICAL') {
    return 'CRITICAL'
  }

  if ((daysRemaining !== undefined && daysRemaining <= 20) || (kmRemaining !== undefined && kmRemaining <= 1500)) {
    return 'WARNING'
  }

  return plan.riskStatus
}

function getMaintenanceProgress(
  plan: PreventiveMaintenancePlan,
  truck?: FleetTruck,
  daysRemaining?: number,
  kmRemaining?: number,
) {
  const kmProgress = plan.everyKm && kmRemaining !== undefined
    ? Math.round(((plan.everyKm - Math.max(0, kmRemaining)) / plan.everyKm) * 100)
    : undefined
  const dayProgress = plan.everyDays && daysRemaining !== undefined
    ? Math.round(((plan.everyDays - Math.max(0, daysRemaining)) / plan.everyDays) * 100)
    : undefined

  if (truck && kmProgress !== undefined && dayProgress !== undefined) {
    return Math.min(100, Math.max(0, Math.max(kmProgress, dayProgress)))
  }

  return Math.min(100, Math.max(0, kmProgress ?? dayProgress ?? riskWeight[plan.riskStatus] * 25))
}

function getDueLabel(daysRemaining?: number, kmRemaining?: number) {
  const parts = []

  if (daysRemaining !== undefined) {
    parts.push(daysRemaining < 0 ? `${Math.abs(daysRemaining)} dias vencido` : `${daysRemaining} dias`)
  }

  if (kmRemaining !== undefined) {
    parts.push(kmRemaining <= 0 ? `${Math.abs(kmRemaining).toLocaleString('es-CL')} km vencido` : `${kmRemaining.toLocaleString('es-CL')} km`)
  }

  return parts.length > 0 ? parts.join(' / ') : 'Sin proximo hito'
}

function getDistanceLabel(plan: PreventiveMaintenancePlan, truck?: FleetTruck) {
  if (!truck) {
    return plan.nextDueOdometer ? `${plan.nextDueOdometer.toLocaleString('es-CL')} km objetivo` : 'Sin odometro de camion'
  }

  if (!plan.nextDueOdometer) {
    return `${truck.currentOdometer.toLocaleString('es-CL')} km actuales`
  }

  return `${truck.currentOdometer.toLocaleString('es-CL')} / ${plan.nextDueOdometer.toLocaleString('es-CL')} km`
}

function getFrequencyLabel(plan: PreventiveMaintenancePlan) {
  if (plan.frequencyType === 'BOTH') {
    return `Cada ${plan.everyKm?.toLocaleString('es-CL') || '-'} km o ${plan.everyDays || '-'} dias`
  }

  if (plan.frequencyType === 'KM') {
    return `Cada ${plan.everyKm?.toLocaleString('es-CL') || '-'} km`
  }

  return `Cada ${plan.everyDays || '-'} dias`
}

function getDecisionLabel(risk: MaintenanceRiskStatus, truck?: FleetTruck) {
  if (risk === 'OVERDUE') {
    return 'Bloquear para mantencion'
  }

  if (risk === 'CRITICAL') {
    return 'Agendar antes de liberar'
  }

  if (risk === 'WARNING') {
    return 'Planificar cupo'
  }

  if (truck?.operationalStatus === 'AVAILABLE') {
    return 'Apto para operar'
  }

  return maintenanceRiskLabels[risk]
}

function getDecisionHelper(
  risk: MaintenanceRiskStatus,
  daysRemaining?: number,
  kmRemaining?: number,
  truck?: FleetTruck,
) {
  if (risk === 'OVERDUE') {
    return 'El camion no deberia salir a ruta hasta cerrar esta mantencion.'
  }

  if (risk === 'CRITICAL') {
    return 'Queda una ventana corta. Agenda taller y valida impacto en fletes.'
  }

  if (risk === 'WARNING') {
    return 'Conviene reservar cupo antes de que afecte disponibilidad.'
  }

  if (truck?.operationalStatus === 'AVAILABLE' && (daysRemaining !== undefined || kmRemaining !== undefined)) {
    return 'Mantencion al dia. Monitorear contra odometro y proxima fecha.'
  }

  return 'Sin accion inmediata de mantenimiento preventivo.'
}

function getComparableDue(snapshot: MaintenancePlanSnapshot) {
  const days = snapshot.daysRemaining ?? Number.MAX_SAFE_INTEGER
  const kmAsDays = snapshot.kmRemaining !== undefined ? snapshot.kmRemaining / 100 : Number.MAX_SAFE_INTEGER

  return Math.min(days, kmAsDays)
}

function getCoverageLabel(planCount: number) {
  if (planCount === 0) {
    return 'Sin plan'
  }

  if (planCount <= 2) {
    return 'Cobertura basica'
  }

  return 'Cobertura completa'
}
