import { Badge } from '../../../shared/components/Badge/Badge'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import type { MechanicPerformanceRow } from '../types/report.types'

interface MechanicPerformanceReportProps {
  rows: MechanicPerformanceRow[]
}

export function MechanicPerformanceReport({ rows }: MechanicPerformanceReportProps) {
  const columns: TableColumn<MechanicPerformanceRow>[] = [
    {
      header: 'Mecanico',
      key: 'mechanicName',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.mechanicName}</strong>
          <span className="muted-text">{item.specialty}</span>
        </div>
      ),
    },
    {
      align: 'right',
      header: 'Carga',
      key: 'activeCases',
      render: (item) => `${item.activeCases}/${item.capacity}`,
    },
    {
      align: 'right',
      header: 'Uso',
      key: 'utilization',
      render: (item) => (
        <Badge tone={item.utilization >= 100 ? 'danger' : item.utilization >= 75 ? 'warning' : 'success'}>
          {item.utilization}%
        </Badge>
      ),
    },
    {
      align: 'right',
      header: 'Criticos',
      key: 'criticalCases',
      render: (item) => <Badge tone={item.criticalCases > 0 ? 'danger' : 'success'}>{item.criticalCases}</Badge>,
    },
    { align: 'right', header: 'Promedio', key: 'averageRepairHours', render: (item) => `${item.averageRepairHours} h` },
    { align: 'right', header: 'Retrabajo', key: 'reworkRate', render: (item) => `${item.reworkRate}%` },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch
      emptyDescription="No hay mecanicos con casos registrados para este periodo."
      getRowKey={(item) => item.mechanicName}
      searchPlaceholder="Buscar mecanico, especialidad, carga o retrabajo"
    />
  )
}
