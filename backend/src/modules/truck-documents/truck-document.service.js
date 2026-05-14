import {
  fleetAvailabilityResource,
  fleetTruckResource,
  truckDocumentResource,
  truckHealthScoreResource,
  truckTimelineEventResource,
} from '../../config/resources.js'
import { createRepository } from '../../shared/data/repository-factory.js'
import { AppError } from '../../shared/errors/app-error.js'
import { stripImmutableFields } from '../../shared/utils/payload-sanitizers.js'

const VALID_DOCUMENT_TYPES = new Set([
  'CIRCULATION_PERMIT',
  'TECHNICAL_INSPECTION',
  'MANDATORY_INSURANCE',
  'ADDITIONAL_INSURANCE',
  'LEASING_CONTRACT',
  'CERTIFICATE',
  'REGISTRATION',
  'PURCHASE_INVOICE',
])
const NON_EXPIRING_TYPES = new Set(['REGISTRATION', 'PURCHASE_INVOICE'])
const BLOCKING_STATUSES = new Set(['EXPIRED', 'MISSING'])
const WARNING_STATUSES = new Set(['EXPIRES_SOON_15', 'EXPIRES_SOON_30'])

export class TruckDocumentService {
  constructor() {
    this.documents = createRepository(truckDocumentResource)
    this.availability = createRepository(fleetAvailabilityResource)
    this.healthScores = createRepository(truckHealthScoreResource)
    this.timeline = createRepository(truckTimelineEventResource)
    this.trucks = createRepository(fleetTruckResource)
  }

  async create(payload, actorName) {
    const truck = await this.requireTruck(payload.truckId)
    const document = await this.documents.create({
      ...normalizeDocumentPayload(payload),
      createdBy: payload.createdBy || actorName,
      updatedBy: payload.updatedBy || actorName,
    })

    await this.syncRelatedFleetState(document.truckId, actorName, document)
    await this.createTimelineEvent(document, truck, actorName, 'Documento cargado')

    return document
  }

  async update(id, payload, actorName) {
    const current = await this.requireDocument(id)
    const truckId = payload.truckId || current.truckId
    const truck = await this.requireTruck(truckId)
    const document = await this.documents.update(id, {
      ...normalizeDocumentPayload(stripImmutableFields(payload, ['deletedBy']), { current, partial: true }),
      updatedBy: actorName,
    })

    await this.syncRelatedFleetState(current.truckId, actorName, document)

    if (current.truckId !== document.truckId) {
      await this.syncRelatedFleetState(document.truckId, actorName, document)
    }

    await this.createTimelineEvent(document, truck, actorName, 'Documento actualizado')

    return document
  }

  async remove(id, actorName) {
    const current = await this.requireDocument(id)

    await this.documents.update(id, { deletedBy: actorName, updatedBy: actorName })
    const document = await this.documents.remove(id)
    await this.syncRelatedFleetState(current.truckId, actorName, document)
    await this.createTimelineEvent(document, await this.requireTruck(current.truckId), actorName, 'Documento eliminado')

    return document
  }

  async requireDocument(id) {
    const document = await this.documents.findById(id)

    if (!document) {
      throw new AppError('Documento de camion no encontrado', 404)
    }

    return document
  }

  async requireTruck(truckId) {
    const id = String(truckId || '').trim()

    if (!id) {
      throw new AppError('El documento requiere un camion asociado', 400)
    }

    const truck = await this.trucks.findById(id)

    if (!truck) {
      throw new AppError('Camion no encontrado para documento', 404)
    }

    return truck
  }

  async syncRelatedFleetState(truckId, actorName, sourceDocument) {
    const [truck, documentsResult] = await Promise.all([
      this.trucks.findById(truckId),
      this.documents.findAll({ truckId, limit: 100, sort: 'expiresAt', order: 'asc' }),
    ])

    if (!truck) {
      return
    }

    const documents = documentsResult.data.map((document) => ({
      ...document,
      status: calculateDocumentStatus(document),
    }))
    const blockingDocuments = documents.filter((document) => BLOCKING_STATUSES.has(document.status))
    const warningDocuments = documents.filter((document) => WARNING_STATUSES.has(document.status))

    if (blockingDocuments.length > 0) {
      await this.blockTruckForDocuments(truck, blockingDocuments[0], actorName)
      await this.upsertHealthScore(truck, blockingDocuments, warningDocuments)
      return
    }

    await this.clearDocumentBlock(truck)
    await this.clearExpiredDocumentsAvailability(truck.id)
    await this.upsertHealthScore(truck, blockingDocuments, warningDocuments)

    if (sourceDocument && sourceDocument.status === 'VALID') {
      await this.createTimelineEvent(sourceDocument, truck, actorName, 'Documentacion regularizada')
    }
  }

