import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ClipboardCheck, Clock3, Eye, History, Paperclip, Save, Truck, UserRound } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { casesMock } from '../../../mocks/cases.mock'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceItem } from '../../../shared/hooks/useResourceItem'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { formatDate } from '../../../shared/utils/formatDate'
import {
  DiagnosticChecklistPanel,
  type ChecklistProgress,
} from '../../diagnostic-checklists/components/DiagnosticChecklistPanel'
import { SlaTimer } from '../../sla/components/SlaTimer'
import { CasePriorityBadge } from '../../workshop-cases/components/CasePriorityBadge'
import { CaseStatusBadge } from '../../workshop-cases/components/CaseStatusBadge'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import { DiagnosticForm } from '../components/DiagnosticForm'
import styles from '../components/DiagnosticWorkspace.module.css'
import { useCaseDiagnostics } from '../hooks/useCaseDiagnostics'
import type { Diagnostic } from '../types/diagnostic.types'

const DIAGNOSTIC_FORM_ID = 'diagnostic-workstation-form'
const EMPTY_CHECKLIST_PROGRESS: ChecklistProgress = {
  completedItems: 0,
  estimatedMinutes: 0,
  requiredItems: 0,
  totalItems: 0,
}

const CASE_FLOW_STEPS = ['Recepcion', 'Diagnostico', 'Cotizacion', 'Aprobacion', 'Reparacion', 'Cierre']

