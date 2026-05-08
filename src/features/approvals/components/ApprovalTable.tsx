import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type { Approval, ApprovalStatus } from '../types/approval.types'
import { ApprovalStatusBadge } from './ApprovalStatusBadge'
import { ApprovalTypeBadge } from './ApprovalTypeBadge'

interface ApprovalTableProps {
  approvals: Approval[]
  onResolve?: (approval: Approval, status: Extract<ApprovalStatus, 'approved' | 'rejected'>) => void
  resolvingApprovalId?: string
}

export function ApprovalTable({ approvals, onResolve, resolvingApprovalId }: ApprovalTableProps) {
  const columns: TableColumn<Approval>[] = [
    {
      header: 'Solicitud',
      key: 'title',
      render: (item) => (
        <div>
          <strong>{item.title}</strong>
          <p className="muted-text">Solicitado por {item.requestedBy}</p>
        </div>
      ),
    },
    { header: 'Tipo', key: 'type', render: (item) => <ApprovalTypeBadge type={item.type} /> },
    { header: 'Estado', key: 'status', render: (item) => <ApprovalStatusBadge status={item.status} /> },
    { header: 'Aprobador', key: 'approverRole', render: (item) => item.approverRole },
    {
      align: 'right',
      header: 'Monto',
      key: 'amount',
      render: (item) => item.amount !== undefined ? formatCurrency(item.amount) : 'Sin monto',
    },
    { header: 'Creada', key: 'createdAt', render: (item) => formatDate(item.createdAt) },
    {
      align: 'right',
      header: 'Acciones',
      key: 'actions',
      sortable: false,
      render: (item) =>
        item.status === 'pending' && onResolve ? (
          <div className="inline-actions">
            <Button
              disabled={resolvingApprovalId === item.id}
              icon={<CheckCircle2 size={16} />}
              onClick={() => onResolve(item, 'approved')}
              size="sm"
              type="button"
            >
              Aprobar
            </Button>
            <Button
              disabled={resolvingApprovalId === item.id}
              icon={<XCircle size={16} />}
              onClick={() => onResolve(item, 'rejected')}
              size="sm"
              type="button"
              variant="danger"
            >
              Rechazar
            </Button>
          </div>
        ) : (
          item.resolvedAt ? formatDate(item.resolvedAt) : 'Sin accion'
        ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={approvals}
      enableSearch
      getRowKey={(item) => item.id}
      searchPlaceholder="Buscar solicitud, tipo, aprobador o estado"
    />
  )
}
