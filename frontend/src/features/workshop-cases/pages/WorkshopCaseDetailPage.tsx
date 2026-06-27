import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ClipboardCheck, FileText, Image, ListChecks, TimerReset, UserPlus } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { toast } from '../../../shared/services/toastStore'
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
import { CloseCaseModal } from '../components/CloseCaseModal'
import { CaseContextHeader } from '../components/CaseContextHeader'
import { CaseDiagnosticsPanel } from '../components/CaseDiagnosticsPanel'
import { CaseEscalationPanel } from '../components/CaseEscalationPanel'
import { CasePurchaseRequests } from '../components/CasePurchaseRequests'
import { CaseRequiredParts } from '../components/CaseRequiredParts'
import { CaseSlaPanel } from '../components/CaseSlaPanel'
import { CaseSummaryPanel } from '../components/CaseSummaryPanel'
import { CaseWorkflowStepper } from '../components/CaseWorkflowStepper'
import { NextStepCard } from '../components/NextStepCard'
import { StageActionBar } from '../components/StageActionBar'
import { StageTabs } from '../components/StageTabs'
import type { StageTabItem } from '../components/StageTabs'
import { StickyCaseFooter } from '../components/StickyCaseFooter'
import { WorkshopCaseLayout } from '../components/WorkshopCaseLayout'
import styles from '../components/WorkshopCaseLayout.module.css'
import { useWorkshopCaseDetail } from '../hooks/useWorkshopCaseDetail'
import {
  assignWorkshopCase,
  closeWorkshopCase,
  escalateWorkshopCase,
  type CloseWorkshopCasePayload,
} from '../services/workshopCases.service'
import type { WorkshopCase } from '../types/workshopCase.types'
import {
  buildCaseWorkflowStages,
  getNextStepForCase,
  getStageIdForCaseStatus,
  type CaseWorkflowStageId,
} from '../utils/workshopCaseWorkflow'

