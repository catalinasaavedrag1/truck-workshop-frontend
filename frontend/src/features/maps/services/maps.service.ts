import { env } from '../../../config/env'
import { httpClient } from '../../../shared/services/httpClient'
import type { MapAddressDetails, MapPlaceSuggestion, MapRouteResult, MapRouteWaypointInput } from '../types/maps.types'

interface ApiResponse<T> {
  data: T
}

export async function searchPlaces(query: string, sessionToken?: string) {
  const response = await httpClient.get<ApiResponse<MapPlaceSuggestion[]>>('/maps/places', {
    params: {
      query,
      sessionToken,
    },
  })

  return response.data.data
}

export async function getPlaceDetails(placeId: string) {
  const response = await httpClient.get<ApiResponse<MapAddressDetails>>(`/maps/places/${encodeURIComponent(placeId)}`)

  return response.data.data
}

export async function calculateRoute(payload: { destination: MapRouteWaypointInput | string; origin: MapRouteWaypointInput | string }) {
  const response = await httpClient.post<ApiResponse<MapRouteResult>>('/maps/route', payload)

  return response.data.data
}

export function getMapAssetUrl(path?: string) {
  if (!path) {
    return ''
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return `${env.apiBaseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}
