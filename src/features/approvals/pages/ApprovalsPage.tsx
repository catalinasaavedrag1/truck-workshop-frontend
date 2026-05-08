import { useMemo, useState } from 'react'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { ApprovalTable } from '../components/ApprovalTable'
import { approvalsMock } from '../mocks/approvals.mock'
import { resolveApproval } from '../services/approvals.service'
import type { Approval, ApprovalStatus } from '../types/approval.types'
import { mergeApprovals } from '../utils/mergeApprovals'

export function ApprovalsPage() {
  const { data: fetchedApprovals } = useResourceList<Approval>('/approvals', approvalsMock, { sort: 'createdAt', order: 'desc' })
  const [changedApprovals, setChangedApprovals] = useState<Approval[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [resolvingApprovalId, setResolvingApprovalId] = useState('')
  const approvals = useMemo(
    () => mergeApprovals(fetchedApprovals, changedApprovals),
    [changedApprovals, fetchedApprovals],
  )
  const pending = approvals.filter((approval) => approval.status === 'pending').length

  const handleResolve = async (approval: Approval, status: Extract<ApprovalStatus, 'approved' | 'rejected'>) => {
    setErrorMessage('')
    setResolvingApprovalId(approval.id)

    try {
      const resolved = await resolveApproval(approval.id, status)

      setChangedApprovals((current) => [resolved, ...current.filter((item) => item.id !== resolved.id)])
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setResolvingApprovalId('')
    }
  }

  return (
    <PageContainer>
      <PageHeader
        description="Bandeja de aprobaciones para compras, cotizaciones, reparaciones caras y cierres especiales."
        title="Aprobaciones"
      />
      <div className="three-column-grid">
        <Card>
          <div className="stack">
            <span className="muted-text">Pendientes</span>
            <strong className="metric-value">{pending}</strong>
          </div>
        </Card>
        <Card>
          <div className="stack">
            <span className="muted-text">Aprobadas</span>
            <strong className="metric-value">{approvals.filter((item) => item.status === 'approved').length}</strong>
          </div>
        </Card>
        <Card>
          <div className="stack">
            <span className="muted-text">Rechazadas</span>
            <strong className="metric-value">{approvals.filter((item) => item.status === 'rejected').length}</strong>
          </div>
        </Card>
      </div>
      <Card>
        <div className="stack">
          {errorMessage ? <ErrorState description={errorMessage} title="No se pudo resolver la aprobacion" /> : null}
          <ApprovalTable approvals={approvals} onResolve={handleResolve} resolvingApprovalId={resolvingApprovalId} />
        </div>
      </Card>
    </PageContainer>
  )
}
