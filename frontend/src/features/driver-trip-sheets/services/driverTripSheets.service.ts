import { httpClient } from '../../../shared/services/httpClient'
import { getActorHeaders, getCurrentActorName as resolveCurrentActorName } from '../../../shared/services/sessionUser'
import type { ApiResponse } from '../../../shared/types/api.types'
import type { DriverTripExpenseItem, DriverTripSheet, DriverTripSheetPayload } from '../types/driverTripSheet.types'

const RESOURCE_PATH = '/driver-trip-sheets'

export interface DriverTripSheetDraft
  extends Omit<
    DriverTripSheetPayload,
    | 'costPerKm'
    | 'expenseItems'
    | 'grossMargin'
    | 'netMargin'
    | 'performanceScore'
    | 'revenuePerKm'
    | 'totalExpenses'
  > {
  expenseItems?: DriverTripExpenseItem[]
}

export async function createDriverTripSheet(payload: DriverTripSheetDraft) {
  const response = await httpClient.post<ApiResponse<DriverTripSheet>>(RESOURCE_PATH, calculateDriverTripSheet(payload), {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export async function updateDriverTripSheet(sheetId: string, payload: DriverTripSheetDraft) {
  const response = await httpClient.patch<ApiResponse<DriverTripSheet>>(
    `${RESOURCE_PATH}/${sheetId}`,
    calculateDriverTripSheet(payload),
    {
      headers: getActorHeaders(),
    },
  )

  return response.data.data
}

export async function deleteDriverTripSheet(sheetId: string) {
  const response = await httpClient.delete<ApiResponse<DriverTripSheet>>(`${RESOURCE_PATH}/${sheetId}`, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export function calculateDriverTripSheet(payload: DriverTripSheetDraft): DriverTripSheetPayload {
  const expenseItems = payload.expenseItems?.length ? payload.expenseItems : buildExpenseItems(payload)
  const totalExpenses =
    toNumber(payload.fuelCost) +
    toNumber(payload.tollCost) +
    toNumber(payload.mealCost) +
    toNumber(payload.tipCost) +
    toNumber(payload.parkingCost) +
    toNumber(payload.lodgingCost) +
    toNumber(payload.otherCost) +
    toNumber(payload.waitingCost)
  const revenue = toNumber(payload.revenue)
  const kmReal = Math.max(toNumber(payload.kmReal), 0)
  const grossMargin = revenue - totalExpenses
  const netMargin = grossMargin
  const costPerKm = kmReal > 0 ? totalExpenses / kmReal : 0
  const revenuePerKm = kmReal > 0 ? revenue / kmReal : 0
  const performanceScore = calculatePerformanceScore({
    kmPlanned: toNumber(payload.kmPlanned),
    kmReal,
    netMargin,
    revenue,
    status: payload.status,
    waitingHours: toNumber(payload.waitingHours),
  })

  return {
    ...payload,
    costPerKm: round(costPerKm),
    expenseItems,
    grossMargin: round(grossMargin),
    netMargin: round(netMargin),
    performanceScore,
    revenuePerKm: round(revenuePerKm),
    totalExpenses: round(totalExpenses),
  }
}

export function getCurrentActorName() {
  return resolveCurrentActorName()
}

function buildExpenseItems(payload: DriverTripSheetDraft): DriverTripExpenseItem[] {
  const entries: Array<[DriverTripExpenseItem['category'], string, number]> = [
    ['FUEL', 'Combustible', toNumber(payload.fuelCost)],
    ['TOLL', 'Peajes', toNumber(payload.tollCost)],
    ['MEAL', 'Comida', toNumber(payload.mealCost)],
    ['TIP', 'Propina', toNumber(payload.tipCost)],
    ['PARKING', 'Estacionamiento', toNumber(payload.parkingCost)],
    ['LODGING', 'Alojamiento', toNumber(payload.lodgingCost)],
    ['WAITING', 'Horas de espera', toNumber(payload.waitingCost)],
    ['OTHER', 'Otros gastos', toNumber(payload.otherCost)],
  ]

  return entries
    .filter(([, , amount]) => amount > 0)
    .map(([category, label, amount]) => ({
      amount,
      category,
      id: `${category.toLowerCase()}-${createClientId()}`,
      label,
    }))
}

function calculatePerformanceScore({
  kmPlanned,
  kmReal,
  netMargin,
  revenue,
  status,
  waitingHours,
}: {
  kmPlanned: number
  kmReal: number
  netMargin: number
  revenue: number
  status: DriverTripSheetDraft['status']
  waitingHours: number
}) {
  const marginPercentage = revenue > 0 ? (netMargin / revenue) * 100 : 0
  const kmDeviation = kmPlanned > 0 && kmReal > 0 ? Math.max(((kmReal - kmPlanned) / kmPlanned) * 100, 0) : 0
  let score = 100

  if (marginPercentage < 18) {
    score -= 25
  } else if (marginPercentage < 28) {
    score -= 12
  }

  if (waitingHours > 4) {
    score -= 15
  } else if (waitingHours > 2) {
    score -= 8
  }

  if (kmDeviation > 12) {
    score -= 12
  } else if (kmDeviation > 6) {
    score -= 6
  }

  if (status === 'REJECTED') {
    score -= 20
  }

  return Math.min(Math.max(Math.round(score), 0), 100)
}

function round(value: number) {
  return Math.round(value * 100) / 100
}

function createClientId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.round(Math.random() * 100000)}`
}

function toNumber(value: unknown) {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}
