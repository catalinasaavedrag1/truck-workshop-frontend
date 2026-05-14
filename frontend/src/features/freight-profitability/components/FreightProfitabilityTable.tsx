import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import { driversMock } from '../../drivers/mocks/drivers.mock'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { getFreightMarginStatus } from '../constants/freightProfitability.constants'
import type { FreightProfitability } from '../types/freightProfitability.types'
import { FreightMarginBadge } from './FreightMarginBadge'
import styles from './FreightProfitability.module.css'

interface FreightProfitabilityTableProps {
  items: FreightProfitability[]
  onSelect?: (itemId: string) => void
  selectedId?: string
}

export function FreightProfitabilityTable({ items, onSelect, selectedId }: FreightProfitabilityTableProps) {
  const columns: TableColumn<FreightProfitability>[] = [
    {
      header: 'Flete / cliente',
      key: 'freight',
      render: (item) => (
        <div className={styles.freightCell}>
          <strong>{item.freightId}</strong>
          <span className="muted-text">{item.customerName}</span>
          {selectedId === item.id ? (
            <span className={styles.selectedMark}>
              <Badge tone="info">Analizando</Badge>
            </span>
          ) : null}
        </div>
      ),
      searchableValue: (item) => `${item.freightId} ${item.customerName}`,
    },
    {
      header: 'Unidad / chofer',
      key: 'operation',
      render: (item) => {
        const truckPlate = fleetTrucksMock.find((truck) => truck.id === item.truckId)?.plate || item.truckId
        const driverName = driversMock.find((driver) => driver.id === item.driverId)?.name || item.driverId

        return (
          <div className={styles.unitCell}>
            <strong>{truckPlate}</strong>
            <span className="muted-text">{driverName}</span>
          </div>
        )
      },
      searchableValue: (item) => `${item.truckId} ${item.driverId}`,
    },
    {
      align: 'right',
      header: 'Ingreso / costo',
      key: 'revenue',
      render: (item) => (
        <div className={styles.moneyCell}>
          <strong>{formatCurrency(item.revenue)}</strong>
          <span>{formatCurrency(item.totalCost)} costo</span>
        </div>
      ),
      sortValue: (item) => item.revenue,
    },
    {
      align: 'right',
      header: 'Margen neto',
      key: 'netMargin',
      render: (item) => (
        <div className={styles.moneyCell}>
          <strong>{formatCurrency(item.netMargin)}</strong>
          <span>{item.marginPercentage.toFixed(1)}% del ingreso</span>
        </div>
      ),
      sortValue: (item) => item.netMargin,
    },
    {
      header: 'KM / eficiencia',
      key: 'km',
      render: (item) => (
        <div className={styles.kmCell}>
          <strong>{item.km} km</strong>
          <span>{formatCurrency(item.costPerKm)}/km costo</span>
        </div>
      ),
      sortValue: (item) => item.costPerKm,
    },
    {
      header: 'Decision',
      key: 'decision',
      render: (item) => (
        <div className={styles.actionCell}>
          <FreightMarginBadge marginPercentage={item.marginPercentage} />
          <span>{getFreightMarginAction(item.marginPercentage)}</span>
        </div>
      ),
      searchableValue: (item) => getFreightMarginStatus(item.marginPercentage),
    },
  ]

  return (
    <Table
      columns={columns}
      data={items}
      density="compact"
      enableSearch
      getSearchText={(item) => {
        const truckPlate = fleetTrucksMock.find((truck) => truck.id === item.truckId)?.plate || item.truckId
        const driverName = driversMock.find((driver) => driver.id === item.driverId)?.name || item.driverId

        return `${item.freightId} ${item.customerName} ${truckPlate} ${driverName}`
      }}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Analizar rentabilidad de ${item.freightId}`}
      onRowClick={(item) => onSelect?.(item.id)}
      searchPlaceholder="Buscar flete, cliente, camion o chofer"
    />
  )
}

function getFreightMarginAction(marginPercentage: number) {
  const status = getFreightMarginStatus(marginPercentage)

  if (status === 'NEGATIVE') {
    return 'Bloquear tarifa actual'
  }

  if (status === 'LOW') {
    return 'Revisar tarifa y costos'
  }

  if (status === 'OK') {
    return 'Mantener control'
  }

  return 'Replicar ruta rentable'
}
