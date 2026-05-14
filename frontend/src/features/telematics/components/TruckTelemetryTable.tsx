import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatDate } from '../../../shared/utils/formatDate'
import { operationalStatusLabels, operationalStatusTones } from '../../fleet/constants/fleet.constants'
import { decisionTones, signalStateLabels, signalStateTones } from '../utils/telematicsOperations'
import type { TelematicsFleetItem } from '../utils/telematicsOperations'
import { TelemetryAlertBadge } from './TelemetryAlertBadge'
import styles from './TelematicsModule.module.css'

interface TruckTelemetryTableProps {
  items: TelematicsFleetItem[]
  onSelectTruck: (truckId: string) => void
}

export function TruckTelemetryTable({ items, onSelectTruck }: TruckTelemetryTableProps) {
  const columns: TableColumn<TelematicsFleetItem>[] = [
    {
      header: 'Camion',
      key: 'truck',
      render: (item) => (
        <div className={styles.vehicleCell}>
          <strong>{item.plate}</strong>
          <span>{item.truck?.brand} {item.truck?.model}</span>
          <span>{item.driverName}</span>
        </div>
      ),
      sortValue: (item) => item.plate,
    },
    {
      header: 'Estado operativo',
      key: 'status',
      render: (item) => (
        <div className={styles.vehicleCell}>
          <div className={styles.badgeLine}>
            <Badge tone={decisionTones[item.decisionLevel]}>{item.decisionLabel}</Badge>
            <Badge tone={signalStateTones[item.signalState]}>{signalStateLabels[item.signalState]}</Badge>
          </div>
          <span>{item.movementLabel}</span>
        </div>
      ),
      searchableValue: (item) => `${item.decisionLabel} ${item.movementLabel} ${signalStateLabels[item.signalState]}`,
      sortValue: (item) => item.priorityScore,
    },
    {
      header: 'Flota',
      key: 'fleet',
      render: (item) => item.truck ? (
        <div className={styles.vehicleCell}>
          <Badge tone={operationalStatusTones[item.truck.operationalStatus]}>
            {operationalStatusLabels[item.truck.operationalStatus]}
          </Badge>
          <span>{item.truck.mainBlocker || 'Sin bloqueo operativo'}</span>
        </div>
      ) : (
        <Badge tone="neutral">Sin ficha</Badge>
      ),
      sortValue: (item) => item.truck?.operationalStatus,
    },
    {
      align: 'right',
      header: 'Velocidad',
      key: 'speed',
      render: (item) => (
        <div className={styles.vehicleCell}>
          <strong>{item.telemetry.speed} km/h</strong>
          <span>Ralent {item.telemetry.idleMinutes} min</span>
        </div>
      ),
      sortValue: (item) => item.telemetry.speed,
    },
    {
      align: 'right',
      header: 'Combustible',
      key: 'fuel',
      render: (item) => (
        <div className={styles.fuelCell}>
          <strong>{item.telemetry.fuelLevel}%</strong>
          <div className={[styles.fuelTrack, item.fuelRisk ? styles.fuelTrackLow : ''].filter(Boolean).join(' ')} aria-hidden>
            <span style={{ width: `${Math.min(100, Math.max(0, item.telemetry.fuelLevel))}%` }} />
          </div>
        </div>
      ),
      sortValue: (item) => item.telemetry.fuelLevel,
    },
    {
      header: 'Ultima senal',
      key: 'signal',
      render: (item) => (
        <div className={styles.vehicleCell}>
          <strong>{formatDate(item.telemetry.lastSignalAt)}</strong>
          <span>Hace {item.signalAgeMinutes} min</span>
        </div>
      ),
      sortValue: (item) => item.signalAgeMinutes,
    },
    {
      header: 'Alertas',
      key: 'alerts',
      render: (item) =>
        item.telemetry.alerts.length > 0 ? (
          <div className={styles.badgeLine}>
            {item.telemetry.alerts.map((alert) => (
              <TelemetryAlertBadge alert={alert} key={alert} />
            ))}
          </div>
        ) : (
          <Badge tone="success">Sin alertas</Badge>
        ),
      searchableValue: (item) => item.telemetry.alerts.join(' '),
      sortValue: (item) => item.telemetry.alerts.length,
    },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <div className={styles.tableActions}>
          <Button onClick={() => onSelectTruck(item.telemetry.truckId)} size="sm" type="button" variant="secondary">
            Ver GPS
          </Button>
          <Link to={ROUTES.fleetTruckDetail(item.telemetry.truckId)}>
            <Button size="sm" variant="secondary">Ficha</Button>
          </Link>
        </div>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={items}
      density="compact"
      enableSearch
      emptyDescription="No hay unidades que coincidan con los filtros GPS actuales."
      getRowLabel={(item) => `Ver GPS de ${item.plate}`}
      getRowKey={(item) => item.telemetry.truckId}
      getSearchText={(item) => [
        item.plate,
        item.driverName,
        item.truck?.brand,
        item.truck?.model,
        item.truck?.operationalStatus,
        item.decisionLabel,
        item.nextAction,
        item.movementLabel,
        item.signalState,
        item.telemetry.alerts.join(' '),
      ].join(' ')}
      initialSort={{ direction: 'desc', key: 'status' }}
      onRowClick={(item) => onSelectTruck(item.telemetry.truckId)}
      searchPlaceholder="Buscar patente, chofer, alerta, estado o accion"
    />
  )
}
