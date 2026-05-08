import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { ownerTypeLabels } from '../constants/fleet.constants'
import type { FleetTruck } from '../types/fleet.types'
import { TruckStatusBadge } from './TruckStatusBadge'

interface TruckMasterTableProps {
  trucks: FleetTruck[]
}

export function TruckMasterTable({ trucks }: TruckMasterTableProps) {
  const columns: TableColumn<FleetTruck>[] = [
    { header: 'Patente', key: 'plate', render: (item) => <strong>{item.plate}</strong> },
    { header: 'Marca/modelo', key: 'model', render: (item) => `${item.brand} ${item.model}` },
    { align: 'right', header: 'Ano', key: 'year', render: (item) => item.year },
    { align: 'right', header: 'KM', key: 'km', render: (item) => item.currentOdometer.toLocaleString('es-CL') },
    { header: 'Capacidad', key: 'capacity', render: (item) => `${item.loadCapacityKg.toLocaleString('es-CL')} kg` },
    { header: 'Estado', key: 'status', render: (item) => <TruckStatusBadge status={item.operationalStatus} /> },
    { header: 'Propiedad', key: 'owner', render: (item) => ownerTypeLabels[item.ownerType] },
    { align: 'right', header: 'Valor', key: 'cost', render: (item) => formatCurrency(item.acquisitionCost) },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <Link to={ROUTES.fleetTruckDetail(item.id)}>
          <Button size="sm" variant="secondary">
            Ver
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={trucks}
      enableSearch
      getRowHref={(item) => ROUTES.fleetTruckDetail(item.id)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir ficha de flota ${item.plate}`}
      searchPlaceholder="Buscar patente, marca, modelo o estado"
    />
  )
}