const STAGE_TABS: Record<CaseWorkflowStageId, StageTabItem[]> = {
  approval: [
    { id: 'approvals', label: 'Aprobaciones' },
    { id: 'escalation', label: 'Escalamiento' },
    { id: 'decision', label: 'Decision' },
  ],
  closure: [
    { id: 'summary', label: 'Resumen cierre' },
    { id: 'evidence', label: 'Evidencia' },
    { id: 'release', label: 'Liberacion' },
  ],
  diagnosis: [
    { id: 'technical-summary', label: 'Resumen tecnico' },
    { id: 'checklist', label: 'Checklist' },
    { id: 'evidence', label: 'Evidencia / Fotos' },
    { id: 'findings', label: 'Fallas detectadas' },
    { id: 'history', label: 'Historial tecnico' },
    { id: 'assignments', label: 'Asignaciones' },
  ],
  quote: [
    { id: 'parts', label: 'Repuestos' },
    { id: 'labor', label: 'Mano de obra' },
    { id: 'external-services', label: 'Servicios externos' },
    { id: 'providers', label: 'Proveedores' },
    { id: 'cost-summary', label: 'Resumen costos' },
  ],
  reception: [
    { id: 'case-entry', label: 'Ingreso' },
    { id: 'schedule', label: 'Agenda' },
    { id: 'sla', label: 'SLA' },
  ],
  repair: [
    { id: 'tasks', label: 'Tareas' },
    { id: 'mechanics', label: 'Mecanicos asignados' },
    { id: 'progress', label: 'Avance' },
    { id: 'used-parts', label: 'Repuestos usados' },
    { id: 'evidence', label: 'Evidencia' },
    { id: 'time-control', label: 'Control de tiempo' },
  ],
}

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
  const [selectedStageOverride, setSelectedStageOverride] = useState<{
    caseId: string
    stageId: CaseWorkflowStageId
  } | null>(null)
  const [selectedTabByStage, setSelectedTabByStage] = useState<Record<CaseWorkflowStageId, string>>({
    approval: STAGE_TABS.approval[0].id,
    closure: STAGE_TABS.closure[0].id,
    diagnosis: STAGE_TABS.diagnosis[0].id,
    quote: STAGE_TABS.quote[0].id,
    reception: STAGE_TABS.reception[0].id,
    repair: STAGE_TABS.repair[0].id,
  })
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
  const statusStageId = getStageIdForCaseStatus(visibleCase.status)
  const selectedStageId = selectedStageOverride?.caseId === visibleCase.id ? selectedStageOverride.stageId : statusStageId
  const workflowStages = buildCaseWorkflowStages(visibleCase)
  const nextStep = getNextStepForCase(visibleCase)
  const activeTabs = STAGE_TABS[selectedStageId]
  const activeTabId = selectedTabByStage[selectedStageId] || activeTabs[0].id

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

  const selectStage = (stageId: CaseWorkflowStageId) => {
    setSelectedStageOverride({ caseId: visibleCase.id, stageId })
    setSelectedTabByStage((current) => ({
      ...current,
      [stageId]: current[stageId] || STAGE_TABS[stageId][0].id,
    }))
  }

  const selectStageTab = (tabId: string) => {
    setSelectedTabByStage((current) => ({
      ...current,
      [selectedStageId]: tabId,
    }))
  }

  const jumpToStageTool = (stageId: CaseWorkflowStageId, tabId?: string) => {
    setSelectedStageOverride({ caseId: visibleCase.id, stageId })
    setSelectedTabByStage((current) => ({
      ...current,
      [stageId]: tabId || current[stageId] || STAGE_TABS[stageId][0].id,
    }))
  }

  const handlePrimaryAction = () => {
    if (nextStep.stageId === 'reception') {
      openAssign()
      return
    }

    if (nextStep.stageId === 'diagnosis') {
      jumpToStageTool('diagnosis', 'technical-summary')
      return
    }

    if (nextStep.stageId === 'quote') {
      jumpToStageTool('quote', 'cost-summary')
      return
    }

    if (nextStep.stageId === 'approval') {
      jumpToStageTool('approval', 'approvals')
      return
    }

    if (nextStep.stageId === 'repair') {
      jumpToStageTool('repair', 'tasks')
      return
    }

    openCloseCase()
  }

  const handleAssignSubmit = async (assignment: Assignment) => {
    setActionError('')

    try {
      const saved = await assignWorkshopCase(workshopCase.id, assignment)

      setLocalCasePatch(saved.workshopCase)
      setSelectedStageOverride(null)
      closeCaseAction()
      toast.success('Caso asignado', 'La asignacion se registro correctamente.')
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
      setSelectedStageOverride(null)
      closeEscalation()
      toast.warning('Caso escalado', `El caso se elevo a nivel ${saved.escalation.toLevel}.`)
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    }
  }

  const handleCloseSubmit = async (payload: CloseWorkshopCasePayload) => {
    setActionError('')

    try {
      const updatedCase = await closeWorkshopCase(workshopCase.id, payload)

      setLocalCasePatch(updatedCase)
      setSelectedStageOverride({ caseId: workshopCase.id, stageId: 'closure' })
      closeCaseAction()
      toast.success('Caso cerrado', 'El caso se cerro y la unidad vuelve a disponibilidad.')
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    }
  }

  return (
    <PageContainer>
      <WorkshopCaseLayout
        actionBar={
          <StageActionBar
            activeStageId={selectedStageId}
            nextStep={nextStep}
            onAssign={openAssign}
            onCloseCase={openCloseCase}
            onEscalate={openEscalation}
            onPrimaryAction={handlePrimaryAction}
            workshopCase={visibleCase}
          />
        }
        aside={
          <>
            {actionError ? <ErrorState description={actionError} title="No se pudo completar la accion" /> : null}
            <CaseSummaryPanel workshopCase={visibleCase} />
            <Card>
              <NextStepCard nextStep={nextStep} workshopCase={visibleCase} />
            </Card>
          </>
        }
        footer={<StickyCaseFooter nextStep={nextStep} workshopCase={visibleCase} />}
        header={<CaseContextHeader nextStep={nextStep} workshopCase={visibleCase} />}
        tabs={<StageTabs activeTabId={activeTabId} onSelectTab={selectStageTab} tabs={activeTabs} />}
        workflow={<CaseWorkflowStepper activeStageId={selectedStageId} onSelectStage={selectStage} stages={workflowStages} />}
      >
        {renderStageContent({
          activeStageId: selectedStageId,
          activeTabId,
          events,
          onAssign: openAssign,
          onEscalate: openEscalation,
          onCloseCase: openCloseCase,
          workshopCase: visibleCase,
        })}
      </WorkshopCaseLayout>
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

interface RenderStageContentParams {
  activeStageId: CaseWorkflowStageId
  activeTabId: string
  events: EscalationEvent[]
  onAssign: () => void
  onCloseCase: () => void
  onEscalate: () => void
  workshopCase: WorkshopCase
}

function renderStageContent({
  activeStageId,
  activeTabId,
  events,
  onAssign,
  onCloseCase,
  onEscalate,
  workshopCase,
}: RenderStageContentParams) {
  if (activeStageId === 'reception') {
    if (activeTabId === 'schedule') {
      return <CaseSchedulePanel caseId={workshopCase.id} />
    }

    if (activeTabId === 'sla') {
      return <CaseSlaPanel workshopCase={workshopCase} />
    }

    return (
      <div className="stack">
        <CaseIntakePanel workshopCase={workshopCase} />
        <OperatorPanel onAssign={onAssign} workshopCase={workshopCase} />
      </div>
    )
  }

  if (activeStageId === 'diagnosis') {
    if (activeTabId === 'checklist') {
      return (
        <StageInfoCard
          action={<Link className="action-link" to={ROUTES.checklists}><ListChecks size={16} />Ver checklists</Link>}
          description="Puntos tecnicos activos para validar seguridad, sintomas y causa probable."
          icon={<ListChecks size={22} />}
          title="Checklist de diagnostico"
        />
      )
    }

    if (activeTabId === 'evidence') {
      return (
        <StageInfoCard
          description="Fotos, comentarios y respaldos tecnicos asociados al diagnostico del camion."
          icon={<Image size={22} />}
          title="Evidencia / Fotos"
        />
      )
    }

    if (activeTabId === 'findings') {
      return <CaseRequiredParts workshopCase={workshopCase} />
    }

    if (activeTabId === 'history') {
      return (
        <StageInfoCard
          description={`${workshopCase.truckPlate} mantiene registro de intervenciones, sintomas reportados y cambios recientes.`}
          icon={<ClipboardCheck size={22} />}
          title="Historial tecnico"
        />
      )
    }

    if (activeTabId === 'assignments') {
      return <OperatorPanel onAssign={onAssign} workshopCase={workshopCase} />
    }

    return <CaseDiagnosticsPanel caseId={workshopCase.id} showRegisterLink={false} />
  }

  if (activeStageId === 'quote') {
    if (activeTabId === 'parts') {
      return <CaseRequiredParts workshopCase={workshopCase} />
    }

    if (activeTabId === 'labor') {
      return <CaseLaborPanel caseId={workshopCase.id} />
    }

    if (activeTabId === 'external-services') {
      return (
        <StageInfoCard
          description="Servicios externos asociados a rectificacion, grua, pruebas especializadas o apoyo de proveedor."
          icon={<FileText size={22} />}
          title="Servicios externos"
        />
      )
    }

    if (activeTabId === 'providers') {
      return <CasePurchaseRequests workshopCase={workshopCase} />
    }

    return <CaseQuotePanel workshopCase={workshopCase} />
  }

  if (activeStageId === 'approval') {
    if (activeTabId === 'escalation') {
      return <CaseEscalationPanel events={events} onEscalate={onEscalate} workshopCase={workshopCase} />
    }

    if (activeTabId === 'decision') {
      return (
        <StageInfoCard
          action={<Button disabled={workshopCase.status === 'closed'} onClick={onEscalate} size="sm" variant="secondary">Escalar decision</Button>}
          description="Estado de decision para continuar compra, reparacion o cierre administrativo del caso."
          icon={<FileText size={22} />}
          title="Decision operacional"
        />
      )
    }

    return <CaseApprovalsPanel caseId={workshopCase.id} />
  }

  if (activeStageId === 'repair') {
    if (activeTabId === 'mechanics') {
      return <OperatorPanel onAssign={onAssign} workshopCase={workshopCase} />
    }

    if (activeTabId === 'progress') {
      return <CaseSchedulePanel caseId={workshopCase.id} />
    }

    if (activeTabId === 'used-parts') {
      return <CaseRequiredParts workshopCase={workshopCase} />
    }

    if (activeTabId === 'evidence') {
      return (
        <StageInfoCard
          description="Registro de evidencia tecnica tomada durante la reparacion y prueba del camion."
          icon={<Image size={22} />}
          title="Evidencia de reparacion"
        />
      )
    }

    if (activeTabId === 'time-control') {
      return (
        <div className="stack">
          <CaseLaborPanel caseId={workshopCase.id} />
          <StageInfoCard
            description="Comparacion entre horas estimadas, horas reales y responsable por tarea."
            icon={<TimerReset size={22} />}
            title="Control de tiempo"
          />
        </div>
      )
    }

    return <CaseLaborPanel caseId={workshopCase.id} />
  }

  if (activeTabId === 'evidence') {
    return (
      <StageInfoCard
        description="Evidencia final, prueba de ruta y respaldos de liberacion del camion."
        icon={<Image size={22} />}
        title="Evidencia final"
      />
    )
  }

  if (activeTabId === 'release') {
    return (
      <StageInfoCard
        action={<Button disabled={workshopCase.status === 'closed'} onClick={onCloseCase} size="sm">Cerrar caso</Button>}
        description="Validacion final del taller antes de devolver el camion a operacion."
        icon={<ClipboardCheck size={22} />}
        title="Liberacion del camion"
      />
    )
  }

  return (
    <Card>
      <div className="stack">
        <div className="split-row">
          <div>
            <h2 className="section-title">Resumen de cierre</h2>
            <p className="muted-text">{workshopCase.closureSummary || 'Caso pendiente de cierre tecnico.'}</p>
          </div>
          {workshopCase.closedAt ? <Badge tone="success">Cerrado</Badge> : <Badge tone="warning">Pendiente</Badge>}
        </div>
        <OperatorPanel onAssign={onAssign} workshopCase={workshopCase} />
      </div>
    </Card>
  )
}

interface StageInfoCardProps {
  action?: ReactNode
  description: string
  icon: ReactNode
  title: string
}

function StageInfoCard({ action, description, icon, title }: StageInfoCardProps) {
  return (
    <Card>
      <div className="stack">
        <div className="split-row">
          <div className="stack-tight">
            <span className={styles.stageNumber}>{icon}</span>
            <h2 className="section-title">{title}</h2>
            <p className="muted-text">{description}</p>
          </div>
          {action}
        </div>
      </div>
    </Card>
  )
}

interface CaseIntakePanelProps {
  workshopCase: WorkshopCase
}

function CaseIntakePanel({ workshopCase }: CaseIntakePanelProps) {
  return (
    <Card>
      <div className="stack">
        <div className="split-row">
          <div>
            <h2 className="section-title">Ingreso del caso</h2>
            <p className="muted-text">{workshopCase.title || workshopCase.failureDescription}</p>
          </div>
          <Badge tone={workshopCase.immobilized ? 'danger' : 'info'}>
            {workshopCase.immobilized ? 'Camion inmovilizado' : 'Camion evaluable'}
          </Badge>
        </div>
        <dl className="detail-list">
          <div>
            <dt>Origen</dt>
            <dd>{workshopCase.intakeSource || 'Operacion'}</dd>
          </div>
          <div>
            <dt>Ubicacion</dt>
            <dd>{workshopCase.intakeLocation || 'Taller principal'}</dd>
          </div>
          <div>
            <dt>Reportado por</dt>
            <dd>{workshopCase.reportedByName || workshopCase.driverName || 'Sin responsable'}</dd>
          </div>
          <div>
            <dt>Odometro</dt>
            <dd>{workshopCase.odometerAtEntry ? `${workshopCase.odometerAtEntry.toLocaleString('es-CL')} km` : 'No informado'}</dd>
          </div>
        </dl>
      </div>
    </Card>
  )
}

interface OperatorPanelProps {
  onAssign: () => void
  workshopCase: WorkshopCase
}

function OperatorPanel({ onAssign, workshopCase }: OperatorPanelProps) {
  return (
    <section className={styles.operatorPanel}>
      <div className="split-row">
        <div>
          <h2>Responsables operativos</h2>
          <p className="muted-text">Equipo asociado al caso y disponibilidad para avanzar.</p>
        </div>
        <Button disabled={workshopCase.status === 'closed'} icon={<UserPlus size={17} />} onClick={onAssign} size="sm" variant="secondary">
          {workshopCase.mechanicName ? 'Reasignar' : 'Asignar'}
        </Button>
      </div>
      <div className={styles.operatorGrid}>
        <div className={styles.operatorItem}>
          <span>Mecanico</span>
          <strong>{workshopCase.mechanicName || 'Sin asignar'}</strong>
        </div>
        <div className={styles.operatorItem}>
          <span>Bodega</span>
          <strong>{workshopCase.warehouseManagerName || 'Sin asignar'}</strong>
        </div>
        <div className={styles.operatorItem}>
          <span>Entrega</span>
          <strong>{workshopCase.estimatedDeliveryAt ? new Date(workshopCase.estimatedDeliveryAt).toLocaleDateString('es-CL') : 'Por definir'}</strong>
        </div>
      </div>
    </section>
  )
}
