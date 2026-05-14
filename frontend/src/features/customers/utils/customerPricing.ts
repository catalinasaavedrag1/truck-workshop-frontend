import { CARGO_TYPE_LABELS } from '../../freight/constants/cargoType.constants'
import { FREIGHT_PRICING } from '../../freight/constants/freightPricing.constants'
import type { CargoType } from '../../freight/types/freight.types'
import type { Customer, CustomerPriceListItem } from '../types/customer.types'

export type CustomerCreditDecisionStatus = 'attention' | 'blocked' | 'cash-only' | 'ok'
export type CustomerCreditQuoteSource = 'freight' | 'workshop'

export interface CustomerCreditQuoteReference {
  customerId?: string
  customerName?: string
  id: string
  quoteNumber?: string
  source: CustomerCreditQuoteSource
  status?: string
  total?: number
}

interface CustomerCreditProjectionOptions {
  currentQuoteId?: string
  quoteReferences?: CustomerCreditQuoteReference[]
  quoteTotal?: number
}

const creditRelevantQuoteStatuses = new Set(['DRAFT', 'SENT', 'APPROVED'])

export function getDefaultPriceListItem(cargoType: CargoType): CustomerPriceListItem {
  return {
    baseRate: FREIGHT_PRICING.baseRate,
    cargoType,
    discountPercent: 0,
    id: `price-${cargoType.toLowerCase()}`,
    kmRate: FREIGHT_PRICING.kmRate,
    label: CARGO_TYPE_LABELS[cargoType],
    minimumCharge: 0,
    notes: '',
  }
}

export function getCustomerPriceForCargo(customer: Customer | undefined, cargoType: CargoType) {
  return customer?.priceList.find((item) => item.cargoType === cargoType)
}

export function getCreditUsagePercent(customer: Customer) {
  if (!customer.creditEnabled || customer.creditLimit <= 0) {
    return 0
  }

  return Math.min(100, Math.round((customer.creditUsed / customer.creditLimit) * 100))
}

export function matchesCustomerReference(customer: Customer, reference: Pick<CustomerCreditQuoteReference, 'customerId' | 'customerName'>) {
  if (reference.customerId && reference.customerId === customer.id) {
    return true
  }

  return normalizeText(reference.customerName) === normalizeText(customer.name)
}

export function getQuoteCreditExposure(
  customer: Customer,
  references: CustomerCreditQuoteReference[] = [],
  currentQuoteId?: string,
) {
  return references
    .filter((reference) => reference.id !== currentQuoteId)
    .filter((reference) => matchesCustomerReference(customer, reference))
    .filter((reference) => creditRelevantQuoteStatuses.has(String(reference.status || '').toUpperCase()))
    .reduce((total, reference) => total + normalizeAmount(reference.total), 0)
}

export function getCustomerCreditProjection(customer: Customer, options: CustomerCreditProjectionOptions = {}) {
  const creditLimit = normalizeAmount(customer.creditLimit)
  const creditUsed = normalizeAmount(customer.creditUsed)
  const quoteTotal = normalizeAmount(options.quoteTotal)
  const quoteExposure = getQuoteCreditExposure(customer, options.quoteReferences, options.currentQuoteId)
  const projectedUsed = creditUsed + quoteExposure + quoteTotal
  const projectedUsagePercent = creditLimit > 0 ? Math.round((projectedUsed / creditLimit) * 100) : 0

  return {
    availableCredit: Math.max(0, creditLimit - projectedUsed),
    creditLimit,
    creditUsed,
    projectedUsagePercent,
    projectedUsed,
    quoteExposure,
    quoteTotal,
  }
}

export function getCustomerCreditDecision(customer: Customer, options: CustomerCreditProjectionOptions = {}) {
  const projection = getCustomerCreditProjection(customer, options)

  if (customer.status === 'suspended') {
    return {
      ...projection,
      label: 'Credito suspendido',
      message: 'Cliente suspendido. Requiere regularizacion comercial antes de aprobar nuevas cotizaciones.',
      status: 'blocked' as CustomerCreditDecisionStatus,
    }
  }

  if (!customer.creditEnabled || projection.creditLimit <= 0) {
    return {
      ...projection,
      label: 'Pago contado',
      message: 'Cliente sin linea de credito activa. Solicita pago anticipado o aprobacion manual.',
      status: 'cash-only' as CustomerCreditDecisionStatus,
    }
  }

  if (projection.projectedUsed > projection.creditLimit) {
    return {
      ...projection,
      label: 'Credito excedido',
      message: 'La cotizacion y exposicion vigente superan el cupo disponible del cliente.',
      status: 'blocked' as CustomerCreditDecisionStatus,
    }
  }

  if (projection.projectedUsagePercent >= 90 || customer.riskLevel === 'high' || customer.status === 'inactive') {
    return {
      ...projection,
      label: 'Validar credito',
      message: 'El cliente queda cerca del limite o tiene riesgo comercial. Revisa antes de enviar/aprobar.',
      status: 'attention' as CustomerCreditDecisionStatus,
    }
  }

  return {
    ...projection,
    label: 'Credito disponible',
    message: 'La linea de credito soporta esta cotizacion y las cotizaciones vigentes.',
    status: 'ok' as CustomerCreditDecisionStatus,
  }
}

export function getCustomerCommercialSignal(customer: Customer) {
  if (customer.status === 'suspended') {
    return 'Credito o condiciones suspendidas'
  }

  if (customer.creditEnabled && getCreditUsagePercent(customer) >= 90) {
    return 'Credito casi agotado'
  }

  if (customer.priceList.length > 0) {
    return `${customer.priceList.length} tarifas diferenciales`
  }

  return 'Tarifa general'
}

function normalizeAmount(value: unknown) {
  const amount = Number(value || 0)

  return Number.isFinite(amount) ? Math.max(0, amount) : 0
}

function normalizeText(value: unknown) {
  return String(value || '').trim().toLowerCase()
}
