import { createRepository } from '../../shared/data/repository-factory.js'
import { AppError } from '../../shared/errors/app-error.js'
import {
  assignmentResource,
  driverResource,
  escalationEventResource,
  fleetAvailabilityResource,
  fleetTruckResource,
  truckResource,
  truckTimelineEventResource,
  waitingQueueResource,
  workshopCaseResource,
} from '../../config/resources.js'

const SLA_TARGET_HOURS = {
  critical: 6,
  high: 24,
  low: 96,
  medium: 48,
}

const VALID_PRIORITIES = new Set(['low', 'medium', 'high', 'critical'])

export class WorkshopCaseService {
  constructor() {
    this.cases = createRepository(workshopCaseResource)
    this.escalations = createRepository(escalationEventResource)
    this.assignments = createRepository(assignmentResource)
    this.drivers = createRepository(driverResource)
    this.fleetAvailability = createRepository(fleetAvailabilityResource)
    this.fleetTrucks = createRepository(fleetTruckResource)
    this.truckTimeline = createRepository(truckTimelineEventResource)
    this.trucks = createRepository(truckResource)
    this.waitingQueue = createRepository(waitingQueueResource)
  }

  list(query) {
    return this.cases.findAll(query)
  }

  async get(id) {
    const workshopCase = await this.cases.findById(id)

    if (!workshopCase) {
      throw new AppError('Caso no encontrado', 404)
    }

    return workshopCase
  }

  async create(payload, actorName = 'Sistema') {
    const normalizedPayload = await this.normalizeCreatePayload(payload)
    const workshopCase = await this.cases.create(normalizedPayload)

    await this.syncFleetIntake(workshopCase, actorName)

    return workshopCase
  }

  update(id, payload) {
    return this.cases.update(id, payload)
  }

  remove(id) {
    return this.cases.remove(id)
  }

  async listEscalations(caseId) {
    await this.get(caseId)
    return this.escalations.findAll({ caseId, limit: 100, sort: 'createdAt', order: 'desc' })
  }

  async escalate(caseId, payload) {
    const workshopCase = await this.get(caseId)
    const escalation = await this.escalations.create({
      caseId,
      comment: payload.comment,
      createdBy: payload.createdBy || 'Sistema',
      fromLevel: workshopCase.escalationLevel,
      reason: payload.reason,
      toLevel: payload.toLevel,
    })
    const updatedCase = await this.cases.update(caseId, {
      currentStep: 'Escalar caso',
      escalationLevel: payload.toLevel,
      escalationReason: payload.reason,
    })

    return { escalation, workshopCase: updatedCase }
  }

  async assign(caseId, payload) {
    const workshopCase = await this.get(caseId)
    await this.completeOpenAssignments(caseId)
    const assignment = await this.assignments.create({
      caseCode: workshopCase.caseNumber,
      caseId,
      mechanicId: payload.mechanicId,
      mechanicName: payload.mechanicName,
      status: payload.status || 'active',
      assignedAt: payload.assignedAt || new Date().toISOString(),
    })
    const updatedCase = await this.cases.update(caseId, {
      assignedMechanicId: payload.mechanicId,
      currentStep: 'Asignar responsable',
      mechanicId: payload.mechanicId,
      mechanicName: payload.mechanicName,
      status: workshopCase.status === 'new' || workshopCase.status === 'diagnosis' ? 'assigned' : workshopCase.status,
    })

    return { assignment, workshopCase: updatedCase }
  }

  async close(caseId, payload, actorName = 'Sistema') {
    const workshopCase = await this.get(caseId)

    if (workshopCase.status === 'closed') {
      return workshopCase
    }

    const now = new Date().toISOString()
    const closedBy = String(payload.closedBy || actorName || 'Sistema').trim()
    const closureSummary = String(payload.closureSummary || '').trim()

    if (!closureSummary) {
      throw new AppError('Ingresa un resumen de cierre para dejar trazabilidad del caso', 400)
    }

    await this.completeOpenAssignments(caseId)

    const updatedCase = await this.cases.update(caseId, {
      closeReason: String(payload.closeReason || 'resolved').trim(),
      closedAt: now,
      closedBy,
      closureSummary,
      currentStep: 'Cerrar caso',
      estimatedCost: payload.estimatedCost !== undefined ? Number(payload.estimatedCost || 0) : workshopCase.estimatedCost,
      estimatedDeliveryAt: payload.estimatedDeliveryAt || workshopCase.estimatedDeliveryAt || now,
      slaStatus: workshopCase.slaStatus === 'BREACHED' ? 'BREACHED' : workshopCase.slaStatus,
      status: 'closed',
      updatedAt: now,
    })

    await this.syncFleetClosure(updatedCase, closedBy)

    return updatedCase
  }

