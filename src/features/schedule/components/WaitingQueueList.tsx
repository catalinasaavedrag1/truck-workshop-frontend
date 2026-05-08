import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { formatDate } from '../../../shared/utils/formatDate'
import { SlaBadge } from '../../sla/components/SlaBadge'
import { CasePriorityBadge } from '../../workshop-cases/components/CasePriorityBadge'
import type { WaitingQueueItem } from '../types/schedule.types'
import styles from './SchedulePlanner.module.css'

interface WaitingQueueListProps {
  queue: WaitingQueueItem[]
  onPlan: (item: WaitingQueueItem) => void
}

export function WaitingQueueList({ onPlan, queue }: WaitingQueueListProps) {
  if (queue.length === 0) {
    return <p className="muted-text">No hay casos en cola.</p>
  }

  return (
    <div className={styles.queueList}>
      {queue.map((item) => (
        <div className={styles.queueItem} key={item.id}>
          <div className="split-row">
            <strong>{item.caseNumber}</strong>
            <span className="muted-text">{item.estimatedHours} h</span>
          </div>
          <div>
            <span>{item.customerName}</span>
            <p className="muted-text">
              {item.truckPlate} - {item.reason} - {formatDate(item.requestedAt)}
            </p>
          </div>
          <div className="inline-actions">
            <CasePriorityBadge priority={item.priority} />
            <SlaBadge status={item.slaStatus} />
            {item.hasPartsBlock ? <Badge tone="warning">Repuestos</Badge> : null}
          </div>
          <div className={styles.compactActions}>
            <Button onClick={() => onPlan(item)} size="sm" type="button">
              Agendar
            </Button>
            <Link to={ROUTES.caseDetail(item.caseId)}>
              <Button size="sm" variant="secondary">
                Ver caso
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
