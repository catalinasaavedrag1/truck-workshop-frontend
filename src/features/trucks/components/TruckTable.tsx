import { Link } from 'react-router-dom'
import { CalendarClock, Eye, Truck as TruckIcon } from 'lucide-react'
import { Badge } from '../../../shared/components/Badge/Badge'
import { ROUTES } from '../../../config/routes'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatDate } from '../../../shared/utils/formatDate'
import type { Truck } from '../types/truck.types'
import styles from './TruckModule.module.css'
import { TruckStatusBadge } from './TruckStatusBadge'
import { getShortVin, getTruckServiceRisk } from '../utils/truckMaintenance'

interface TruckTableProps {
  trucks: Truck[]
}

export function TruckTable({ trucks }: TruckTableProps) {
  const columns: TableColumn<Truck>[] = [
    {
      header: 'Camion',
      key: 'truck',
      render: (item) => (
        <div className={styles.truckCell}>
          <span className={styles.truckIcon}>
            <TruckIcon aria-hidden size={18} />
          </span>
          <div>
            <Link className={styles.plateLink} to={ROUTES.truckDetail(item.id)}>
              {item.plate}
            </Link>
            <div className={styles.modelMeta}>
              {item.brand} {item.model}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Ficha',
      key: 'profile',
      render: (item) => (
        <div>
          <strong>{item.year}</strong>
          <div className={styles.vinText}>VIN ...{getShortVin(item.vin)}</div>
        </div>
      ),
    },
    {
      align: 'right',
      header: 'Kilometraje',
      key: 'odometer',
      render: (item) => `${item.odometer.toLocaleString('es-CL')} km`,
    },
    { header: 'Estado', key: 'status', render: (item) => <TruckStatusBadge status={item.status} /> },
    {
      header: 'Servicio',
      key: 'lastServiceAt',
      render: (item) => {
        const risk = getTruckServiceRisk(item.lastServiceAt)

        return (
          <div className={styles.serviceCell}>
            <Badge tone={risk.tone}>{risk.label}</Badge>
            <small>
              <CalendarClock aria-hidden size={14} /> {formatDate(item.lastServiceAt)} - hace {risk.daysSinceService} dias
            </small>
          </div>
        )
      },
    },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <Link className={styles.actionLink} to={ROUTES.truckDetail(item.id)}>
          <Eye aria-hidden size={16} />
          Ver ficha
        </Link>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={trucks}
      enableSearch
      emptyDescription="Ajusta la busqueda o cambia el estado seleccionado para ver mas camiones."
      emptyLabel="No hay camiones con esos filtros"
      getRowHref={(item) => ROUTES.truckDetail(item.id)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir ficha del camion ${item.plate}`}
      searchPlaceholder="Buscar patente, marca, modelo, VIN, estado o servicio"
    />
  )
}
