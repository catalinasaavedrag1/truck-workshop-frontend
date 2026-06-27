import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { ScheduleEvent } from '../../schedule/types/schedule.types'
import type { WorkshopCase, WorkshopCaseStatus } from '../../workshop-cases/types/workshopCase.types'
import type { Mechanic } from '../types/mechanic.types'

const activeCaseStatuses = new Set<WorkshopCaseStatus>([
  'assigned',
  'diagnosis',
  'new',
  'repairing',
  'solution',
  'testing',
])

export interface MechanicOperationalDecision {
  helper: string
  label: string
  tone: BadgeTone
}

export interface MechanicOperationalSummary {
  activeCaseCount: number
  activeCases: WorkshopCase[]
  assignedCases: WorkshopCase[]
  blockedByParts: number
  breachedCases: number
  capacityUsedPercent: number
  criticalCases: number
  decision: MechanicOperationalDecision
  highPriorityCases: number
  loadLabel: string
  loadTone: BadgeTone
  nextEvent?: ScheduleEvent
  remainingCapacity: number
  scheduleEvents: ScheduleEvent[]
  scheduledHours: number
  slaRiskCases: number
}

export function getAssignedCases(cases: WorkshopCase[], mechanicId: string) {
  return cases.filter((workshopCase) => {
    const assignedMechanicId = workshopCase.mechanicId || workshopCase.assignedMechanicId

    return assignedMechanicId === mechanicId
  })
}

export function getMechanicScheduleEvents(events: ScheduleEvent[], mechanicId: string) {
  return events
    .filter((event) => event.mechanicId === mechanicId)
    .sort((first, second) => new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime())
}

export function getMechanicOperationalSummary(
  mechanic: Mechanic,
  cases: WorkshopCase[],
  events: ScheduleEvent[],
): MechanicOperationalSummary {
  const assignedCases = getAssignedCases(cases, mechanic.id)
  const activeCases = assignedCases.filter((workshopCase) => activeCaseStatuses.has(workshopCase.status))
  const activeCaseCount = Math.max(activeCases.length, mechanic.activeCases || 0)
  const maxCases = Math.max(1, mechanic.maxCases || 1)
  const capacityUsedPercent = Math.min(100, Math.round((activeCaseCount / maxCases) * 100))
  const remainingCapacity = Math.max(0, maxCases - activeCaseCount)
  const scheduleEvents = getMechanicScheduleEvents(events, mechanic.id)
  const scheduledHours = scheduleEvents.reduce((total, event) => total + Number(event.estimatedHours || 0), 0)
  const now = Date.now()
  const nextEvent = scheduleEvents.find((event) => new Date(event.endsAt).getTime() >= now) || scheduleEvents.at(-1)
  const slaRiskCases = activeCases.filter((workshopCase) => workshopCase.slaStatus === 'AT_RISK' || workshopCase.slaStatus === 'BREACHED').length
  const breachedCases = activeCases.filter((workshopCase) => workshopCase.slaStatus === 'BREACHED').length
  const blockedByParts = activeCases.filter((workshopCase) =>
    workshopCase.requiredParts?.some((part) => part.requiresPurchase || part.status === 'out_of_stock' || part.status === 'purchase_required'),
  ).length
  const criticalCases = activeCases.filter((workshopCase) => workshopCase.priority === 'critical').length
  const highPriorityCases = activeCases.filter((workshopCase) => workshopCase.priority === 'critical' || workshopCase.priority === 'high').length
  const loadTone: BadgeTone = capacityUsedPercent >= 100 ? 'danger' : capacityUsedPercent >= 75 ? 'warning' : 'success'
  const loadLabel = capacityUsedPercent >= 100 ? 'Saturado' : capacityUsedPercent >= 75 ? 'Alta carga' : 'Con capacidad'
  const decision = getOperationalDecision({
    activeCaseCount,
    blockedByParts,
    breachedCases,
    capacityUsedPercent,
    mechanic,
    remainingCapacity,
    slaRiskCases,
  })

  return {
    activeCaseCount,
    activeCases,
    assignedCases,
    blockedByParts,
    breachedCases,
    capacityUsedPercent,
    criticalCases,
    decision,
    highPriorityCases,
    loadLabel,
    loadTone,
    nextEvent,
    remainingCapacity,
    scheduleEvents,
    scheduledHours,
    slaRiskCases,
  }
}

function getOperationalDecision({
  activeCaseCount,
  blockedByParts,
  breachedCases,
  capacityUsedPercent,
  mechanic,
  remainingCapacity,
  slaRiskCases,
}: {
  activeCaseCount: number
  blockedByParts: number
  breachedCases: number
  capacityUsedPercent: number
  mechanic: Mechanic
  remainingCapacity: number
  slaRiskCases: number
}): MechanicOperationalDecision {
  if (mechanic.availability === 'off-shift') {
    return {
      helper: 'Fuera de turno. Mantener visible para historial, pero no asignar trabajo nuevo.',
      label: 'No asignar ahora',
      tone: 'neutral',
    }
  }

  if (remainingCapacity <= 0 || capacityUsedPercent >= 100) {
    return {
      helper: 'Ya alcanzo su capacidad. Reasigna o cierra un caso antes de sumar otro trabajo.',
      label: 'Saturado',
      tone: 'danger',
    }
  }

  if (breachedCases > 0) {
    return {
      helper: 'Tiene SLA vencido. Conviene destrabar ese caso antes de cargar nuevas ordenes.',
      label: 'Resolver SLA',
      tone: 'danger',
    }
  }

  if (blockedByParts > 0) {
    return {
      helper: 'Hay trabajos detenidos por repuestos. Coordina bodega antes de planificar mas horas.',
      label: 'Bloqueo repuestos',
      tone: 'warning',
    }
  }

  if (slaRiskCases > 0 || mechanic.availability === 'busy' || activeCaseCount > 0) {
    return {
      helper: `Puede recibir trabajo controlado. Quedan ${remainingCapacity} cupos disponibles.`,
      label: 'Usar con control',
      tone: 'warning',
    }
  }

  return {
    helper: `Disponible para tomar trabajo. Quedan ${remainingCapacity} cupos libres.`,
    label: 'Disponible',
    tone: 'success',
  }
}
