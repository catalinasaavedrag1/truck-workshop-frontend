import { httpClient } from '../../../shared/services/httpClient'
import type {
  FreightPricingCalculation,
  FreightPricingSettings,
  FreightQuoteCalculationInput,
  FreightRequest,
} from '../types/freight.types'

interface ApiResponse<T> {
  data: T
}

export interface FreightPricingCalculatePayload extends FreightQuoteCalculationInput {
  destinationAddress?: string
  originAddress?: string
  tollCost?: number
}

export async function getActiveFreightPricingSettings() {
  const response = await httpClient.get<ApiResponse<FreightPricingSettings>>('/freight/pricing/settings/active')

  return response.data.data
}

export async function updateActiveFreightPricingSettings(payload: Partial<FreightPricingSettings>) {
  const response = await httpClient.patch<ApiResponse<FreightPricingSettings>>('/freight/pricing/settings/active', payload)

  return response.data.data
}

export async function calculateFreightPricing(payload: FreightPricingCalculatePayload) {
  const response = await httpClient.post<ApiResponse<FreightPricingCalculation>>('/freight/pricing/calculate', payload)

  return response.data.data
}

export function buildPricingPayloadFromRequest(request: FreightRequest): FreightPricingCalculatePayload {
  return {
    cargoType: request.cargoType,
    destinationAddress: request.destinationAddress,
    estimatedKm: request.estimatedKm,
    originAddress: request.originAddress,
    requiresLoadingHelp: request.requiresLoadingHelp,
    requiresUnloadingHelp: request.requiresUnloadingHelp,
    waitingHours: request.requiresWaitingTime ? request.waitingHours || 0 : 0,
  }
}
