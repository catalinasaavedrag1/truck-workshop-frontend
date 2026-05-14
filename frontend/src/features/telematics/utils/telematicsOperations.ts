import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import type { TelemetryAlertType, TruckTelemetry } from '../types/telematics.types'

export type SignalState = 'live' | 'delayed' | 'lost'
export type MovementState = 'moving' | 'stopped' | 'idle' | 'off' | 'lost'
export type GpsDecisionLevel = 'critical' | 'warning' | 'ok'

export interface TelematicsFleetItem {
  telemetry: TruckTelemetry
  truck?: FleetTruck
  plate: string
  driverName: string
  signalAgeMinutes: number
  signalState: SignalState
  movementState: MovementState
  movementLabel: string
  decisionLevel: GpsDecisionLevel
  decisionLabel: string
  nextAction: string
  priorityScore: number
  fuelRisk: boolean
}

export interface TelematicsSummary {
  alertCount: number
  averageSpeed: number
  coveragePercent: number
  delayedSignals: number
  fuelRisks: number
  moving: number
  signalLost: number
  totalFleet: number
  withSignal: number
}

export const signalStateLabels: Record<SignalState, string> = {
  delayed: 'Senal atrasada',
  live: 'Senal al dia',
  lost: 'Sin senal',
}

export const signalStateTones: Record<SignalState, BadgeTone> = {
  delayed: 'warning',
  live: 'success',
  lost: 'danger',
}

export const decisionTones: Record<GpsDecisionLevel, BadgeTone> = {
  critical: 'danger',
  ok: 'success',
  warning: 'warning',
}

export function buildTelematicsFleetItems(telemetry: TruckTelemetry[], trucks: FleetTruck[]) {
  const latestSignalTime = telemetry.reduce((latest, item) => {
    const signalTime = new Date(item.lastSignalAt).getTime()

    return Number.isFinite(signalTime) ? Math.max(latest, signalTime) : latest
  }, 0)

  return telemetry
    .map((item) => {
      const truck = trucks.find((candidate) => candidate.id === item.truckId)
      const signalAgeMinutes = getSignalAgeMinutes(item.lastSignalAt, latestSignalTime)
      const signalState = getSignalState(item, signalAgeMinutes)
      const movementState = getMovementState(item, signalState)
      const fuelRisk = item.fuelLevel <= 25 || item.alerts.includes('LOW_FUEL')
      const decision = getDecision(item.alerts, signalState, fuelRisk)

      return {
        decisionLabel: decision.label,
        decisionLevel: decision.level,
        driverName: truck?.assignedDriverName || 'Sin chofer asignado',
        fuelRisk,
        movementLabel: getMovementLabel(movementState),
        movementState,
        nextAction: getNextAction(item.alerts, signalState, fuelRisk, truck),
        plate: truck?.plate || item.truckId,
        priorityScore: getPriorityScore(item.alerts, signalState, fuelRisk),
        signalAgeMinutes,
        signalState,
        telemetry: item,
        truck,
      } satisfies TelematicsFleetItem
    })
    .sort((first, second) => second.priorityScore - first.priorityScore || first.plate.localeCompare(second.plate, 'es-CL'))
}

export function getTelematicsSummary(items: TelematicsFleetItem[], totalFleet: number): TelematicsSummary {
  const alertCount = items.reduce((total, item) => total + item.telemetry.alerts.length, 0)
  const movingItems = items.filter((item) => item.movementState === 'moving')
  const withSignal = items.length

  return {
    alertCount,
    averageSpeed: Math.round(items.reduce((total, item) => total + item.telemetry.speed, 0) / Math.max(items.length, 1)),
    coveragePercent: Math.round((withSignal / Math.max(totalFleet, 1)) * 100),
    delayedSignals: items.filter((item) => item.signalState === 'delayed').length,
    fuelRisks: items.filter((item) => item.fuelRisk).length,
    moving: movingItems.length,
    signalLost: items.filter((item) => item.signalState === 'lost').length,
    totalFleet,
    withSignal,
  }
}

function getSignalAgeMinutes(lastSignalAt: string, latestSignalTime: number) {
  const signalTime = new Date(lastSignalAt).getTime()

  if (!Number.isFinite(signalTime) || latestSignalTime <= 0) {
    return 999
  }

  return Math.max(0, Math.round((latestSignalTime - signalTime) / 60000))
}

function getSignalState(item: TruckTelemetry, signalAgeMinutes: number): SignalState {
  if (item.alerts.includes('SIGNAL_LOST') || signalAgeMinutes >= 90) {
    return 'lost'
  }

  if (signalAgeMinutes >= 20) {
    return 'delayed'
  }

  return 'live'
}

function getMovementState(item: TruckTelemetry, signalState: SignalState): MovementState {
  if (signalState === 'lost') {
    return 'lost'
  }

  if (item.speed > 5) {
    return 'moving'
  }

  if (item.engineStatus === 'IDLE' || item.idleMinutes >= 20) {
    return 'idle'
  }

  if (item.engineStatus === 'OFF') {
    return 'off'
  }

  return 'stopped'
}

function getMovementLabel(state: MovementState) {
  const labels: Record<MovementState, string> = {
    idle: 'Ralent detenido',
    lost: 'Ubicacion no confiable',
    moving: 'En movimiento',
    off: 'Motor apagado',
    stopped: 'Detenido',
  }

  return labels[state]
}

function getDecision(alerts: TelemetryAlertType[], signalState: SignalState, fuelRisk: boolean) {
  if (signalState === 'lost' || alerts.includes('SPEEDING') || alerts.includes('ROUTE_DEVIATION')) {
    return { label: 'Intervenir ahora', level: 'critical' as const }
  }

  if (fuelRisk || alerts.includes('LONG_STOP') || signalState === 'delayed') {
    return { label: 'Monitorear', level: 'warning' as const }
  }

  return { label: 'Operativo', level: 'ok' as const }
}

function getNextAction(alerts: TelemetryAlertType[], signalState: SignalState, fuelRisk: boolean, truck?: FleetTruck) {
  if (signalState === 'lost') {
    return 'Contactar chofer y validar GPS'
  }

  if (alerts.includes('SPEEDING')) {
    return 'Llamar y bajar velocidad'
  }

  if (alerts.includes('ROUTE_DEVIATION')) {
    return 'Validar ruta con despacho'
  }

  if (fuelRisk) {
    return 'Planificar carga de combustible'
  }

  if (alerts.includes('LONG_STOP')) {
    return 'Confirmar detencion en ruta'
  }

  if (truck?.operationalStatus === 'AVAILABLE') {
    return 'Disponible para despacho'
  }

  return 'Seguir monitoreo'
}

function getPriorityScore(alerts: TelemetryAlertType[], signalState: SignalState, fuelRisk: boolean) {
  let score = 0

  if (signalState === 'lost') score += 90
  if (alerts.includes('SPEEDING')) score += 80
  if (alerts.includes('ROUTE_DEVIATION')) score += 70
  if (fuelRisk) score += 45
  if (alerts.includes('LONG_STOP')) score += 35

  return score + alerts.length * 5
}
