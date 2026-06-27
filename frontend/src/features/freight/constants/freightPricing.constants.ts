import type {
  CargoType,
  FreightQuoteCalculationInput,
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
