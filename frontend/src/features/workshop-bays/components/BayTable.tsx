import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import type { WorkshopBay } from '../types/workshopBay.types'
import { BayStatusBadge } from './BayStatusBadge'
import { BayTypeBadge } from './BayTypeBadge'

interface BayTableProps {
  bays: WorkshopBay[]
}

export function BayTable({ bays }: BayTableProps) {
  const columns: TableColumn<WorkshopBay>[] = [
    { header: 'Estacion', key: 'name', render: (item) => <strong>{item.name}</strong> },
    { header: 'Tipo', key: 'type', render: (item) => <BayTypeBadge type={item.type} /> },
    { header: 'Estado', key: 'status', render: (item) => <BayStatusBadge status={item.status} /> },
    {
      header: 'Caso actual',
      key: 'currentCase',
      render: (item) => item.currentCaseNumber || 'Sin caso asignado',
    },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) =>
        item.currentCaseId ? (
          <Link to={ROUTES.caseDetail(item.currentCaseId)}>
            <Button size="sm" variant="secondary">
              Ver caso
            </Button>
          </Link>
        ) : (
          <Button disabled size="sm" variant="ghost">
            Libre
          </Button>
        ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={bays}
      enableSearch
      getRowHref={(item) => item.currentCaseId ? ROUTES.caseDetail(item.currentCaseId) : undefined}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => item.currentCaseNumber ? `Abrir caso ${item.currentCaseNumber}` : `Bahia ${item.name} sin caso asignado`}
      searchPlaceholder="Buscar estacion, tipo, estado o caso actual"
    />
  )
}
