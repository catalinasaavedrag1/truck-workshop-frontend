import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import { driversMock } from '../../drivers/mocks/drivers.mock'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { FreightProfitability } from '../types/freightProfitability.types'
import { FreightMarginBadge } from './FreightMarginBadge'

interface FreightProfitabilityTableProps {
  items: FreightProfitability[]
}

export function FreightProfitabilityTable({ items }: FreightProfitabilityTableProps) {
  const columns: TableColumn<FreightProfitability>[] = [
    { header: 'Flete', key: 'freight', render: (item) => <strong>{item.freightId}</strong> },
    { header: 'Cliente', key: 'customer', render: (item) => item.customerName },
    {
      header: 'Camion',
      key: 'truck',
      render: (item) => fleetTrucksMock.find((truck) => truck.id === item.truckId)?.plate || item.truckId,
    },
    {
      header: 'Chofer',
      key: 'driver',
      render: (item) => driversMock.find((driver) => driver.id === item.driverId)?.name || item.driverId,
    },
    { align: 'right', header: 'Ingreso', key: 'revenue', render: (item) => formatCurrency(item.revenue) },
    { align: 'right', header: 'Costo', key: 'cost', render: (item) => formatCurrency(item.totalCost) },
    { align: 'right', header: 'Margen', key: 'margin', render: (item) => `${item.marginPercentage.toFixed(1)}%` },
    { header: 'Estado', key: 'status', render: (item) => <FreightMarginBadge marginPercentage={item.marginPercentage} /> },
  ]

  return (
    <Table
      columns={columns}
      data={items}
      enableSearch
      getRowKey={(item) => item.id}
      searchPlaceholder="Buscar flete, cliente, camion o chofer"
    />
  )
}
