import { Link } from 'react-router-dom'
import { Activity, ClipboardList, Files, KanbanSquare, Truck, Users } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Card } from '../../../shared/components/Card/Card'
import type { Driver } from '../../drivers/types/driver.types'
import type { FleetTruck } from '../types/fleet.types'
import styles from './FleetOperationsHub.module.css'

interface FleetOperationsHubProps {
  drivers: Driver[]
  healthScoreAverage?: number
  trucks: FleetTruck[]
}

export function FleetOperationsHub({ drivers, healthScoreAverage = 0, trucks }: FleetOperationsHubProps) {
  const available = trucks.filter((truck) => truck.operationalStatus === 'AVAILABLE').length
  const blocked = trucks.filter((truck) =>
    ['BLOCKED', 'OUT_OF_SERVICE', 'WAITING_PARTS'].includes(truck.operationalStatus),
  ).length
  const inWorkshop = trucks.filter((truck) => truck.operationalStatus === 'IN_WORKSHOP').length
  const activeDrivers = drivers.filter((driver) => driver.status === 'active').length
  const trucksWithoutDriver = trucks.filter((truck) => !truck.assignedDriverId).length

  const tiles = [
    {
      helper: 'Datos base, chofer asignado, capacidad y propiedad.',
      icon: <Truck aria-hidden size={16} />,
      label: 'Ficha de flota',
      metric: `${trucks.length}`,
      metricLabel: 'unidades',
      to: ROUTES.fleetTrucks,
    },
    {
      helper: 'Disponibles, en ruta, bloqueados y fecha de retorno.',
      icon: <KanbanSquare aria-hidden size={16} />,
      label: 'Disponibilidad',
      metric: `${available}`,
      metricLabel: 'listas hoy',
      to: ROUTES.fleetAvailability,
    },
    {
      helper: 'Licencias, contacto, estado y casos asociados.',
      icon: <Users aria-hidden size={16} />,
      label: 'Choferes',
      metric: `${activeDrivers}`,
      metricLabel: 'activos',
      to: ROUTES.drivers,
    },
    {
      helper: 'Casos, fallas, bloqueos y unidades en reparacion.',
      icon: <ClipboardList aria-hidden size={16} />,
      label: 'Camiones en taller',
      metric: `${inWorkshop}`,
      metricLabel: 'en taller',
      to: ROUTES.trucks,
    },
    {
      helper: 'Documentos y score para decidir si una unidad sale.',
      icon: <Files aria-hidden size={16} />,
      label: 'Control documental',
      metric: `${blocked}`,
      metricLabel: 'bloqueos',
      to: ROUTES.truckDocuments,
    },
  ]

  return (
    <Card className={styles.hub}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h2>Mapa operativo de flota</h2>
          <p>
            Una unidad se gestiona como flujo continuo: ficha maestra, chofer, disponibilidad, taller, documentos y
            salud operacional.
          </p>
        </div>
        <div className={styles.statusStrip}>
          <Badge tone={available > 0 ? 'success' : 'warning'}>{available} disponibles</Badge>
          <Badge tone={trucksWithoutDriver > 0 ? 'warning' : 'success'}>{trucksWithoutDriver} sin chofer</Badge>
          <Badge tone={blocked > 0 ? 'danger' : 'success'}>{blocked} bloqueos</Badge>
        </div>
      </div>
      <div className={styles.grid}>
        {tiles.map((tile) => (
          <Link className={styles.tile} key={tile.to} to={tile.to}>
            <div className={styles.tileTop}>
              <span className={styles.icon}>{tile.icon}</span>
              <div>
                <strong>{tile.label}</strong>
                <p>{tile.helper}</p>
              </div>
            </div>
            <div className={styles.tileMetric}>
              <span>{tile.metricLabel}</span>
              <b>{tile.metric}</b>
            </div>
          </Link>
        ))}
        <Link className={styles.tile} to={ROUTES.fleetHealthScore}>
          <div className={styles.tileTop}>
            <span className={styles.icon}>
              <Activity aria-hidden size={16} />
            </span>
            <div>
              <strong>Health Score</strong>
              <p>Riesgo consolidado por documentos, taller, costos y mantencion.</p>
            </div>
          </div>
          <div className={styles.tileMetric}>
            <span>promedio</span>
            <b>{healthScoreAverage}/100</b>
          </div>
        </Link>
      </div>
    </Card>
  )
}