  async blockTruckForDocuments(truck, document, actorName) {
    const blockerReason = `${documentTypeLabel(document.documentType)} ${document.status === 'MISSING' ? 'faltante' : 'vencido'}`

    await this.trucks.update(truck.id, {
      mainBlocker: blockerReason,
      notes: mergeNotes(truck.notes, 'Bloqueado por control documental.'),
      operationalStatus: 'BLOCKED',
    })

    const availabilityResult = await this.availability.findAll({
      column: 'EXPIRED_DOCUMENTS',
      limit: 100,
      truckId: truck.id,
    })
    const existing = availabilityResult.data[0]
    const payload = {
      availableAt: document.expiresAt || null,
      blockerReason,
      column: 'EXPIRED_DOCUMENTS',
      truckId: truck.id,
    }

    if (existing) {
      await this.availability.update(existing.id, payload)
    } else {
      await this.availability.create(payload)
    }

    await this.createTimelineEvent(document, truck, actorName, blockerReason)
  }

  async clearDocumentBlock(truck) {
    if (truck.operationalStatus !== 'BLOCKED' || !isDocumentBlocker(truck.mainBlocker)) {
      return
    }

    await this.trucks.update(truck.id, {
      mainBlocker: null,
      operationalStatus: 'AVAILABLE',
    })
  }

  async clearExpiredDocumentsAvailability(truckId) {
    const result = await this.availability.findAll({
      column: 'EXPIRED_DOCUMENTS',
      limit: 100,
      truckId,
    })

    for (const item of result.data) {
      await this.availability.remove(item.id)
    }
  }

  async upsertHealthScore(truck, blockingDocuments, warningDocuments) {
    const currentResult = await this.healthScores.findAll({ limit: 1, truckId: truck.id })
    const current = currentResult.data[0]
    const documentPenalty = blockingDocuments.length > 0 ? 20 : warningDocuments.length > 0 ? 8 : 0
    const documentDeductionLabels = new Set([
      'Documento vencido',
      'Documento faltante',
      'Documento por vencer',
      'Riesgo documental',
    ])
    const baseDeductions = (current?.deductions || []).filter((deduction) => !documentDeductionLabels.has(deduction.label))
    const deductions = documentPenalty > 0
      ? [
          ...baseDeductions,
          {
            label: blockingDocuments.length > 0 ? 'Documento vencido' : 'Documento por vencer',
            points: documentPenalty,
          },
        ]
      : baseDeductions
    const score = Math.max(0, 100 - deductions.reduce((total, deduction) => total + Number(deduction.points || 0), 0))
    const payload = {
      deductions,
      score,
      status: healthStatus(score),
      summary: healthSummary(score, blockingDocuments, warningDocuments),
      truckId: truck.id,
    }

    if (current) {
      return this.healthScores.update(current.id || `truck-health-score-${truck.id}`, payload)
    }

    return this.healthScores.create({
      id: `truck-health-score-${truck.id}`,
      ...payload,
    })
  }

  async createTimelineEvent(document, truck, actorName, title) {
    return this.timeline.create({
      createdBy: actorName || 'Sistema',
      description: `${documentTypeLabel(document.documentType)} ${document.documentNumber || ''} - ${documentStatusLabel(document.status)}.`,
      eventDate: new Date().toISOString(),
      eventType: 'DOCUMENT',
      relatedEntityId: document.id,
      relatedEntityType: 'document',
      title,
      truckId: truck.id,
    })
  }
}

