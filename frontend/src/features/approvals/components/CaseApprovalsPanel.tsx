import { useMemo, useState } from 'react'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { approvalsMock } from '../mocks/approvals.mock'
import { resolveApproval } from '../services/approvals.service'
import type { Approval, ApprovalStatus } from '../types/approval.types'
import { mergeApprovals } from '../utils/mergeApprovals'
import { ApprovalTable } from './ApprovalTable'

interface CaseApprovalsPanelProps {
  caseId: string
}

export function CaseApprovalsPanel({ caseId }: CaseApprovalsPanelProps) {
  const { data: allApprovals } = useResourceList<Approval>('/approvals', approvalsMock, {
    caseId,
    order: 'desc',
    sort: 'createdAt',
  })
  const [changedApprovals, setChangedApprovals] = useState<Approval[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [resolvingApprovalId, setResolvingApprovalId] = useState('')
  const approvals = useMemo(
    () => mergeApprovals(allApprovals, changedApprovals).filter((approval) => approval.caseId === caseId),
    [allApprovals, caseId, changedApprovals],
  )

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
    <Card>
      <div className="stack">
        <h2 className="section-title">Aprobaciones</h2>
        {errorMessage ? <ErrorState description={errorMessage} title="No se pudo resolver la aprobacion" /> : null}
        <ApprovalTable approvals={approvals} onResolve={handleResolve} resolvingApprovalId={resolvingApprovalId} />
      </div>
    </Card>
  )
}
