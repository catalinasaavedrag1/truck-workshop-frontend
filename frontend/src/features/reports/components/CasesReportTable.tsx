import { Badge } from '../../../shared/components/Badge/Badge'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { CasesReportRow } from '../types/report.types'

interface CasesReportTableProps {
  rows: CasesReportRow[]
}

export function CasesReportTable({ rows }: CasesReportTableProps) {
  const columns: TableColumn<CasesReportRow>[] = [
    { header: 'Estado', key: 'status', render: (item) => <strong>{item.label}</strong> },
    { align: 'right', header: 'Casos', key: 'cases', render: (item) => item.cases },
    { align: 'right', header: 'Promedio', key: 'averageHours', render: (item) => `${item.averageHours} h` },
    {
      align: 'right',
      header: 'SLA critico',
      key: 'slaRiskCases',
      render: (item) => (
        <Badge tone={item.slaRiskCases > 0 ? 'danger' : 'success'}>{item.slaRiskCases}</Badge>
      ),
    },
    {
      align: 'right',
      header: 'Bloqueos',
      key: 'blockedPartsCases',
      render: (item) => (
        <Badge tone={item.blockedPartsCases > 0 ? 'warning' : 'success'}>{item.blockedPartsCases}</Badge>
      ),
    },
    {
      align: 'right',
      header: 'Costo estimado',
      key: 'estimatedCost',
      render: (item) => formatCurrency(item.estimatedCost),
    },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch
      emptyDescription="Cuando existan casos, se agruparan por estado operacional."
      getRowKey={(item) => item.status}
      searchPlaceholder="Buscar estado, SLA, bloqueos o costo"
    />
  )
}
