import { ArrowUpRight, CheckCircle2, ClipboardCheck, FileText, UserPlus, Wrench } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import type { WorkshopCase } from '../types/workshopCase.types'
import type { CaseNextStep, CaseWorkflowStageId } from '../utils/workshopCaseWorkflow'
import { getStageDefinition } from '../utils/workshopCaseWorkflow'
import styles from './WorkshopCaseLayout.module.css'

interface StageActionBarProps {
  activeStageId: CaseWorkflowStageId
  nextStep: CaseNextStep
  onAssign: () => void
  onCloseCase: () => void
  onEscalate: () => void
  onPrimaryAction: () => void
  workshopCase: WorkshopCase
}

export function StageActionBar({
  activeStageId,
  nextStep,
  onAssign,
  onCloseCase,
  onEscalate,
  onPrimaryAction,
  workshopCase,
}: StageActionBarProps) {
  const isClosed = workshopCase.status === 'closed'
  const hasResponsible = Boolean(workshopCase.mechanicId || workshopCase.assignedMechanicId)
  const stage = getStageDefinition(activeStageId)

  return (
    <section className={styles.actionBar} aria-label="Acciones de la etapa">
      <div className={styles.actionContext}>
        <span className={styles.eyebrow}>Etapa actual</span>
        <strong>{stage.label}</strong>
        <span>{stage.description}</span>
      </div>
      <div className={styles.actionButtons}>
        <Button disabled={isClosed} icon={getPrimaryIcon(nextStep.stageId)} onClick={onPrimaryAction} size="sm">
          {nextStep.actionLabel}
        </Button>
        <Button disabled={isClosed} icon={<UserPlus size={17} />} onClick={onAssign} size="sm" variant="secondary">
          {hasResponsible ? 'Reasignar' : 'Asignar'}
        </Button>
        <Button disabled={isClosed} icon={<ArrowUpRight size={17} />} onClick={onEscalate} size="sm" variant="secondary">
          Escalar
        </Button>
        <Button disabled={isClosed} icon={<CheckCircle2 size={17} />} onClick={onCloseCase} size="sm" variant="secondary">
          Cerrar
        </Button>
      </div>
    </section>
  )
}

function getPrimaryIcon(stageId: CaseWorkflowStageId) {
  if (stageId === 'diagnosis') {
    return <ClipboardCheck size={17} />
  }

  if (stageId === 'quote' || stageId === 'approval') {
    return <FileText size={17} />
  }

  if (stageId === 'repair') {
    return <Wrench size={17} />
  }

  if (stageId === 'closure') {
    return <CheckCircle2 size={17} />
  }

  return <UserPlus size={17} />
}
