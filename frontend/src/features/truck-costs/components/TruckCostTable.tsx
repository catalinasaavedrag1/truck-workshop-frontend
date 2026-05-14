import { ROUTES } from '../../../config/routes'
import { EntityLink } from '../../../shared/components/EntityLink'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { truckCostTypeLabels } from '../constants/truckCosts.constants'
import type { TruckCost } from '../types/truckCosts.types'

interface TruckCostTableProps {
  costs: TruckCost[]
  truckLabels?: Record<string, string>
}

export function TruckCostTable({ costs, truckLabels = {} }: TruckCostTableProps) {
  const columns: TableColumn<TruckCost>[] = [
    {
      header: 'Camion',
      key: 'truck',
      render: (item) => (
        <EntityLink id={item.truckId} type="truck">
          {truckLabels[item.truckId] || fleetTrucksMock.find((truck) => truck.id === item.truckId)?.plate || item.truckId}
        </EntityLink>
      ),
    },
    { header: 'Tipo', key: 'type', render: (item) => truckCostTypeLabels[item.costType] },
    { header: 'Descripcion', key: 'description', render: (item) => item.description },
    { header: 'Fecha', key: 'date', render: (item) => formatDate(item.date) },
    { align: 'right', header: 'Monto', key: 'amount', render: (item) => formatCurrency(item.amount) },
    { header: 'Origen', key: 'source', render: (item) => sourceLabel(item.sourceModule || item.relatedEntityType) },
  ]

  return (
    <Table
      columns={columns}
      data={costs}
      enableSearch
      getRowHref={(item) => ROUTES.truckCostDetail(item.truckId)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir costos del camion ${truckLabels[item.truckId] || fleetTrucksMock.find((truck) => truck.id === item.truckId)?.plate || item.truckId}`}
      searchPlaceholder="Buscar camion, tipo, descripcion, fecha u origen"
    />
  )
}

function sourceLabel(source?: string) {
  const labels: Record<string, string> = {
    'freight-profitability': 'Fletes / rentabilidad',
    fuel: 'Combustible',
    incidents: 'Incidentes',
    ledger: 'Registro costos',
  }

  return source ? labels[source] || source : '-'
}
