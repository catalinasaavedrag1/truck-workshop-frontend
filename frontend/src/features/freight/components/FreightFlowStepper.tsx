import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import {
  FREIGHT_FLOW_STEPS,
  getFreightNextStep,
  getFreightRisk,
  getFreightRequestStage,
  getFreightStageIndex,
  type FreightFlowStage,
} from '../utils/freightOperations'
import type { FreightAssignment, FreightQuote, FreightRequest } from '../types/freight.types'
import styles from './FreightModule.module.css'

interface FreightFlowStepperProps {
  activeStage?: FreightFlowStage
  assignment?: FreightAssignment
  counts?: Partial<Record<FreightFlowStage, number>>
  quote?: FreightQuote
  request?: FreightRequest
  showStageMeta?: boolean
  title?: string
}

export function FreightFlowStepper({
  activeStage,
  assignment,
  counts,
  quote,
  request,
  showStageMeta = false,
  title = 'Flujo operacional del flete',
}: FreightFlowStepperProps) {
  const stage = activeStage ?? (request ? getFreightRequestStage(request) : 'request')
  const activeIndex = getFreightStageIndex(stage)
  const stopped = request ? ['CANCELLED', 'REJECTED'].includes(request.status) : false
  const risk = request ? getFreightRisk(request, quote, assignment) : undefined
  const nextStep = request ? getFreightNextStep(request, quote, assignment) : undefined

  return (
    <section className={[styles.flowPanel, showStageMeta ? styles.flowPanelSticky : ''].filter(Boolean).join(' ')}>
      <div className={styles.flowHeader}>
        <div>
          <h2>{title}</h2>
          <p>Solicitud, cotizacion, aprobacion, asignacion, despacho, seguimiento y cierre.</p>
        </div>
        {request ? <Badge tone={stopped ? 'danger' : 'info'}>{request.requestNumber}</Badge> : null}
      </div>
      <div className={styles.flowSteps}>
        {FREIGHT_FLOW_STEPS.map((step, index) => {
          const stepState =
            stopped && step.key === stage
              ? styles.flowStepStopped
              : index < activeIndex
                ? styles.flowStepCompleted
                : index === activeIndex
                  ? styles.flowStepActive
                  : ''

          return (
            <div className={[styles.flowStep, stepState].filter(Boolean).join(' ')} key={step.key}>
              {counts ? <span className={styles.flowStepCount}>{counts[step.key] ?? 0}</span> : null}
              <strong>{step.shortLabel}</strong>
              <span>{step.description}</span>
              {showStageMeta ? (
                <div className={styles.flowStepMeta}>
                  <Badge tone={getStepTone({ activeIndex, index, riskLevel: risk?.level, stopped })}>
                    {getStepStateLabel({ activeIndex, index, riskLabel: risk?.label, riskLevel: risk?.level, stopped })}
                  </Badge>
                  <small>
                    {index === activeIndex && nextStep
                      ? `${nextStep.owner} / ${nextStep.actionLabel}`
                      : index < activeIndex
                        ? 'Completada'
                        : 'Pendiente'}
                  </small>
                  {index === activeIndex && request ? <small>Actualizado {formatCompactDate(request.updatedAt)}</small> : null}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function formatCompactDate(value: string) {
  return value ? value.slice(0, 16).replace('T', ' ') : 'sin fecha'
}

function getStepTone({
  activeIndex,
  index,
  riskLevel,
  stopped,
}: {
  activeIndex: number
  index: number
  riskLevel?: string
  stopped: boolean
}): BadgeTone {
  if (stopped && index === activeIndex) {
    return 'danger'
  }

  if (index < activeIndex) {
    return 'success'
  }

  if (index === activeIndex && riskLevel === 'critical') {
    return 'danger'
  }

  if (index === activeIndex && riskLevel === 'attention') {
    return 'warning'
  }

  if (index === activeIndex) {
    return 'info'
  }

  return 'neutral'
}

function getStepStateLabel({
  activeIndex,
  index,
  riskLabel,
  riskLevel,
  stopped,
}: {
  activeIndex: number
  index: number
  riskLabel?: string
  riskLevel?: string
  stopped: boolean
}) {
  if (stopped && index === activeIndex) {
    return 'Detenida'
  }

  if (index < activeIndex) {
    return 'Completa'
  }

  if (index === activeIndex && riskLevel === 'critical') {
    return riskLabel || 'Critica'
  }

  if (index === activeIndex && riskLevel === 'attention') {
    return riskLabel || 'Atencion'
  }

  if (index === activeIndex) {
    return 'En curso'
  }

  return 'Pendiente'
}
