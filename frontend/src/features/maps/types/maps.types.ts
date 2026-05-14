export interface MapPlaceSuggestion {
  description: string
  mainText: string
  placeId: string
  provider?: 'google' | 'nominatim'
  secondaryText?: string
}

export interface MapLocation {
  lat: number
  lng: number
}

export interface MapAddressDetails {
  city?: string
  country?: string
  formattedAddress: string
  location?: MapLocation
  name?: string
  placeId?: string
  postalCode?: string
  region?: string
}

export interface MapRouteWaypointInput {
  address?: string
  formattedAddress?: string
  placeId?: string
}

export interface MapRouteResult {
  bounds?: {
    high?: MapLocation
    low?: MapLocation
  }
  destination: MapAddressDetails
  distanceKm: number
  distanceMeters: number
  distanceText: string
  durationSeconds: number
  durationText: string
  encodedPolyline?: string
  origin: MapAddressDetails
  provider: 'google' | 'osrm' | 'fallback'
  staticMapUrl?: string
  tolls?: MapRouteTolls
}

export interface MapRouteTollPrice {
  amount: number
  currencyCode: string
  nanos?: number
  units?: number
}

export interface MapRouteTolls {
  currencyCode: string
  estimatedPrices: MapRouteTollPrice[]
  hasTolls: boolean
  priceKnown: boolean
  source: 'google-routes' | 'not-available'
  totalAmount: number
}