export function normalizeDocumentPayload(payload, options = {}) {
  const normalized = { ...payload }

  if (!options.partial || payload.truckId !== undefined) {
    normalized.truckId = String(payload.truckId || options.current?.truckId || '').trim()
  }

  if (!options.partial || payload.documentType !== undefined) {
    const documentType = String(payload.documentType || options.current?.documentType || 'CERTIFICATE').trim().toUpperCase()
    normalized.documentType = VALID_DOCUMENT_TYPES.has(documentType) ? documentType : 'CERTIFICATE'
  }

  if (!options.partial || payload.documentNumber !== undefined) {
    normalized.documentNumber = String(payload.documentNumber || '').trim() || null
  }

  if (!options.partial || payload.issuedAt !== undefined) {
    normalized.issuedAt = payload.issuedAt ? normalizeDate(payload.issuedAt, 'Fecha de emision invalida') : null
  }

  if (!options.partial || payload.expiresAt !== undefined) {
    normalized.expiresAt = payload.expiresAt ? normalizeDate(payload.expiresAt, 'Fecha de vencimiento invalida') : null
  }

  if (!options.partial || payload.attachmentUrl !== undefined) {
    normalized.attachmentUrl = String(payload.attachmentUrl || '').trim() || null
  }

  if (!options.partial || payload.notes !== undefined) {
    normalized.notes = String(payload.notes || '').trim() || null
  }

  const statusInput = {
    documentType: normalized.documentType || options.current?.documentType,
    expiresAt: normalized.expiresAt !== undefined ? normalized.expiresAt : options.current?.expiresAt,
  }

  if (!options.partial || payload.status !== undefined || payload.documentType !== undefined || payload.expiresAt !== undefined) {
    normalized.status = calculateDocumentStatus(statusInput)
  }

  return normalized
}

function calculateDocumentStatus(document) {
  if (NON_EXPIRING_TYPES.has(document.documentType)) {
    return 'VALID'
  }

  if (!document.expiresAt) {
    return 'MISSING'
  }

  const daysUntilExpiration = Math.ceil((new Date(document.expiresAt).getTime() - Date.now()) / 86_400_000)

  if (Number.isNaN(daysUntilExpiration)) {
    return 'MISSING'
  }

  if (daysUntilExpiration < 0) {
    return 'EXPIRED'
  }

  if (daysUntilExpiration <= 15) {
    return 'EXPIRES_SOON_15'
  }

  if (daysUntilExpiration <= 30) {
    return 'EXPIRES_SOON_30'
  }

  return 'VALID'
}

function normalizeDate(value, errorMessage) {
  const rawValue = String(value || '').trim()
  const date = rawValue.length === 10 ? new Date(`${rawValue}T23:59:00.000Z`) : new Date(rawValue)

  if (Number.isNaN(date.getTime())) {
    throw new AppError(errorMessage, 400)
  }

  return date.toISOString()
}

function healthStatus(score) {
  if (score >= 85) {
    return 'HEALTHY'
  }

  if (score >= 70) {
    return 'WARNING'
  }

  if (score >= 45) {
    return 'RISK'
  }

  return 'CRITICAL'
}

function healthSummary(score, blockingDocuments, warningDocuments) {
  if (blockingDocuments.length > 0) {
    return 'Bloqueado para operacion hasta regularizar documentacion obligatoria.'
  }

  if (warningDocuments.length > 0) {
    return 'Operativo con renovacion documental pendiente.'
  }

  return score >= 85 ? 'Documentacion al dia y unidad apta para despacho.' : 'Unidad operativa con riesgos no documentales.'
}

function documentTypeLabel(documentType) {
  const labels = {
    ADDITIONAL_INSURANCE: 'Seguro adicional',
    CERTIFICATE: 'Certificado',
    CIRCULATION_PERMIT: 'Permiso de circulacion',
    LEASING_CONTRACT: 'Contrato leasing',
    MANDATORY_INSURANCE: 'Seguro obligatorio',
    PURCHASE_INVOICE: 'Factura de compra',
    REGISTRATION: 'Padron',
    TECHNICAL_INSPECTION: 'Revision tecnica',
  }

  return labels[documentType] || 'Documento'
}

function documentStatusLabel(status) {
  const labels = {
    EXPIRED: 'vencido',
    EXPIRES_SOON_15: 'vence en 15 dias',
    EXPIRES_SOON_30: 'vence en 30 dias',
    MISSING: 'faltante',
    VALID: 'vigente',
  }

  return labels[status] || 'sin estado'
}

function isDocumentBlocker(value) {
  return /document|revision|permiso|seguro|leasing/i.test(String(value || ''))
}

function mergeNotes(currentNotes, nextNote) {
  const notes = String(currentNotes || '').trim()

  return notes.includes(nextNote) ? notes : [notes, nextNote].filter(Boolean).join(' ')
}
