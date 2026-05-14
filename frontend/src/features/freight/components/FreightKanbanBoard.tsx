import type { KeyboardEvent, MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, MapPinned, UserRound } from 'lucide-react'
import { Badge } from '../../../shared/components/Badge/Badge'
import { EntityLink } from '../../../shared/components/EntityLink'
import { formatDate } from '../../../shared/utils/formatDate'
import { CARGO_TYPE_LABELS } from '../constants/cargoType.constants'
import type { FreightRequestOperation } from '../utils/freightOperations'
import { FREIGHT_FLOW_STEPS } from '../utils/freightOperations'
import { FreightRequestStatusBadge } from './FreightRequestStatusBadge'
import styles from './FreightModule.module.css'

interface FreightKanbanBoardProps {
  onSelectRequest: (requestId: string) => void
  operations: FreightRequestOperation[]
  selectedRequestId?: string
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement ? Boolean(target.closest('a, button, [data-row-click-ignore]')) : false
}

export function FreightKanbanBoard({ onSelectRequest, operations, selectedRequestId }: FreightKanbanBoardProps) {
  const handleCardClick = (event: MouseEvent<HTMLElement>, requestId: string) => {
    if (!isInteractiveTarget(event.target)) {
      onSelectRequest(requestId)
    }
  }

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>, requestId: string) => {
    if (isInteractiveTarget(event.target)) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelectRequest(requestId)
    }
  }

  return (
    <div className={styles.kanbanBoard} aria-label="Control tower por etapa">
      {FREIGHT_FLOW_STEPS.map((stage) => {
        const stageOperations = operations.filter((operation) => operation.stage === stage.key)

        return (
          <section className={styles.kanbanColumn} key={stage.key}>
            <div className={styles.kanbanHeader}>
              <strong>{stage.label}</strong>
              <Badge tone={stageOperations.some((operation) => operation.risk.level === 'critical') ? 'danger' : 'neutral'}>
                {stageOperations.length}
              </Badge>
            </div>
            <div className={styles.kanbanCards}>
              {stageOperations.length > 0 ? (
                stageOperations.map((operation) => (
                  <article
                    aria-label={`Abrir solicitud ${operation.request.requestNumber}`}
                    className={[
                      styles.kanbanCard,
                      selectedRequestId === operation.request.id ? styles.kanbanCardActive : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    key={operation.request.id}
                    onClick={(event) => handleCardClick(event, operation.request.id)}
                    onKeyDown={(event) => handleCardKeyDown(event, operation.request.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.kanbanCardTop}>
                      <EntityLink id={operation.request.id} type="freightRequest">
                        {operation.request.requestNumber}
                      </EntityLink>
                      <Badge tone={operation.risk.tone}>{operation.risk.label}</Badge>
                    </div>
                    <strong>{operation.request.customerName}</strong>
                    <span className={styles.kanbanRoute}>
                      <MapPinned aria-hidden size={14} />
                      {operation.request.originAddress} {'->'} {operation.request.destinationAddress}
                    </span>
                    <div className={styles.kanbanMeta}>
                      <span>
                        <Clock aria-hidden size={14} />
                        {operation.request.requestedPickupDate ? formatDate(operation.request.requestedPickupDate) : 'Sin retiro'}
                      </span>
                      <span>
                        <UserRound aria-hidden size={14} />
                        {operation.responsible}
                      </span>
                    </div>
                    <div className={styles.kanbanFooter}>
                      <FreightRequestStatusBadge status={operation.request.status} />
                      <span>{CARGO_TYPE_LABELS[operation.request.cargoType]}</span>
                    </div>
                    <Link className={styles.nextAction} data-row-click-ignore to={operation.nextStep.path}>
                      {operation.nextStep.actionLabel} <ArrowRight aria-hidden size={14} />
                    </Link>
                  </article>
                ))
              ) : (
                <div className={styles.kanbanEmpty}>Sin solicitudes en esta etapa.</div>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
