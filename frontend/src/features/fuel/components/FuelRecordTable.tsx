import { ReceiptText, Truck as TruckIcon } from 'lucide-react'
import { Badge } from '../../../shared/components/Badge/Badge'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import { driversMock } from '../../drivers/mocks/drivers.mock'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { fuelDeviationDescriptions } from '../constants/fuel.constants'
import type { FuelRecord } from '../types/fuel.types'
import { getFuelDeviationAction } from '../utils/fuelAnalytics'
import { FuelDeviationBadge } from './FuelDeviationBadge'
import styles from './FuelModule.module.css'

interface FuelRecordTableProps {
  records: FuelRecord[]
}

export function FuelRecordTable({ records }: FuelRecordTableProps) {
  const columns: TableColumn<FuelRecord>[] = [
    {
      header: 'Unidad / Chofer',
      key: 'truck',
      render: (item) => {
        const truck = fleetTrucksMock.find((candidate) => candidate.id === item.truckId)
        const driver = driversMock.find((candidate) => candidate.id === item.driverId)

        return (
          <div className={styles.truckCell}>
            <strong>
              <TruckIcon aria-hidden size={15} /> {truck?.plate || item.truckId}
            </strong>
            <span className={styles.muted}>{driver?.name || item.driverId}</span>
          </div>
        )
      },
    },
    {
      header: 'Carga',
      key: 'load',
      render: (item) => (
        <div className={styles.stationCell}>
          <strong>{formatDate(item.date)}</strong>
          <span className={styles.muted}>{item.stationName}</span>
          <span className={styles.muted}>
            <ReceiptText aria-hidden size={14} /> {item.receiptNumber || 'Sin comprobante'}
          </span>
        </div>
      ),
    },
    {
      align: 'right',
      header: 'Volumen / Costo',
      key: 'cost',
      render: (item) => (
        <div className={styles.metricCell}>
          <span className={styles.metricValue}>{item.liters.toLocaleString('es-CL')} l</span>
          <span className={styles.muted}>{formatCurrency(item.totalAmount)}</span>
          <span className={styles.muted}>{formatCurrency(item.pricePerLiter)} / l</span>
        </div>
      ),
    },
    {
      align: 'right',
      header: 'Rendimiento',
      key: 'efficiency',
      render: (item) => (
        <div className={styles.metricCell}>
          <span className={styles.metricValue}>{item.kmPerLiter ? `${item.kmPerLiter.toFixed(1)} km/l` : '-'}</span>
          <span className={styles.muted}>{item.odometer.toLocaleString('es-CL')} km</span>
        </div>
      ),
    },
    {
      header: 'Lectura operacional',
      key: 'deviation',
      render: (item) => (
        <div className={styles.riskCell}>
          <FuelDeviationBadge status={item.deviationStatus} />
          <span className={styles.riskAction}>{fuelDeviationDescriptions[item.deviationStatus]}</span>
          {item.notes ? <Badge tone="neutral">Con nota</Badge> : null}
        </div>
      ),
    },
    {
      header: 'Accion',
      key: 'action',
      render: (item) => <span className={styles.riskAction}>{getFuelDeviationAction(item.deviationStatus)}</span>,
    },
  ]

  return (
    <Table
      columns={columns}
      data={records}
      density="compact"
      enableSearch
      emptyDescription="Cuando se registren cargas apareceran con rendimiento y desviacion."
      emptyLabel="No hay cargas de combustible"
      getRowKey={(item) => item.id}
      searchPlaceholder="Buscar camion, chofer, estacion, boleta o desviacion"
    />
  )
}
