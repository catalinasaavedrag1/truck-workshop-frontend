import { Badge } from '../../../shared/components/Badge/Badge'
import {
  FREIGHT_FLOW_STEPS,
  getFreightRequestStage,
  getFreightStageIndex,
  type FreightFlowStage,
} from '../utils/freightOperations'
import type { FreightRequest } from '../types/freight.types'
import styles from './FreightModule.module.css'

interface FreightFlowStepperProps {
  activeStage?: FreightFlowStage
  counts?: Partial<Record<FreightFlowStage, number>>
  request?: FreightRequest
  title?: string
}

export function FreightFlowStepper({
  activeStage,
  counts,
  request,
  title = 'Flujo operacional del flete',
}: FreightFlowStepperProps) {
  const stage = activeStage ?? (request ? getFreightRequestStage(request) : 'request')
  const activeIndex = getFreightStageIndex(stage)
  const stopped = request ? ['CANCELLED', 'REJECTED'].includes(request.status) : false

  return (
    <section className={styles.flowPanel}>
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
            </div>
          )
        })}
      </div>
    </section>
  )
}
