import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { formatDate } from '../../../shared/utils/formatDate'
import type { GpsPosition } from '../services/gpsTracking.service'
import { GPS_STATE_COLOR, gpsMovementState } from '../utils/gpsState'

const SELECTED_STROKE = '#0f766e'

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"]/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] || char,
  )
}

function popupHtml(position: GpsPosition) {
  const state = gpsMovementState(position)
  const stateLabel =
    state === 'moving' ? `En movimiento · ${position.speed} km/h` : state === 'engine' ? 'Motor encendido' : 'Detenido'

  return `
    <div style="display:grid;gap:2px;min-width:170px;font-family:inherit">
      <strong style="font-size:0.92rem">${escapeHtml(position.plate)}</strong>
      <span>${escapeHtml(position.location || 'Sin referencia')}</span>
      <span style="color:${GPS_STATE_COLOR[state]};font-weight:700">${escapeHtml(stateLabel)}</span>
      ${position.driver ? `<span style="color:#64748b">${escapeHtml(position.driver)}</span>` : ''}
      <span style="color:#64748b">${escapeHtml(formatDate(position.fixedAt))}</span>
    </div>`
}

interface FleetGpsMapProps {
  positions: GpsPosition[]
  selectedPlate?: string
  onSelect?: (plate: string) => void
  height?: number
}

/**
 * Mapa real de la flota (Leaflet + OpenStreetMap, sin API key). Dibuja todos los
 * moviles como puntos coloreados por estado, clickeables y sincronizados con la
 * seleccion de la tabla. Encadra la vista a la flota y centra el movil elegido.
 */
export function FleetGpsMap({ positions, selectedPlate, onSelect, height = 380 }: FleetGpsMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map())
  const fittedKeyRef = useRef('')
  const onSelectRef = useRef(onSelect)

  // Mantiene el callback mas reciente sin recrear el mapa ni los marcadores.
  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  // Inicializa el mapa una sola vez.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return
    }

    const markers = markersRef.current

    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([-33.45, -70.66], 5)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    // El contenedor puede montarse antes de tener tamano final.
    window.setTimeout(() => map.invalidateSize(), 0)

    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
      markers.clear()
      fittedKeyRef.current = ''
    }
  }, [])

  // Redibuja los marcadores cuando cambian las posiciones.
  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) {
      return
    }

    layer.clearLayers()
    markersRef.current.clear()

    const valid = positions.filter((position) => Number.isFinite(position.lat) && Number.isFinite(position.lng))

    for (const position of valid) {
      const marker = L.circleMarker([position.lat, position.lng], {
        radius: 7,
        color: '#ffffff',
        weight: 2,
        fillColor: GPS_STATE_COLOR[gpsMovementState(position)],
        fillOpacity: 0.95,
      })
      marker.bindPopup(popupHtml(position))
      marker.on('click', () => onSelectRef.current?.(position.plate))
      marker.addTo(layer)
      markersRef.current.set(position.plate, marker)
    }

    // Encadra a la flota solo cuando cambia el conjunto de moviles (no en cada
    // seleccion), para no resetear el zoom del usuario.
    const key = valid.map((position) => position.plate).sort().join(',')
    if (valid.length > 0 && key !== fittedKeyRef.current) {
      fittedKeyRef.current = key
      const bounds = L.latLngBounds(valid.map((position) => [position.lat, position.lng] as [number, number]))
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 12 })
    }

    window.setTimeout(() => map.invalidateSize(), 0)
  }, [positions])

  // Resalta y centra el movil seleccionado.
  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    markersRef.current.forEach((marker, plate) => {
      const isSelected = plate === selectedPlate
      marker.setStyle({
        radius: isSelected ? 10 : 7,
        weight: isSelected ? 3 : 2,
        color: isSelected ? SELECTED_STROKE : '#ffffff',
      })
      if (isSelected) {
        marker.bringToFront()
      }
    })

    if (!selectedPlate) {
      return
    }

    const marker = markersRef.current.get(selectedPlate)
    if (marker) {
      map.panTo(marker.getLatLng())
      marker.openPopup()
    }
  }, [selectedPlate, positions])

  return (
    <div
      aria-label="Mapa de la flota en tiempo real. Use la tabla de abajo para ver cada movil."
      ref={containerRef}
      role="region"
      style={{
        height,
        width: '100%',
        zIndex: 0,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
      }}
    />
  )
}
