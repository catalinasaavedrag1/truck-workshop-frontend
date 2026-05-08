import { createRepository } from '../../shared/data/repository-factory.js'
import { AppError } from '../../shared/errors/app-error.js'
import {
  mechanicResource,
  scheduleEventResource,
  waitingQueueResource,
  workshopBayResource,
  workshopCaseResource,
} from '../../config/resources.js'

const ACTIVE_EVENT_STATUSES = new Set(['scheduled', 'in_progress', 'waiting_parts', 'blocked'])

export class ScheduleService {
  constructor() {
    this.cases = createRepository(workshopCaseResource)
    this.events = createRepository(scheduleEventResource)
    this.queue = createRepository(waitingQueueResource)
    this.bays = createRepository(workshopBayResource)
    this.mechanics = createRepository(mechanicResource)
  }

  async planCase(payload) {
    const workshopCase = await this.requiredRecord(this.cases, payload.caseId, 'Caso no encontrado')
    const bay = await this.requiredRecord(this.bays, payload.bayId, 'Estacion no encontrada')
    const mechanic = await this.requiredRecord(this.mechanics, payload.mechanicId, 'Mecanico no encontrado')
    const estimatedHours = Number(payload.estimatedHours || 0)

    if (bay.status === 'maintenance') {
      throw new AppError('La estacion seleccionada esta en mantencion', 409)
    }

    if (!Number.isFinite(estimatedHours) || estimatedHours <= 0 || estimatedHours > 12) {
      throw new AppError('La duracion debe estar entre 0.5 y 12 horas', 400)
    }

    const dateKey = normalizeDateKey(payload.date)
    const startsAt = buildDateTime(dateKey, payload.startsAt)
    const endsAt = new Date(startsAt.getTime() + estimatedHours * 60 * 60 * 1000)

    if (!Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime())) {
      throw new AppError('Fecha u hora invalida para agendar el caso', 400)
    }

    const conflicts = await this.findConflicts({
      bayId: bay.id,
      dateKey,
      endsAt,
      mechanicId: mechanic.id,
      startsAt,
    })

    if (conflicts.length > 0) {
      throw new AppError('No se puede agendar: existe choque de estacion o mecanico', 409, { conflicts })
    }

    const queueItem = payload.queueItemId
      ? await this.queue.findById(payload.queueItemId)
      : await this.findQueueItemByCase(workshopCase.id)
    const hasPartsBlock = Boolean(queueItem?.hasPartsBlock || hasBlockingParts(workshopCase.requiredParts))
    const scheduleEvent = await this.events.create({
      bayId: bay.id,
      bayName: bay.name,
      caseId: workshopCase.id,
      caseNumber: workshopCase.caseNumber,
      customerName: workshopCase.customerName || workshopCase.customer,
      date: `${dateKey}T00:00:00.000Z`,
      endsAt: endsAt.toISOString(),
      estimatedHours,
      hasPartsBlock,
      mechanicId: mechanic.id,
      mechanicName: mechanic.name,
      priority: workshopCase.priority,
      slaStatus: workshopCase.slaStatus,
      startsAt: startsAt.toISOString(),
      status: hasPartsBlock ? 'waiting_parts' : payload.status || 'scheduled',
      title: workshopCase.title,
      truckPlate: workshopCase.truckPlate,
    })
    const updatedCase = await this.cases.update(workshopCase.id, {
      currentStep: hasPartsBlock ? 'Agendado con espera de repuestos' : 'Agendado en taller',
      estimatedDeliveryAt: endsAt.toISOString(),
      mechanicId: mechanic.id,
      mechanicName: mechanic.name,
      status: nextCaseStatus(workshopCase.status),
      updatedAt: new Date().toISOString(),
    })
    const removedQueueItem = queueItem ? await this.queue.remove(queueItem.id) : null

    return {
      removedQueueItem,
      scheduleEvent,
      workshopCase: updatedCase,
    }
  }

  async requiredRecord(repository, id, message) {
    if (!id) {
      throw new AppError(message, 400)
    }

    const record = await repository.findById(id)

    if (!record) {
      throw new AppError(message, 404)
    }

    return record
  }

  async findConflicts({ bayId, dateKey, endsAt, mechanicId, startsAt }) {
    const result = await this.events.findAll({ limit: 100, order: 'asc', sort: 'startsAt' })

    return result.data
      .filter((event) => ACTIVE_EVENT_STATUSES.has(event.status))
      .filter((event) => dateKeyFromValue(event.date) === dateKey)
      .filter((event) => event.bayId === bayId || event.mechanicId === mechanicId)
      .filter((event) => overlaps(startsAt, endsAt, new Date(event.startsAt), new Date(event.endsAt)))
      .map((event) => ({
        bayId: event.bayId,
        bayName: event.bayName,
        caseNumber: event.caseNumber,
        endsAt: event.endsAt,
        id: event.id,
        mechanicId: event.mechanicId,
        mechanicName: event.mechanicName,
        startsAt: event.startsAt,
        type: event.bayId === bayId ? 'bay' : 'mechanic',
      }))
  }

  async findQueueItemByCase(caseId) {
    const result = await this.queue.findAll({ caseId, limit: 100 })

    return result.data.find((item) => item.caseId === caseId) || null
  }
}

function normalizeDateKey(value) {
  if (!value) {
    return new Date().toISOString().slice(0, 10)
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  return dateKeyFromValue(value)
}

function dateKeyFromValue(value) {
  return new Date(value).toISOString().slice(0, 10)
}

function buildDateTime(dateKey, startsAt) {
  if (String(startsAt || '').includes('T')) {
    return new Date(startsAt)
  }

  return new Date(`${dateKey}T${startsAt || '08:00'}:00`)
}

function overlaps(firstStart, firstEnd, secondStart, secondEnd) {
  return firstStart < secondEnd && secondStart < firstEnd
}

function hasBlockingParts(requiredParts = []) {
  return requiredParts.some((part) =>
    ['out_of_stock', 'purchase_required', 'po_created', 'waiting_reception'].includes(part.status),
  )
}

function nextCaseStatus(status) {
  if (['closed', 'testing', 'repairing'].includes(status)) {
    return status
  }

  return 'assigned'
}
