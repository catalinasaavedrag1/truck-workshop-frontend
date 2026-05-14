import { ArrowUpRight } from 'lucide-react'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import { ESCALATION_LEVEL_LABELS } from '../constants/escalation.constants'
import type { EscalationEvent } from '../types/escalation.types'
import { EscalationHistory } from './EscalationHistory'
import { EscalationReasonBadge } from './EscalationReasonBadge'
import styles from './EscalationPanel.module.css'

interface EscalationPanelProps {
  events: EscalationEvent[]
  workshopCase: WorkshopCase
  onEscalate: () => void
}

export function EscalationPanel({ events, workshopCase, onEscalate }: EscalationPanelProps) {
  const isEscalated = workshopCase.escalationLevel !== 'LEVEL_0_NORMAL'
  const latestEvent = events[0]

  return (
    <Card>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <h2 className="section-title">Escalamiento</h2>
            <p className="muted-text">Nivel actual, motivo y trazabilidad de decisiones.</p>
          </div>
          <Badge tone={isEscalated ? 'warning' : 'success'}>{ESCALATION_LEVEL_LABELS[workshopCase.escalationLevel]}</Badge>
        </div>

        <div className={styles.statusBox}>
          <div>
            <span className={styles.eyebrow}>Estado</span>
            <strong>{isEscalated ? 'Requiere gestion superior' : 'Sin escalamiento activo'}</strong>
          </div>
          {workshopCase.escalationReason ? <EscalationReasonBadge reason={workshopCase.escalationReason} /> : null}
        </div>

        {latestEvent ? (
          <div className={styles.latestEvent}>
            <span className={styles.eyebrow}>Ultimo movimiento</span>
            <p>{latestEvent.comment}</p>
            <small>{latestEvent.createdBy}</small>
          </div>
        ) : null}

        <Button fullWidth icon={<ArrowUpRight size={18} />} onClick={onEscalate} variant={isEscalated ? 'primary' : 'secondary'}>
          {isEscalated ? 'Subir escalamiento' : 'Escalar caso'}
        </Button>

        <EscalationHistory events={events} />
      </div>
    </Card>
  )
}
