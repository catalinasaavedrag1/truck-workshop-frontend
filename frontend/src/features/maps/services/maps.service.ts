import { httpClient } from '../../../shared/services/httpClient'
import type { ApiResponse } from '../../../shared/types/api.types'
import type { MapPlaceSuggestion, MapRouteResult, MapRouteWaypointInput } from '../types/maps.types'

export async function searchPlaces(query: string, sessionToken?: string) {
  const response = await httpClient.get<ApiResponse<MapPlaceSuggestion[]>>('/maps/places', {
    params: {
      query,
      sessionToken,
    },
  })

  return response.data.data
}

export async function calculateRoute(payload: { destination: MapRouteWaypointInput | string; origin: MapRouteWaypointInput | string }) {
  const response = await httpClient.post<ApiResponse<MapRouteResult>>('/maps/route', payload)

  return response.data.data
}
