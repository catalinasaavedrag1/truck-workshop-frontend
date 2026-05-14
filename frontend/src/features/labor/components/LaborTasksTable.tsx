import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { LaborTask } from '../types/labor.types'
import { LaborTaskStatusBadge } from './LaborTaskStatusBadge'

interface LaborTasksTableProps {
  tasks: LaborTask[]
}

export function LaborTasksTable({ tasks }: LaborTasksTableProps) {
  const columns: TableColumn<LaborTask>[] = [
    { header: 'Trabajo', key: 'description', render: (item) => <strong>{item.description}</strong> },
    { header: 'Mecanico', key: 'mechanicName', render: (item) => item.mechanicName },
    { align: 'right', header: 'Horas est.', key: 'estimatedHours', render: (item) => item.estimatedHours },
    { align: 'right', header: 'Horas reales', key: 'realHours', render: (item) => item.realHours ?? 'Pendiente' },
    { align: 'right', header: 'Tarifa', key: 'hourlyRate', render: (item) => formatCurrency(item.hourlyRate) },
    { header: 'Estado', key: 'status', render: (item) => <LaborTaskStatusBadge status={item.status} /> },
  ]

  return (
    <Table
      columns={columns}
      data={tasks}
      enableSearch
      getRowKey={(item) => item.id}
      searchPlaceholder="Buscar trabajo, mecanico, estado o tarifa"
    />
  )
}
