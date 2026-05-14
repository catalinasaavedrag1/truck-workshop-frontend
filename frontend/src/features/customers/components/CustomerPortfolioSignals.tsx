import { Badge } from '../../../shared/components/Badge/Badge'
import { EntityLink } from '../../../shared/components/EntityLink'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type { Customer360Snapshot } from '../utils/customer360'

interface CustomerPortfolioSignalsProps {
  snapshots: Customer360Snapshot[]
}

export function CustomerPortfolioSignals({ snapshots }: CustomerPortfolioSignalsProps) {
  const prioritized = [...snapshots]
    .sort((first, second) => getSignalScore(second) - getSignalScore(first))
    .slice(0, 3)

  if (prioritized.length === 0) {
    return <p className="muted-text">Crea clientes para activar la vista consolidada de cartera.</p>
  }

  return (
    <div className="three-column-grid compact-grid">
      {prioritized.map((snapshot) => {
        const primaryAlert = snapshot.alerts[0]

        return (
          <div className="surface-panel stack-tight" key={snapshot.customer.id}>
            <div className="split-row">
              <EntityLink id={snapshot.customer.id} type="customer">
                {snapshot.customer.name}
              </EntityLink>
              <Badge tone={primaryAlert.tone}>{primaryAlert.label}</Badge>
            </div>
            <div className="three-column-grid compact-grid">
              <SignalMetric label="Operaciones" value={snapshot.metrics.activeOperations} />
              <SignalMetric label="Pipeline" value={formatCurrency(snapshot.metrics.pipelineTotal)} />
              <SignalMetric
                label="Ultima"
                value={snapshot.metrics.lastActivityAt ? formatDate(snapshot.metrics.lastActivityAt) : 'Sin actividad'}
              />
            </div>
            <p className="muted-text">{primaryAlert.message}</p>
          </div>
        )
      })}
    </div>
  )
}

function SignalMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span className="muted-text">{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function getSignalScore(snapshot: Customer360Snapshot) {
  const dangerAlerts = snapshot.alerts.filter((alert) => alert.tone === 'danger').length
  const warningAlerts = snapshot.alerts.filter((alert) => alert.tone === 'warning').length

  return dangerAlerts * 100 + warningAlerts * 40 + snapshot.metrics.activeOperations * 5 + snapshot.metrics.pendingQuotes
}
