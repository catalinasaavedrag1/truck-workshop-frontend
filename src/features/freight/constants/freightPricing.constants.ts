import type {
  CargoType,
  FreightQuoteCalculationInput,
  FreightQuoteLineItem,
} from '../types/freight.types'

export const FREIGHT_PRICING = {
  baseRate: 35_000,
  kmRate: 1_200,
  waitingHourRate: 15_000,
  loadingHelpCost: 25_000,
  unloadingHelpCost: 25_000,
  taxRate: 0.19,
  cargoSurcharges: {
    BULK: 15_000,
    FRAGILE: 25_000,
    GENERAL: 0,
    HAZARDOUS: 60_000,
    OVERSIZED: 50_000,
    PALLETIZED: 10_000,
    REFRIGERATED: 40_000,
  } satisfies Record<CargoType, number>,
}

export function calculateFreightQuote(input: FreightQuoteCalculationInput) {
  const waitingHours = input.waitingHours || 0
  const waitingCost = waitingHours * FREIGHT_PRICING.waitingHourRate
  const loadingCost = input.requiresLoadingHelp ? FREIGHT_PRICING.loadingHelpCost : 0
  const unloadingCost = input.requiresUnloadingHelp ? FREIGHT_PRICING.unloadingHelpCost : 0
  const cargoTypeSurcharge = FREIGHT_PRICING.cargoSurcharges[input.cargoType]
  const distanceCost = input.estimatedKm * FREIGHT_PRICING.kmRate
  const subtotal =
    FREIGHT_PRICING.baseRate +
    distanceCost +
    cargoTypeSurcharge +
    waitingCost +
    loadingCost +
    unloadingCost
  const taxAmount = Math.round(subtotal * FREIGHT_PRICING.taxRate)
  const total = subtotal + taxAmount

  return {
    baseRate: FREIGHT_PRICING.baseRate,
    cargoTypeSurcharge,
    distanceCost,
    kmRate: FREIGHT_PRICING.kmRate,
    loadingCost,
    subtotal,
    taxAmount,
    total,
    unloadingCost,
    waitingCost,
  }
}

export function buildFreightQuoteLineItems(input: FreightQuoteCalculationInput): FreightQuoteLineItem[] {
  const calculation = calculateFreightQuote(input)
  const items: FreightQuoteLineItem[] = [
    {
      id: 'base-rate',
      label: 'Tarifa base',
      quantity: 1,
      total: calculation.baseRate,
      unitAmount: calculation.baseRate,
    },
    {
      id: 'distance',
      label: 'Kilometraje',
      quantity: input.estimatedKm,
      total: calculation.distanceCost,
      unitAmount: calculation.kmRate,
    },
  ]

  if (calculation.cargoTypeSurcharge > 0) {
    items.push({
      id: 'cargo-surcharge',
      label: 'Recargo tipo de carga',
      quantity: 1,
      total: calculation.cargoTypeSurcharge,
      unitAmount: calculation.cargoTypeSurcharge,
    })
  }

  if (calculation.waitingCost > 0) {
    items.push({
      id: 'waiting',
      label: 'Horas de espera',
      quantity: input.waitingHours || 0,
      total: calculation.waitingCost,
      unitAmount: FREIGHT_PRICING.waitingHourRate,
    })
  }

  if (calculation.loadingCost > 0) {
    items.push({
      id: 'loading',
      label: 'Ayuda de carga',
      quantity: 1,
      total: calculation.loadingCost,
      unitAmount: calculation.loadingCost,
    })
  }

  if (calculation.unloadingCost > 0) {
    items.push({
      id: 'unloading',
      label: 'Ayuda de descarga',
      quantity: 1,
      total: calculation.unloadingCost,
      unitAmount: calculation.unloadingCost,
    })
  }

  return items
}
