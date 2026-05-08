import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowUpRight, CheckCircle2, UserPlus } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { AssignCaseModal } from '../../assignments/components/AssignCaseModal'
import type { Assignment } from '../../assignments/types/assignment.types'
import { CaseApprovalsPanel } from '../../approvals/components/CaseApprovalsPanel'
import { EscalateCaseModal } from '../../escalation/components/EscalateCaseModal'
import { escalationHistoryMock } from '../../escalation/mocks/escalation.mock'
import type { EscalationEvent, EscalationLevel, EscalationReason } from '../../escalation/types/escalation.types'
import { CaseLaborPanel } from '../../labor/components/CaseLaborPanel'
import { mechanicsMock } from '../../../mocks/mechanics.mock'
import type { Mechanic } from '../../mechanics/types/mechanic.types'
import { CaseQuotePanel } from '../../quotes/components/CaseQuotePanel'
import { CaseSchedulePanel } from '../../schedule/components/CaseSchedulePanel'
import { CaseActionsPanel } from '../components/CaseActionsPanel'
import { CloseCaseModal } from '../components/CloseCaseModal'
import { CaseDiagnosticsPanel } from '../components/CaseDiagnosticsPanel'
import { CaseEscalationPanel } from '../components/CaseEscalationPanel'
import { CasePurchaseRequests } from '../components/CasePurchaseRequests'
import { CaseRequiredParts } from '../components/CaseRequiredParts'
import { CaseSlaPanel } from '../components/CaseSlaPanel'
import { CaseSummaryCard } from '../components/CaseSummaryCard'
import { CaseTimeline } from '../components/CaseTimeline'
import { useWorkshopCaseDetail } from '../hooks/useWorkshopCaseDetail'
import {
  assignWorkshopCase,
  closeWorkshopCase,
  escalateWorkshopCase,
  type CloseWorkshopCasePayload,
} from '../services/workshopCases.service'
import type { WorkshopCase } from '../types/workshopCase.types'

