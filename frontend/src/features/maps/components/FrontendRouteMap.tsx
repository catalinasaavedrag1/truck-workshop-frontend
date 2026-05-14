import { Navigation, Timer } from 'lucide-react'
import type { MapLocation, MapRouteResult } from '../types/maps.types'
import styles from './FrontendRouteMap.module.css'

interface FrontendRouteMapProps {
  className?: string
  destinationLabel?: string
  error?: string
  isLoading?: boolean
  originLabel?: string
  route: MapRouteResult | null
}

interface ProjectedPoint {
  x: number
  y: number
}

interface Tile {
  key: string
  url: string
  x: number
  y: number
}

const VIEWBOX_WIDTH = 1000
const VIEWBOX_HEIGHT = 520
const TILE_SIZE = 256
const MAP_PADDING = 96
const TILE_SERVER = 'https://tile.openstreetmap.org'

export function FrontendRouteMap({
  className = '',
  destinationLabel,
  error = '',
  isLoading = false,
  originLabel,
  route,
}: FrontendRouteMapProps) {
  const geometry = buildMapGeometry(route)
  const classNames = [styles.map, className].filter(Boolean).join(' ')

  if (!route || !geometry) {
    return (
      <div className={classNames}>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateContent}>
            <strong>{error ? 'No se pudo dibujar la ruta' : isLoading ? 'Calculando ruta desde backend' : 'Mapa de ruta pendiente'}</strong>
            <span>
              {error ||
                (isLoading
                  ? 'Esperando coordenadas normalizadas, distancia y polyline del backend.'
                  : 'Calcula origen y destino para dibujar el mapa con la respuesta real del backend.')}
            </span>
            {originLabel || destinationLabel ? (
              <div className={styles.pendingRoute}>
                <span>{originLabel || 'Origen pendiente'}</span>
                <strong>-</strong>
                <span>{destinationLabel || 'Destino pendiente'}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      aria-label={`Mapa frontend desde ${originLabel || route.origin.formattedAddress} hasta ${destinationLabel || route.destination.formattedAddress}`}
      className={classNames}
    >
      <div aria-hidden className={styles.tileLayer}>
        {geometry.tiles.map((tile) => (
          <img
            alt=""
            className={styles.tile}
            draggable={false}
            key={tile.key}
            loading="lazy"
            src={tile.url}
            style={{ transform: `translate(${tile.x}px, ${tile.y}px)` }}
          />
        ))}
        <div className={styles.shade} />
      </div>

      <svg aria-hidden className={styles.routeLayer} preserveAspectRatio="none" viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}>
        <path className={styles.routeShadow} d={geometry.path} />
        <path className={styles.routeLine} d={geometry.path} />
        <path className={styles.routeDash} d={geometry.path} />
      </svg>

      <RouteMarker label={originLabel || route.origin.formattedAddress} point={geometry.originPoint} title="Origen" type="origin" />
      <RouteMarker
        label={destinationLabel || route.destination.formattedAddress}
        point={geometry.destinationPoint}
        title="Destino"
        type="destination"
      />

      <div className={styles.meta}>
        <span className={styles.pill}>
          <Navigation aria-hidden size={14} />
          {route.distanceText}
        </span>
        <span className={styles.pill}>
          <Timer aria-hidden size={14} />
          {route.durationText}
        </span>
        <span className={styles.pill}>{getProviderLabel(route.provider)}</span>
      </div>
    </div>
  )
}

interface RouteMarkerProps {
  label: string
  point: ProjectedPoint
  title: string
  type: 'destination' | 'origin'
}

function RouteMarker({ label, point, title, type }: RouteMarkerProps) {
  return (
    <div
      className={[styles.marker, type === 'destination' ? styles.destination : ''].filter(Boolean).join(' ')}
      style={{ left: `${point.x}%`, top: `${point.y}%` }}
    >
      <div className={styles.markerHeader}>
        <span className={styles.markerDot}>{type === 'origin' ? 'O' : 'D'}</span>
        <span>{title}</span>
      </div>
      <span className={styles.markerText}>{label}</span>
    </div>
  )
}

function buildMapGeometry(route: MapRouteResult | null) {
  if (!route) {
    return null
  }

  const decodedPolyline = decodePolyline(route.encodedPolyline || '')
  const origin = route.origin.location
  const destination = route.destination.location
  const routePoints = decodedPolyline.length > 1 ? decodedPolyline : [origin, destination].filter(isMapLocation)

  if (!origin || !destination || routePoints.length < 2) {
    return null
  }

  const bounds = getBounds([...routePoints, origin, destination])
  const zoom = chooseZoom(bounds)
  const projectedBounds = {
    max: project(bounds.max, zoom),
    min: project(bounds.min, zoom),
  }
  const center = {
    x: (projectedBounds.min.x + projectedBounds.max.x) / 2,
    y: (projectedBounds.min.y + projectedBounds.max.y) / 2,
  }
  const viewportOrigin = {
    x: center.x - VIEWBOX_WIDTH / 2,
    y: center.y - VIEWBOX_HEIGHT / 2,
  }
  const projectedRoute = routePoints.map((point) => toViewPoint(point, zoom, viewportOrigin))
  const path = buildSvgPath(projectedRoute)
  const tiles = buildTiles(zoom, viewportOrigin)

  return {
    destinationPoint: toPercentPoint(toViewPoint(destination, zoom, viewportOrigin)),
    originPoint: toPercentPoint(toViewPoint(origin, zoom, viewportOrigin)),
    path,
    tiles,
  }
}

function decodePolyline(value: string) {
  const coordinates: MapLocation[] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < value.length) {
    const latitudeDelta = decodePolylineNumber(value, index)
    index = latitudeDelta.nextIndex
    const longitudeDelta = decodePolylineNumber(value, index)
    index = longitudeDelta.nextIndex
    lat += latitudeDelta.value
    lng += longitudeDelta.value
    coordinates.push({ lat: lat / 100000, lng: lng / 100000 })
  }

  return coordinates.filter(isMapLocation)
}