  async normalizeCreatePayload(payload) {
    const truckId = String(payload.truckId || '').trim()
    const title = String(payload.title || payload.failureDescription || '').trim()

    if (!truckId) {
      throw new AppError('Selecciona un camion valido para crear el caso', 400)
    }

    if (!title) {
      throw new AppError('Describe el problema reportado para crear el caso', 400)
    }

    const truck = await this.findTruck(truckId)

    if (!truck) {
      throw new AppError('Camion no encontrado en flota', 404)
    }

    const driver = await this.findDriver(payload.driverId)
    const now = new Date().toISOString()
    const priority = normalizePriority(payload)
    const caseNumber = String(payload.caseNumber || payload.code || buildCaseNumber()).trim()
    const slaDueAt = payload.slaDueAt || addHours(now, SLA_TARGET_HOURS[priority])
    const truckPlate = truck.plate || payload.truckPlate || truckId
    const driverName = driver?.name || payload.driverName || truck.assignedDriverName || 'Sin chofer informado'
    const customerName = String(payload.customerName || payload.customer || 'Flota interna').trim()

    return {
      ...payload,
      caseNumber,
      code: payload.code || caseNumber,
      currentStep: payload.currentStep || 'Crear caso de taller',
      customer: payload.customer || customerName,
      customerId: payload.customerId || '',
      customerName,
      driverId: payload.driverId || truck.assignedDriverId || '',
      driverName,
      escalationLevel: payload.escalationLevel || 'LEVEL_0_NORMAL',
      estimatedCost: Number(payload.estimatedCost || 0),
      failureDescription: payload.failureDescription || title,
      immobilized: Boolean(payload.immobilized),
      odometerAtEntry: Number(payload.odometerAtEntry || truck.currentOdometer || truck.odometer || 0),
      priority,
      purchaseRequestIds: Array.isArray(payload.purchaseRequestIds) ? payload.purchaseRequestIds : [],
      reportedByName: payload.reportedByName || driverName,
      reportedByPhone: payload.reportedByPhone || driver?.phone || '',
      requiredParts: Array.isArray(payload.requiredParts) ? payload.requiredParts : [],
      safetyImpact: Boolean(payload.safetyImpact),
      slaDueAt,
      slaId: payload.slaId || `sla-${priority}`,
      slaStatus: payload.slaStatus || (priority === 'critical' ? 'AT_RISK' : 'OK'),
      status: payload.status || 'new',
      symptoms: Array.isArray(payload.symptoms) ? payload.symptoms : [],
      title,
      truckId,
      truckPlate,
      updatedAt: payload.updatedAt || now,
    }
  }

  async findTruck(truckId) {
    return (await this.fleetTrucks.findById(truckId)) || (await this.trucks.findById(truckId))
  }

  async findDriver(driverId) {
    const id = String(driverId || '').trim()

    if (!id) {
      return null
    }

    return this.drivers.findById(id)
  }

