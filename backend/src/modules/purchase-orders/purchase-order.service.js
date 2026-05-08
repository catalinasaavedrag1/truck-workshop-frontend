import { purchaseOrderResource } from '../../config/resources.js'
import { createRepository } from '../../shared/data/repository-factory.js'
import { AppError } from '../../shared/errors/app-error.js'

const VALID_STATUSES = new Set([
  'DRAFT',
  'REQUESTED',
  'APPROVED',
  'ORDERED',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'CANCELLED',
])

export class PurchaseOrderService {
  constructor() {
    this.purchaseOrders = createRepository(purchaseOrderResource)
  }

  async create(payload, actorName) {
    const purchaseOrderNumber = await this.buildPurchaseOrderNumber(payload.purchaseOrderNumber)
    const normalized = normalizePurchaseOrderPayload(payload, actorName, { purchaseOrderNumber })

    return this.purchaseOrders.create({
      ...normalized,
      createdBy: payload.createdBy || actorName,
      updatedBy: payload.updatedBy || actorName,
    })
  }

  update(id, payload, actorName) {
    const normalized = normalizePurchaseOrderPayload(stripImmutableFields(payload), actorName, { partial: true })

    return this.purchaseOrders.update(id, {
      ...normalized,
      updatedBy: actorName,
    })
  }

  async remove(id, actorName) {
    await this.purchaseOrders.update(id, { deletedBy: actorName, updatedBy: actorName })

    return this.purchaseOrders.remove(id)
  }

  async buildPurchaseOrderNumber(purchaseOrderNumber) {
    if (purchaseOrderNumber) {
      return String(purchaseOrderNumber).trim().toUpperCase()
    }

    const year = new Date().getFullYear()
    const result = await this.purchaseOrders.findAll({ limit: 100, order: 'desc', sort: 'createdAt' })
    const maxForYear = result.data.reduce((max, order) => {
      const match = String(order.purchaseOrderNumber || '').match(/^OC-(\d{4})-(\d+)$/)

      if (!match || Number(match[1]) !== year) {
        return max
      }

      return Math.max(max, Number(match[2]))
    }, 0)

    return `OC-${year}-${String(maxForYear + 1).padStart(4, '0')}`
  }
}

function normalizePurchaseOrderPayload(payload, actorName, options = {}) {
  const normalized = { ...payload }

  if (!options.partial || payload.purchaseOrderNumber !== undefined || options.purchaseOrderNumber) {
    normalized.purchaseOrderNumber = options.purchaseOrderNumber || String(payload.purchaseOrderNumber || '').trim().toUpperCase()
  }

  if (!options.partial || payload.supplierName !== undefined) {
    normalized.supplierName = String(payload.supplierName || '').trim()

    if (!normalized.supplierName) {
      throw new AppError('La orden de compra requiere proveedor', 400)
    }
  }

  if (!options.partial || payload.status !== undefined) {
    normalized.status = normalizeStatus(payload.status)
  }

  if (!options.partial || payload.requestedBy !== undefined) {
    normalized.requestedBy = String(payload.requestedBy || actorName || 'Sistema').trim()
  }

  if (!options.partial || payload.relatedCaseId !== undefined) {
    normalized.relatedCaseId = payload.relatedCaseId ? String(payload.relatedCaseId).trim() : null
  }

  if (!options.partial || payload.approvedBy !== undefined || ['APPROVED', 'ORDERED'].includes(normalized.status)) {
    normalized.approvedBy = payload.approvedBy || (['APPROVED', 'ORDERED'].includes(normalized.status) ? actorName : null)
  }

  if (!options.partial || payload.expectedDeliveryDate !== undefined) {
    normalized.expectedDeliveryDate = normalizeDate(payload.expectedDeliveryDate || defaultExpectedDeliveryDate())
  }

  if (!options.partial || payload.items !== undefined) {
    normalized.items = normalizeItems(payload.items, normalized.relatedCaseId)

    if (!options.partial && normalized.items.length === 0) {
      throw new AppError('La orden de compra requiere al menos un item', 400)
    }
  }

  if (!options.partial || payload.totalEstimated !== undefined || payload.items !== undefined) {
    const itemTotal = Array.isArray(normalized.items)
      ? normalized.items.reduce((total, item) => total + item.quantity * item.estimatedUnitCost, 0)
      : undefined
    const providedTotal = Number(payload.totalEstimated || 0)

    normalized.totalEstimated = providedTotal > 0 ? providedTotal : Number(itemTotal || 0)
  }

  return normalized
}

function normalizeStatus(status) {
  const normalizedStatus = String(status || 'REQUESTED').trim().toUpperCase()

  return VALID_STATUSES.has(normalizedStatus) ? normalizedStatus : 'REQUESTED'
}

function normalizeItems(items, relatedCaseId) {
  if (!Array.isArray(items)) {
    return []
  }

  return items
    .map((item, index) => {
      const sku = String(item.sku || '').trim().toUpperCase()
      const name = String(item.name || item.itemName || '').trim()
      const quantity = Number(item.quantity || 0)
      const estimatedUnitCost = Number(item.estimatedUnitCost || item.unitCost || 0)

      return {
        estimatedUnitCost,
        name,
        partId: String(item.partId || sku || `item-${index + 1}`).trim(),
        quantity,
        requiredForCaseId: item.requiredForCaseId || relatedCaseId || undefined,
        sku,
      }
    })
    .filter((item) => item.name && item.sku && item.quantity > 0)
}

function normalizeDate(value) {
  const rawValue = String(value || '').trim()
  const date = rawValue.length === 10 ? new Date(`${rawValue}T18:00:00.000Z`) : new Date(rawValue)

  if (Number.isNaN(date.getTime())) {
    return defaultExpectedDeliveryDate()
  }

  return date.toISOString()
}

function defaultExpectedDeliveryDate() {
  const date = new Date()
  date.setDate(date.getDate() + 3)
  date.setUTCHours(18, 0, 0, 0)

  return date.toISOString()
}

function stripImmutableFields(payload) {
  const editablePayload = { ...payload }

  delete editablePayload.createdAt
  delete editablePayload.createdBy
  delete editablePayload.deletedBy
  delete editablePayload.id

  return editablePayload
}