function decodePolylineNumber(value: string, startIndex: number) {
  let result = 0
  let shift = 0
  let index = startIndex
  let byte = 0

  do {
    byte = value.charCodeAt(index) - 63
    index += 1
    result |= (byte & 0x1f) << shift
    shift += 5
  } while (byte >= 0x20 && index < value.length)

  return {
    nextIndex: index,
    value: result & 1 ? ~(result >> 1) : result >> 1,
  }
}

function getBounds(points: MapLocation[]) {
  const latitudes = points.map((point) => point.lat)
  const longitudes = points.map((point) => point.lng)
  const minLat = Math.min(...latitudes)
  const maxLat = Math.max(...latitudes)
  const minLng = Math.min(...longitudes)
  const maxLng = Math.max(...longitudes)
  const latPadding = Math.max((maxLat - minLat) * 0.12, 0.015)
  const lngPadding = Math.max((maxLng - minLng) * 0.12, 0.015)

  return {
    max: { lat: Math.min(85, maxLat + latPadding), lng: maxLng + lngPadding },
    min: { lat: Math.max(-85, minLat - latPadding), lng: minLng - lngPadding },
  }
}

function chooseZoom(bounds: { max: MapLocation; min: MapLocation }) {
  for (let zoom = 15; zoom >= 3; zoom -= 1) {
    const min = project(bounds.min, zoom)
    const max = project(bounds.max, zoom)
    const width = Math.abs(max.x - min.x)
    const height = Math.abs(max.y - min.y)

    if (width <= VIEWBOX_WIDTH - MAP_PADDING * 2 && height <= VIEWBOX_HEIGHT - MAP_PADDING * 2) {
      return zoom
    }
  }

  return 3
}

function project(point: MapLocation, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom
  const safeLat = Math.max(-85.05112878, Math.min(85.05112878, point.lat))
  const sinLat = Math.sin((safeLat * Math.PI) / 180)

  return {
    x: ((point.lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
  }
}

function toViewPoint(point: MapLocation, zoom: number, viewportOrigin: ProjectedPoint) {
  const projected = project(point, zoom)

  return {
    x: projected.x - viewportOrigin.x,
    y: projected.y - viewportOrigin.y,
  }
}

function toPercentPoint(point: ProjectedPoint) {
  return {
    x: clamp((point.x / VIEWBOX_WIDTH) * 100, 5, 95),
    y: clamp((point.y / VIEWBOX_HEIGHT) * 100, 12, 88),
  }
}

function buildSvgPath(points: ProjectedPoint[]) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${round(point.x)} ${round(point.y)}`).join(' ')
}

function buildTiles(zoom: number, viewportOrigin: ProjectedPoint): Tile[] {
  const tiles: Tile[] = []
  const tileCount = 2 ** zoom
  const startX = Math.floor(viewportOrigin.x / TILE_SIZE)
  const endX = Math.floor((viewportOrigin.x + VIEWBOX_WIDTH) / TILE_SIZE)
  const startY = Math.floor(viewportOrigin.y / TILE_SIZE)
  const endY = Math.floor((viewportOrigin.y + VIEWBOX_HEIGHT) / TILE_SIZE)

  for (let x = startX; x <= endX; x += 1) {
    for (let y = startY; y <= endY; y += 1) {
      if (y < 0 || y >= tileCount) {
        continue
      }

      const wrappedX = ((x % tileCount) + tileCount) % tileCount

      tiles.push({
        key: `${zoom}-${x}-${y}`,
        url: `${TILE_SERVER}/${zoom}/${wrappedX}/${y}.png`,
        x: Math.round(x * TILE_SIZE - viewportOrigin.x),
        y: Math.round(y * TILE_SIZE - viewportOrigin.y),
      })
    }
  }

  return tiles
}

function isMapLocation(value: MapLocation | undefined): value is MapLocation {
  return Boolean(value && Number.isFinite(value.lat) && Number.isFinite(value.lng))
}

function getProviderLabel(provider: MapRouteResult['provider']) {
  if (provider === 'google') {
    return 'Google Maps'
  }

  if (provider === 'osrm') {
    return 'OpenStreetMap / OSRM'
  }

  return 'Estimacion'
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function round(value: number) {
  return Math.round(value * 10) / 10
}