  async syncFleetIntake(workshopCase, actorName) {
    const fleetTruck = await this.fleetTrucks.findById(workshopCase.truckId)
    const legacyTruck = await this.trucks.findById(workshopCase.truckId)
    const blocked = Boolean(workshopCase.immobilized || workshopCase.safetyImpact || workshopCase.priority === 'critical')
    const operationalStatus = blocked ? 'BLOCKED' : 'IN_WORKSHOP'
    const availabilityColumn = blocked ? 'MAINTENANCE_BLOCKED' : 'IN_WORKSHOP'
    const blocker = `${workshopCase.caseNumber}: ${workshopCase.title}`

    await Promise.allSettled([
      fleetTruck
        ? this.fleetTrucks.update(workshopCase.truckId, {
            estimatedAvailableAt: workshopCase.estimatedDeliveryAt || workshopCase.slaDueAt,
            mainBlocker: blocker,
            operationalStatus,
          })
        : undefined,
      legacyTruck
        ? this.trucks.update(workshopCase.truckId, {
            lastServiceAt: workshopCase.createdAt,
            status: blocked ? 'blocked' : 'in-workshop',
          })
        : undefined,
      this.fleetAvailability.create({
        availableAt: workshopCase.estimatedDeliveryAt || workshopCase.slaDueAt,
        blockerReason: blocker,
        column: availabilityColumn,
        id: `availability-${workshopCase.id}`,
        truckId: workshopCase.truckId,
      }),
      this.truckTimeline.create({
        createdBy: actorName || workshopCase.reportedByName || 'Sistema',
        description: workshopCase.diagnosisRequested || workshopCase.failureDescription,
        eventDate: workshopCase.createdAt,
        eventType: 'BREAKDOWN',
        id: `timeline-${workshopCase.id}`,
        relatedEntityId: workshopCase.id,
        relatedEntityType: 'case',
        title: `Ingreso taller ${workshopCase.caseNumber}`,
        truckId: workshopCase.truckId,
      }),
      this.waitingQueue.create({
        caseId: workshopCase.id,
        caseNumber: workshopCase.caseNumber,
        customerName: workshopCase.customerName,
        estimatedHours: estimateHours(workshopCase.priority),
        hasPartsBlock: false,
        id: `queue-${workshopCase.id}`,
        priority: workshopCase.priority,
        reason: workshopCase.title,
        requestedAt: workshopCase.createdAt,
        slaStatus: workshopCase.slaStatus,
        truckPlate: workshopCase.truckPlate,
      }),
    ])
  }

  async syncFleetClosure(workshopCase, actorName) {
    const now = new Date().toISOString()

    await Promise.allSettled([
      this.fleetTrucks.findById(workshopCase.truckId).then((truck) =>
        truck
          ? this.fleetTrucks.update(workshopCase.truckId, {
              estimatedAvailableAt: now,
              mainBlocker: null,
              operationalStatus: 'AVAILABLE',
            })
          : undefined,
      ),
      this.trucks.findById(workshopCase.truckId).then((truck) =>
        truck
          ? this.trucks.update(workshopCase.truckId, {
              lastServiceAt: now,
              status: 'available',
            })
          : undefined,
      ),
      this.waitingQueue.remove(`queue-${workshopCase.id}`).catch(() => undefined),
      this.truckTimeline.create({
        createdBy: actorName || 'Sistema',
        description: workshopCase.closureSummary || 'Caso cerrado desde taller.',
        eventDate: now,
        eventType: 'WORKSHOP_EXIT',
        id: `timeline-close-${workshopCase.id}`,
        relatedEntityId: workshopCase.id,
        relatedEntityType: 'case',
        title: `Cierre taller ${workshopCase.caseNumber}`,
        truckId: workshopCase.truckId,
      }),
    ])
  }

  async completeOpenAssignments(caseId) {
    const result = await this.assignments.findAll({ caseId, limit: 100 })
    const openAssignments = result.data.filter((assignment) => ['active', 'paused', 'queued'].includes(assignment.status))

    await Promise.all(openAssignments.map((assignment) => this.assignments.update(assignment.id, { status: 'completed' })))
  }
}

function normalizePriority(payload) {
  if (payload.safetyImpact || payload.immobilized) {
    return 'critical'
  }

  const priority = String(payload.priority || 'medium')

  return VALID_PRIORITIES.has(priority) ? priority : 'medium'
}

function buildCaseNumber() {
  return `TW-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`
}

function addHours(value, hours) {
  const date = new Date(value)

  date.setHours(date.getHours() + hours)

  return date.toISOString()
}

function estimateHours(priority) {
  return {
    critical: 2,
    high: 4,
    low: 8,
    medium: 6,
  }[priority]
}
