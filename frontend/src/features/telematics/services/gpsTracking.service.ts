import { httpClient } from '../../../shared/services/httpClient'
import type { ApiResponse } from '../../../shared/types/api.types'

export interface GpsPosition {
  plate: string
  lat: number
  lng: number
  location: string
  fixedAt: string
  speed: number
  heading: number
  engineOn: boolean
  odometerKm: number
  voltage: number
  satellites: number
  driver: string
}

export interface GpsLastPositions {
  provider: string
  client: string
  fetchedAt: string
  total: number
  positions: GpsPosition[]
}

export interface GpsHistory extends GpsLastPositions {
  plate: string
  tsStart: string
  tsEnd: string
}

export async function fetchLastPositions(signal?: AbortSignal) {
  const response = await httpClient.get<ApiResponse<GpsLastPositions>>('/gps/last-position', { signal })
  return response.data.data
}

export async function fetchPositionHistory(plate: string, signal?: AbortSignal) {
  const response = await httpClient.get<ApiResponse<GpsHistory>>('/gps/history', {
    params: { plate },
    signal,
  })
  return response.data.data
}
