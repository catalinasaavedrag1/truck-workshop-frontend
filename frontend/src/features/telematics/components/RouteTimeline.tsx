import { Link } from 'react-router-dom'
import { AlertTriangle, Fuel, MapPin, RadioTower, Route } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { formatDate } from '../../../shared/utils/formatDate'
import { decisionTones, signalStateLabels, signalStateTones } from '../utils/telematicsOperations'
import type { TelematicsFleetItem } from '../utils/telematicsOperations'
import { TelemetryAlertBadge } from './TelemetryAlertBadge'
import styles from './TelematicsModule.module.css'

interface RouteTimelineProps {
  items: TelematicsFleetItem[]
  selectedTruckId?: string
}

export function RouteTimeline({ items, selectedTruckId }: RouteTimelineProps) {
  const selectedItem = items.find((item) => item.telemetry.truckId === selectedTruckId) || items[0]
  const alertItems = items.filter((item) => item.priorityScore > 0).slice(0, 4)

  if (!selectedItem) {
    return (
      <Card className={styles.decisionPanel}>
        <h2 className="section-title">Sin telemetria</h2>
        <p className="muted-text">No hay unidades GPS para monitorear.</p>
      </Card>
    )
  }

  return (
    <div className={styles.actionStack}>
      <Card className={styles.decisionPanel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>{selectedItem.plate}</h2>
            <p>{selectedItem.truck?.brand} {selectedItem.truck?.model} / {selectedItem.driverName}</p>
          </div>
          <Badge tone={decisionTones[selectedItem.decisionLevel]}>{selectedItem.decisionLabel}</Badge>
        </div>

        <div className={styles.decisionHero}>
          <strong>{selectedItem.nextAction}</strong>
          <p>
            {selectedItem.movementLabel}, senal hace {selectedItem.signalAgeMinutes} min y combustible en {selectedItem.telemetry.fuelLevel}%.
          </p>
        </div>

        <div className={styles.decisionMeta}>
          <div className={styles.decisionMetric}>
            <span>Velocidad</span>
            <strong>{selectedItem.telemetry.speed} km/h</strong>
          </div>
          <div className={styles.decisionMetric}>
            <span>Combustible</span>
            <strong>{selectedItem.telemetry.fuelLevel}%</strong>
          </div>
          <div className={styles.decisionMetric}>
            <span>Senal</span>
            <strong>{signalStateLabels[selectedItem.signalState]}</strong>
          </div>
          <div className={styles.decisionMetric}>
            <span>Odometro</span>
            <strong>{selectedItem.telemetry.odometer.toLocaleString('es-CL')} km</strong>
          </div>
        </div>

        <div className={styles.badgeLine}>
          <Badge tone={signalStateTones[selectedItem.signalState]}>{signalStateLabels[selectedItem.signalState]}</Badge>
          {selectedItem.telemetry.alerts.map((alert) => <TelemetryAlertBadge alert={alert} key={alert} />)}
          {selectedItem.telemetry.alerts.length === 0 ? <Badge tone="success">Sin alertas</Badge> : null}
        </div>

        <div className={styles.tableActions}>
          <Link to={ROUTES.fleetTruckDetail(selectedItem.telemetry.truckId)}>
            <Button size="sm" variant="secondary">Ficha flota</Button>
          </Link>
          <Link to={ROUTES.fleetAvailability}>
            <Button size="sm">Disponibilidad</Button>
          </Link>
        </div>
      </Card>

      <Card className={styles.alertsPanel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Cola de intervencion</h2>
            <p>Unidades ordenadas por riesgo GPS para operar rapido.</p>
          </div>
        </div>
        <div className={styles.alertList}>
          {alertItems.length > 0 ? alertItems.map((item) => (
            <div className={styles.alertItem} key={item.telemetry.truckId}>
              <div className={styles.alertTitle}>
                <strong>{item.plate}</strong>
                <Badge tone={decisionTones[item.decisionLevel]}>{item.decisionLabel}</Badge>
              </div>
              <p>{item.nextAction}</p>
              <div className={styles.badgeLine}>
                {item.signalState === 'lost' ? <Badge tone="danger"><RadioTower size={13} /> Sin senal</Badge> : null}
                {item.fuelRisk ? <Badge tone="warning"><Fuel size={13} /> Combustible</Badge> : null}
                {item.telemetry.alerts.includes('ROUTE_DEVIATION') ? <Badge tone="warning"><Route size={13} /> Desvio</Badge> : null}
                {item.telemetry.alerts.includes('SPEEDING') ? <Badge tone="danger"><AlertTriangle size={13} /> Velocidad</Badge> : null}
              </div>
            </div>
          )) : (
            <div className={styles.alertItem}>
              <strong>Operacion estable</strong>
              <p>No hay alertas GPS activas en la flota visible.</p>
            </div>
          )}
        </div>
      </Card>

      <Card className={styles.alertsPanel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Secuencia de senales</h2>
            <p>Lecturas recientes para comparar posicion, estado y ruta.</p>
          </div>
        </div>
        <div className={styles.timelineList}>
          {items.slice(0, 5).map((item) => (
            <div className={styles.timelineRow} key={item.telemetry.truckId}>
              <span className={styles.timelineTime}>{formatDate(item.telemetry.lastSignalAt)}</span>
              <div className={styles.timelineBody}>
                <strong>{item.plate} / {item.movementLabel}</strong>
                <span>
                  <MapPin aria-hidden size={13} /> {item.telemetry.latitude.toFixed(3)}, {item.telemetry.longitude.toFixed(3)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
