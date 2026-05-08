import { customerResource, freightRequestResource } from '../../config/resources.js'
import { createRepository } from '../../shared/data/repository-factory.js'
import { AppError } from '../../shared/errors/app-error.js'

const customerStatuses = new Set(['active', 'inactive', 'suspended'])
const customerRiskLevels = new Set(['low', 'medium', 'high'])
const cargoTypes = new Set(['GENERAL', 'PALLETIZED', 'BULK', 'FRAGILE', 'REFRIGERATED', 'HAZARDOUS', 'OVERSIZED'])
const activeFreightStatuses = new Set(['NEW', 'QUOTING', 'QUOTE_SENT', 'APPROVED', 'ASSIGNED', 'IN_TRANSIT'])

export class CustomerService {
  constructor() {
    this.customers = createRepository(customerResource)
    this.freightRequests = createRepository(freightRequestResource)
  }

  list(query) {
    return this.customers.findAll(query)
  }

  async get(id) {
    const customer = await this.customers.findById(id)

    if (!customer) {
      throw new AppError('Cliente no encontrado', 404)
    }

    return customer
  }

  create(payload, actorName) {
    const normalizedPayload = normalizeCustomerPayload(payload)

    return this.customers.create({
      ...normalizedPayload,
      createdBy: payload.createdBy || actorName,
      updatedBy: payload.updatedBy || actorName,
    })
  }

  update(id, payload, actorName) {
    const editablePayload = stripImmutableFields(payload)

    return this.customers.update(id, {
      ...normalizeCustomerPayload(editablePayload, { partial: true }),
      updatedBy: actorName,
    })
  }

  async remove(id, actorName) {
    const customer = await this.get(id)
    const activeRequests = await this.findActiveFreightRequests(customer)

    if (activeRequests.length > 0) {
      throw new AppError('No se puede eliminar un cliente con fletes activos', 409, {
        activeRequests: activeRequests.map((request) => ({
          id: request.id,
          requestNumber: request.requestNumber,
          status: request.status,
        })),
      })
    }

    await this.customers.update(id, { deletedBy: actorName, updatedBy: actorName })

    return this.customers.remove(id)
  }

  async findActiveFreightRequests(customer) {
    const result = await this.freightRequests.findAll({ limit: 100, order: 'desc', sort: 'createdAt' })

    return result.data.filter((request) => {
      const matchesCustomer = request.customerId === customer.id || request.customerName === customer.name

      return matchesCustomer && activeFreightStatuses.has(request.status)
    })
  }
}

function normalizeCustomerPayload(payload, options = {}) {
  const normalized = { ...payload }

  if (payload.name !== undefined) {
    normalized.name = String(payload.name || '').trim()
  }

  if (!options.partial && !normalized.name) {
    throw new AppError('El nombre del cliente es obligatorio', 400)
  }

  if (payload.rut !== undefined) {
    normalized.rut = String(payload.rut || '').trim()
  }

  if (payload.contactName !== undefined) {
    normalized.contactName = String(payload.contactName || '').trim()
  }

  if (payload.phone !== undefined) {
    normalized.phone = String(payload.phone || '').trim()
  }

  if (payload.email !== undefined) {
    normalized.email = String(payload.email || '').trim()
  }

  if (payload.billingAddress !== undefined) {
    normalized.billingAddress = String(payload.billingAddress || '').trim()
  }

  if (payload.notes !== undefined) {
    normalized.notes = String(payload.notes || '').trim()
  }

  if (!options.partial || payload.preferredOrigins !== undefined) {
    normalized.preferredOrigins = normalizeList(payload.preferredOrigins)
  }

  if (!options.partial || payload.preferredDestinations !== undefined) {
    normalized.preferredDestinations = normalizeList(payload.preferredDestinations)
  }

  if (!options.partial || payload.freightTypes !== undefined) {
    normalized.freightTypes = normalizeCargoTypes(payload.freightTypes)
  }

  if (!options.partial || payload.priceList !== undefined) {
    normalized.priceList = normalizePriceList(payload.priceList, normalized.freightTypes)
  }

  if (!options.partial || payload.creditEnabled !== undefined) {
    normalized.creditEnabled = parseBoolean(payload.creditEnabled)
  }

  if (!options.partial || payload.creditLimit !== undefined) {
    normalized.creditLimit = normalizeAmount(payload.creditLimit)
  }

  if (!options.partial || payload.creditUsed !== undefined) {
    normalized.creditUsed = normalizeAmount(payload.creditUsed)
  }

  if (!options.partial || payload.paymentTermsDays !== undefined) {
    normalized.paymentTermsDays = Math.max(0, Number(payload.paymentTermsDays || 0))
  }

  if (!options.partial || payload.status !== undefined) {
    normalized.status = normalizeOption(payload.status, customerStatuses, 'active', 'Estado de cliente invalido')
  }

  if (!options.partial || payload.riskLevel !== undefined) {
    normalized.riskLevel = normalizeOption(payload.riskLevel, customerRiskLevels, 'low', 'Nivel de riesgo de cliente invalido')
  }

  return normalized
}

function normalizeCargoTypes(value) {
  const types = normalizeList(value)
    .map((item) => item.toUpperCase())
    .filter((item) => cargoTypes.has(item))

  return types.length > 0 ? [...new Set(types)] : ['GENERAL']
}

function normalizePriceList(value, freightTypes = ['GENERAL']) {
  const items = Array.isArray(value) ? value : []
  const normalizedItems = items
    .map((item, index) => {
      const cargoType = String(item.cargoType || freightTypes[index] || 'GENERAL').toUpperCase()

      if (!cargoTypes.has(cargoType)) {
        return null
      }

      return {
        baseRate: normalizeAmount(item.baseRate),
        cargoType,
        discountPercent: clamp(Number(item.discountPercent || 0), 0, 100),
        id: item.id || `price-${cargoType.toLowerCase()}`,
        kmRate: normalizeAmount(item.kmRate),
        label: item.label || cargoType,
        minimumCharge: normalizeAmount(item.minimumCharge),
        notes: item.notes || '',
      }
    })
    .filter(Boolean)

  if (normalizedItems.length > 0) {
    return normalizedItems
  }

  return freightTypes.map((cargoType) => ({
    baseRate: 35000,
    cargoType,
    discountPercent: 0,
    id: `price-${String(cargoType).toLowerCase()}`,
    kmRate: 1200,
    label: cargoType,
    minimumCharge: 0,
    notes: '',
  }))
}

function normalizeAmount(value) {
  const amount = Number(value || 0)

  return Number.isFinite(amount) ? Math.max(0, amount) : 0
}

function parseBoolean(value) {
  if (typeof value === 'boolean') {
    return value
  }

  return ['true', '1', 'yes', 'y', 'on'].includes(String(value || '').toLowerCase())
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  if (!value) {
    return []
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeOption(value, allowedValues, fallback, message) {
  const normalizedValue = String(value || fallback)

  if (!allowedValues.has(normalizedValue)) {
    throw new AppError(message, 400)
  }

  return normalizedValue
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) {
    return min
  }

  return Math.min(Math.max(value, min), max)
}

function stripImmutableFields(payload) {
  const editablePayload = { ...payload }

  delete editablePayload.createdAt
  delete editablePayload.createdBy
  delete editablePayload.deletedBy
  delete editablePayload.id

  return editablePayload
}
