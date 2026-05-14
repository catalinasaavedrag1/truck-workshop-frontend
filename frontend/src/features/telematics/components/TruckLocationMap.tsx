import { Badge } from '../../../shared/components/Badge/Badge'
import { Card } from '../../../shared/components/Card/Card'
import { signalStateLabels, signalStateTones } from '../utils/telematicsOperations'
import type { TelematicsFleetItem } from '../utils/telematicsOperations'
import styles from './TelematicsModule.module.css'

interface TruckLocationMapProps {
  items: TelematicsFleetItem[]
  onSelectTruck: (truckId: string) => void
  selectedTruckId?: string
}

export function TruckLocationMap({ items, onSelectTruck, selectedTruckId }: TruckLocationMapProps) {
  const selectedItem = items.find((item) => item.telemetry.truckId === selectedTruckId) || items[0]

  return (
    <Card className={styles.mapCard}>
      <div className={styles.panelHeader}>
        <div>
          <h2>Mapa operativo GPS</h2>
          <p>Prioriza por alerta, senal y disponibilidad real de flota.</p>
        </div>
        {selectedItem ? <Badge tone={signalStateTones[selectedItem.signalState]}>{signalStateLabels[selectedItem.signalState]}</Badge> : null}
      </div>

      <div className={styles.mapCanvas} aria-label="Mapa operativo de ubicacion GPS">
        {items.map((item) => {
          const position = getMapPosition(item, items)
          const isActive = item.telemetry.truckId === selectedItem?.telemetry.truckId

          return (
            <button
              aria-label={`Seleccionar camion ${item.plate}`}
              className={[
                styles.mapMarker,
                item.decisionLevel === 'warning' ? styles.markerWarning : '',
                item.decisionLevel === 'critical' ? styles.markerCritical : '',
                isActive ? styles.mapMarkerActive : '',
              ].filter(Boolean).join(' ')}
              key={item.telemetry.truckId}
              onClick={() => onSelectTruck(item.telemetry.truckId)}
              style={{ left: `${position.left}%`, top: `${position.top}%` }}
              type="button"
            >
              <strong>{item.plate}</strong>
              <span>{item.movementLabel} / {item.telemetry.speed} km/h</span>
              <span>{item.driverName}</span>
            </button>
          )
        })}
      </div>

      <div className={styles.mapLegend}>
        <span className={styles.legendItem}><span className={styles.legendDot} /> Operativo</span>
        <span className={styles.legendItem}><span className={[styles.legendDot, styles.legendDotWarning].join(' ')} /> Monitorear</span>
        <span className={styles.legendItem}><span className={[styles.legendDot, styles.legendDotCritical].join(' ')} /> Intervenir</span>
      </div>
    </Card>
  )
}

function getMapPosition(item: TelematicsFleetItem, items: TelematicsFleetItem[]) {
  const latitudes = items.map((candidate) => candidate.telemetry.latitude)
  const longitudes = items.map((candidate) => candidate.telemetry.longitude)
  const minLat = Math.min(...latitudes)
  const maxLat = Math.max(...latitudes)
  const minLng = Math.min(...longitudes)
  const maxLng = Math.max(...longitudes)
  const latRange = Math.max(maxLat - minLat, 0.01)
  const lngRange = Math.max(maxLng - minLng, 0.01)
  const left = 10 + ((item.telemetry.longitude - minLng) / lngRange) * 80
  const top = 12 + (1 - ((item.telemetry.latitude - minLat) / latRange)) * 76

  return {
    left: Math.min(92, Math.max(8, left)),
    top: Math.min(88, Math.max(10, top)),
  }
}