export function DiagnosticPage() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const [savedDiagnostic, setSavedDiagnostic] = useState<Diagnostic | null>(null)
  const [checklistProgress, setChecklistProgress] = useState<ChecklistProgress>(EMPTY_CHECKLIST_PROGRESS)
  const { data: workshopCase } = useResourceItem<WorkshopCase>('/cases', caseId, casesMock)
  const {
    data: diagnostics,
    errorMessage,
    isLoading,
    prepend,
  } = useCaseDiagnostics(caseId)
  const visibleDiagnostic = savedDiagnostic || diagnostics[0] || null
  const caseLabel = workshopCase?.caseNumber || (caseId ? `Caso ${caseId}` : 'Caso')
  const caseRoute = caseId ? ROUTES.caseDetail(caseId) : ROUTES.cases

  const handleSaved = (diagnostic: Diagnostic) => {
    setSavedDiagnostic(diagnostic)
    prepend(diagnostic)
  }

  return (
    <PageContainer>
      <div className={styles.page}>
        <PageHeader
          actions={
            <Button disabled={!caseId} form={DIAGNOSTIC_FORM_ID} icon={<Save size={18} />} type="submit">
              Guardar diagnostico
            </Button>
          }
          breadcrumbs={[
            { label: 'Taller', href: ROUTES.cases },
            { label: caseLabel, href: caseRoute },
            { label: 'Diagnostico' },
          ]}
          description="Registro tecnico de sintomas, causa probable y severidad."
          title="Diagnostico tecnico"
        >
          <div className={styles.contextBar}>
            <span className={styles.contextItem}>
              <ClipboardCheck size={15} />
              <span className={styles.contextLabel}>Estado</span>
              {workshopCase ? <CaseStatusBadge status={workshopCase.status} /> : <Badge tone="neutral">Sin caso</Badge>}
            </span>
            <span className={styles.contextItem}>
              <span className={styles.contextLabel}>Prioridad</span>
              {workshopCase ? <CasePriorityBadge priority={workshopCase.priority} /> : <Badge tone="neutral">Pendiente</Badge>}
            </span>
            <span className={styles.contextItem}>
              <Clock3 size={15} />
              <span className={styles.contextLabel}>SLA</span>
              {workshopCase?.slaDueAt ? <SlaTimer dueAt={workshopCase.slaDueAt} /> : 'Sin SLA'}
            </span>
            <span className={styles.contextItem}>
              <Truck size={15} />
              <span className={styles.contextLabel}>Camion</span>
              {workshopCase?.truckPlate || 'Sin patente'}
            </span>
            <span className={styles.contextItem}>
              <UserRound size={15} />
              <span className={styles.contextLabel}>Chofer</span>
              {workshopCase?.driverName || 'Sin chofer'}
            </span>
          </div>
        </PageHeader>

        <CaseFlowStepper />

        <div className={styles.workspace}>
          <main className={styles.mainColumn}>
            <DiagnosticForm
              caseId={caseId}
              formId={DIAGNOSTIC_FORM_ID}
              onSaved={handleSaved}
              showActions={false}
            />
            <DiagnosticChecklistPanel onProgressChange={setChecklistProgress} />
          </main>

          <aside className={styles.sideColumn}>
            <OperationalCasePanel
              caseRoute={caseRoute}
              checklistProgress={checklistProgress}
              diagnostic={visibleDiagnostic}
              diagnosticsError={errorMessage}
              diagnosticsLoading={isLoading}
              workshopCase={workshopCase}
            />
          </aside>
        </div>

        <div aria-label="Acciones del diagnostico" className={styles.stickyActions}>
          <div className={styles.footerActions}>
            <Button icon={<ArrowLeft size={17} />} onClick={() => navigate(caseRoute)} type="button" variant="secondary">
              Volver al caso
            </Button>
            <small>
              Checklist {checklistProgress.completedItems}/{checklistProgress.totalItems} - {checklistProgress.estimatedMinutes} min estimados
            </small>
            <div className={styles.footerButtonGroup}>
              <Button disabled={!caseId} form={DIAGNOSTIC_FORM_ID} icon={<Save size={18} />} type="submit">
                Guardar diagnostico
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

function CaseFlowStepper() {
  return (
    <ol aria-label="Flujo del caso" className={styles.stepper}>
      {CASE_FLOW_STEPS.map((step, index) => {
        const className = [
          styles.step,
          index < 1 ? styles.stepDone : '',
          index === 1 ? styles.stepActive : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <li aria-current={index === 1 ? 'step' : undefined} className={className} key={step}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{step}</strong>
          </li>
        )
      })}
    </ol>
  )
}

interface OperationalCasePanelProps {
  caseRoute: string
  checklistProgress: ChecklistProgress
  diagnostic: Diagnostic | null
  diagnosticsError: string
  diagnosticsLoading: boolean
  workshopCase?: WorkshopCase
}

function OperationalCasePanel({
  caseRoute,
  checklistProgress,
  diagnostic,
  diagnosticsError,
  diagnosticsLoading,
  workshopCase,
}: OperationalCasePanelProps) {
  const checklistPercent =
    checklistProgress.totalItems > 0
      ? Math.round((checklistProgress.completedItems / checklistProgress.totalItems) * 100)
      : 0

  return (
    <Card className={styles.sidePanel}>
      <div className={styles.panelHeader}>
        <div>
          <h2>Resumen del caso</h2>
          <p>Contexto tecnico y operacional sin salir del diagnostico.</p>
        </div>
        <ClipboardCheck size={20} />
      </div>

      <dl className={styles.summaryList}>
        <div>
          <dt>Caso</dt>
          <dd>{workshopCase?.caseNumber || 'Sin caso'}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>{workshopCase ? <CaseStatusBadge status={workshopCase.status} /> : <Badge tone="neutral">Pendiente</Badge>}</dd>
        </div>
        <div>
          <dt>Prioridad</dt>
          <dd>{workshopCase ? <CasePriorityBadge priority={workshopCase.priority} /> : <Badge tone="neutral">Pendiente</Badge>}</dd>
        </div>
        <div>
          <dt>SLA</dt>
          <dd>{workshopCase?.slaDueAt ? <SlaTimer dueAt={workshopCase.slaDueAt} /> : 'Sin SLA'}</dd>
        </div>
        <div>
          <dt>Camion</dt>
          <dd>
            <span>{workshopCase?.truckPlate || 'Sin patente'}</span>
          </dd>
        </div>
        <div>
          <dt>Chofer</dt>
          <dd>
            <span>{workshopCase?.driverName || 'Sin chofer'}</span>
          </dd>
        </div>
        <div>
          <dt>Ultima actividad</dt>
          <dd>
            <span>{getLatestActivity(diagnostic, workshopCase)}</span>
          </dd>
        </div>
        <div>
          <dt>Proximo paso</dt>
          <dd>
            <span>{getSuggestedNextStep(checklistProgress)}</span>
          </dd>
        </div>
      </dl>

      <div className={styles.progressBlock}>
        <div className={styles.progressMeta}>
          <span>Checklist completado</span>
          <strong>
            {checklistProgress.completedItems}/{checklistProgress.totalItems}
          </strong>
        </div>
        <div className={styles.progressBar} aria-label={`Checklist completado ${checklistPercent}%`}>
          <span style={{ width: `${checklistPercent}%` }} />
        </div>
        <span className={styles.muted}>{checklistProgress.requiredItems} tareas obligatorias visibles.</span>
      </div>

      <LatestDiagnosticPreview
        diagnostic={diagnostic}
        diagnosticsError={diagnosticsError}
        diagnosticsLoading={diagnosticsLoading}
      />

      <div className={styles.quickActions}>
        <Link to={caseRoute}>
          <Eye size={14} />
          Ver caso
        </Link>
        <button disabled title="La carga de evidencia aun no tiene flujo dedicado en esta vista." type="button">
          <Paperclip size={14} />
          Evidencia
        </button>
        <Link to={caseRoute}>
          <History size={14} />
          Historial
        </Link>
      </div>
    </Card>
  )
}

interface LatestDiagnosticPreviewProps {
  diagnostic: Diagnostic | null
  diagnosticsError: string
  diagnosticsLoading: boolean
}

function LatestDiagnosticPreview({ diagnostic, diagnosticsError, diagnosticsLoading }: LatestDiagnosticPreviewProps) {
  if (diagnosticsLoading) {
    return (
      <div className={styles.resultPreview}>
        <strong>Ultimo diagnostico</strong>
        <p>Cargando diagnosticos del caso...</p>
      </div>
    )
  }

  if (diagnosticsError) {
    return (
      <div className={styles.resultPreview}>
        <strong>Ultimo diagnostico</strong>
        <p>{diagnosticsError}</p>
      </div>
    )
  }

  if (!diagnostic) {
    return (
      <div className={styles.resultPreview}>
        <strong>Ultimo diagnostico</strong>
        <p>Sin diagnosticos registrados. Completa el formulario y guarda el avance tecnico.</p>
      </div>
    )
  }

  return (
    <div className={styles.resultPreview}>
      <strong>{diagnostic.rootCause}</strong>
      <p>
        Severidad {diagnostic.severity} - {diagnostic.symptoms.slice(0, 2).join(' / ') || 'sin sintomas asociados'}
      </p>
      <p>{formatDate(diagnostic.createdAt)}</p>
    </div>
  )
}

function getLatestActivity(diagnostic: Diagnostic | null, workshopCase?: WorkshopCase) {
  if (diagnostic?.updatedAt) {
    return `Diagnostico actualizado ${formatDate(diagnostic.updatedAt)}`
  }

  if (diagnostic?.createdAt) {
    return `Diagnostico creado ${formatDate(diagnostic.createdAt)}`
  }

  if (workshopCase?.updatedAt) {
    return `Caso actualizado ${formatDate(workshopCase.updatedAt)}`
  }

  return 'Sin actividad reciente'
}

function getSuggestedNextStep(checklistProgress: ChecklistProgress) {
  if (checklistProgress.totalItems === 0) {
    return 'Cargar checklist tecnico'
  }

  if (checklistProgress.completedItems < checklistProgress.totalItems) {
    return 'Completar checklist y guardar'
  }

  return 'Guardar diagnostico y pasar a cotizacion'
}
