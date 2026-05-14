import { Card } from '../../../shared/components/Card/Card'
import { SlaBadge } from '../../sla/components/SlaBadge'
import { SlaProgressBar } from '../../sla/components/SlaProgressBar'
import { SlaTimer } from '../../sla/components/SlaTimer'
import { getSlaSnapshot } from '../../sla/mocks/sla.mock'
import type { WorkshopCase } from '../types/workshopCase.types'

interface CaseSlaPanelProps {
  workshopCase: WorkshopCase
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function CaseSlaPanel({ workshopCase }: CaseSlaPanelProps) {
  const snapshot = getSlaSnapshot(workshopCase.slaId, workshopCase.slaDueAt, workshopCase.createdAt)

  return (
    <Card>
      <div className="stack">
        <div className="split-row">
          <h2 className="section-title">SLA del caso</h2>
          <SlaBadge status={snapshot.status} />
        </div>
        <dl className="detail-list">
          <div>
            <dt>Limite</dt>
            <dd>{formatDateTime(snapshot.dueAt)}</dd>
          </div>
          <div>
            <dt>Tiempo restante</dt>
            <dd>
              <SlaTimer dueAt={snapshot.dueAt} />
            </dd>
          </div>
          <div>
            <dt>Consumo</dt>
            <dd>{snapshot.consumedPercent}%</dd>
          </div>
        </dl>
        <SlaProgressBar consumedPercent={snapshot.consumedPercent} status={snapshot.status} />
      </div>
    </Card>
  )
}