export function WorkshopCaseDetailPage() {
  const { caseId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { isLoading, isMissing, workshopCase } = useWorkshopCaseDetail(caseId)
  const { data: escalationEvents } = useResourceList<EscalationEvent>('/escalations', escalationHistoryMock, {
    caseId: caseId || '',
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: mechanics } = useResourceList<Mechanic>('/mechanics', mechanicsMock, { order: 'asc', sort: 'name' })
  const [localEvents, setLocalEvents] = useState<EscalationEvent[]>([])
  const [localEscalation, setLocalEscalation] = useState<{
    level: EscalationLevel
    reason: EscalationReason
  } | null>(null)
  const [localCasePatch, setLocalCasePatch] = useState<Partial<WorkshopCase>>({})
  const [actionError, setActionError] = useState('')
  const events = useMemo(() => {
    if (!workshopCase) {
      return []
    }

    return [
      ...localEvents.filter((event) => event.caseId === workshopCase.id),
      ...escalationEvents.filter((event) => event.caseId === workshopCase.id),
    ].sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
  }, [escalationEvents, localEvents, workshopCase])

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState label="Cargando detalle del caso" />
      </PageContainer>
    )
  }

  if (isMissing || !workshopCase) {
    return (
      <PageContainer>
        <EmptyState
          description="Revisa el identificador o vuelve al listado de casos."
          icon={<AlertCircle size={22} />}
          title="Caso no encontrado"
        />
      </PageContainer>
    )
  }

  const visibleCase = {
    ...workshopCase,
    ...localCasePatch,
    ...(localEscalation
      ? {
          escalationLevel: localEscalation.level,
          escalationReason: localEscalation.reason,
          updatedAt: events[0]?.createdAt || workshopCase.updatedAt,
        }
      : {}),
  }
  const isEscalationRoute = location.pathname === ROUTES.caseEscalate(workshopCase.id)
  const isAssignRoute = location.pathname === ROUTES.caseAssign(workshopCase.id)
  const isCloseRoute = location.pathname === ROUTES.caseClose(workshopCase.id)

  const openAssign = () => {
    navigate(ROUTES.caseAssign(workshopCase.id))
  }

  const openEscalation = () => {
    navigate(ROUTES.caseEscalate(workshopCase.id))
  }

  const openCloseCase = () => {
    navigate(ROUTES.caseClose(workshopCase.id))
  }

  const closeCaseAction = () => {
    navigate(ROUTES.caseDetail(workshopCase.id), { replace: true })
  }

  const closeEscalation = () => {
    navigate(ROUTES.caseDetail(workshopCase.id), { replace: true })
  }

  const handleAssignSubmit = async (assignment: Assignment) => {
    setActionError('')

    try {
      const saved = await assignWorkshopCase(workshopCase.id, assignment)

      setLocalCasePatch(saved.workshopCase)
      closeCaseAction()
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    }
  }

  const handleEscalationSubmit = async (event: EscalationEvent) => {
    setActionError('')

    try {
      const saved = await escalateWorkshopCase(workshopCase.id, event)

      setLocalEvents((currentEvents) => [saved.escalation, ...currentEvents.filter((item) => item.id !== saved.escalation.id)])
      setLocalEscalation({ level: saved.escalation.toLevel, reason: saved.escalation.reason })
      setLocalCasePatch(saved.workshopCase)
      closeEscalation()
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    }
  }

  const handleCloseSubmit = async (payload: CloseWorkshopCasePayload) => {
    setActionError('')

    try {
      const updatedCase = await closeWorkshopCase(workshopCase.id, payload)

      setLocalCasePatch(updatedCase)
      closeCaseAction()
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    }
  }

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            <Button disabled={visibleCase.status === 'closed'} icon={<UserPlus size={17} />} onClick={openAssign} size="sm" variant="secondary">
              {visibleCase.mechanicName ? 'Reasignar' : 'Asignar'}
            </Button>
            <Button disabled={visibleCase.status === 'closed'} icon={<ArrowUpRight size={17} />} onClick={openEscalation} size="sm" variant="secondary">
              Escalar
            </Button>
            <Button disabled={visibleCase.status === 'closed'} icon={<CheckCircle2 size={17} />} onClick={openCloseCase} size="sm">
              Cerrar
            </Button>
          </div>
        }
        description={visibleCase.failureDescription}
        title={visibleCase.caseNumber}
      />
      <div className="two-column-grid">
        <div className="stack">
          <CaseSummaryCard workshopCase={visibleCase} />
          <CaseDiagnosticsPanel caseId={visibleCase.id} />
          <CaseSchedulePanel caseId={visibleCase.id} />
          <CaseSlaPanel workshopCase={visibleCase} />
          <CaseRequiredParts workshopCase={visibleCase} />
          <CasePurchaseRequests workshopCase={visibleCase} />
          <CaseQuotePanel workshopCase={visibleCase} />
          <CaseLaborPanel caseId={visibleCase.id} />
          <CaseApprovalsPanel caseId={visibleCase.id} />
          <Card>
            <div className="stack">
              <h2 className="section-title">Flujo central</h2>
              <CaseTimeline workshopCase={visibleCase} />
            </div>
          </Card>
        </div>
        <div className="stack">
          {actionError ? <ErrorState description={actionError} title="No se pudo completar la accion" /> : null}
          <CaseActionsPanel
            onAssign={openAssign}
            onCloseCase={openCloseCase}
            onEscalate={openEscalation}
            workshopCase={visibleCase}
          />
          <CaseEscalationPanel events={events} onEscalate={openEscalation} workshopCase={visibleCase} />
        </div>
      </div>
      <AssignCaseModal
        initialCaseId={visibleCase.id}
        initialMechanicId={visibleCase.mechanicId || visibleCase.assignedMechanicId}
        mechanics={mechanics}
        onAssign={handleAssignSubmit}
        onClose={closeCaseAction}
        open={isAssignRoute}
        workshopCases={[visibleCase]}
      />
      <EscalateCaseModal
        onClose={closeEscalation}
        onSubmit={handleEscalationSubmit}
        open={isEscalationRoute}
        workshopCase={visibleCase}
      />
      <CloseCaseModal
        onClose={closeCaseAction}
        onSubmit={handleCloseSubmit}
        open={isCloseRoute}
        workshopCase={visibleCase}
      />
    </PageContainer>
  )
}
