import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { FreightAssignment, FreightQuote, FreightRequest } from '../types/freight.types'
import {
  FREIGHT_FLOW_STEPS,
  type FreightFlowStage,
  formatHours,
  getFreightStageInsights,
} from '../utils/freightOperations'
import styles from './FreightModule.module.css'

interface FreightStagePipelineProps {
  activeStage: FreightFlowStage | 'all'
  assignments: FreightAssignment[]
  onStageChange: (stage: FreightFlowStage | 'all') => void
  quotes: FreightQuote[]
  requests: FreightRequest[]
}

export function FreightStagePipeline({
  activeStage,
  assignments,
  onStageChange,
  quotes,
  requests,
}: FreightStagePipelineProps) {
  const insights = getFreightStageInsights(requests, quotes, assignments)

  return (
    <section className={styles.stagePipeline} aria-label="Flujo visual de solicitudes">
      <div className={styles.stagePipelineHeader}>
        <div>
          <h2>Flujo de solicitudes</h2>
          <p>Cuellos de botella por etapa, tiempo detenido y accion operativa.</p>
        </div>
        <button
          className={[styles.stageReset, activeStage === 'all' ? styles.stageResetActive : ''].filter(Boolean).join(' ')}
          onClick={() => onStageChange('all')}
          type="button"
        >
          Ver todo
        </button>
      </div>
      <div className={styles.stageGrid}>
        {FREIGHT_FLOW_STEPS.map((step) => {
          const insight = insights.find((item) => item.key === step.key)
          const isActive = activeStage === step.key
          const tone: BadgeTone = insight?.criticalCount
            ? 'danger'
            : insight?.blockedCount
              ? 'warning'
              : insight?.count
                ? 'info'
                : 'neutral'

          return (
            <button
              className={[styles.stageCard, isActive ? styles.stageCardActive : ''].filter(Boolean).join(' ')}
              key={step.key}
              onClick={() => onStageChange(step.key)}
              type="button"
            >
              <span className={styles.stageIndex}>{String(FREIGHT_FLOW_STEPS.indexOf(step) + 1).padStart(2, '0')}</span>
              <div className={styles.stageTitleRow}>
                <strong>{step.label}</strong>
                <Badge tone={tone}>{insight?.count ?? 0}</Badge>
              </div>
              <p>{insight?.description || step.description}</p>
              <div className={styles.stageSignals}>
                <span>{insight?.blockedCount ?? 0} bloqueadas</span>
                <span>{insight?.criticalCount ?? 0} criticas</span>
                <span>{formatHours(insight?.averageHoldHours ?? 0)} detenido</span>
              </div>
              <small>Accion: {insight?.actionLabel || 'revisar'}</small>
            </button>
          )
        })}
      </div>
    </section>
  )
}
