import { Activity, AlertTriangle, MessagesSquare, WalletCards } from 'lucide-react'
import { Badge } from '../../../shared/components/Badge/Badge'
import { MetricCard } from '../../../shared/components/MetricCard/MetricCard'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type { Customer360Snapshot } from '../utils/customer360'

interface Customer360OverviewProps {
  snapshot: Customer360Snapshot
}

export function Customer360Overview({ snapshot }: Customer360OverviewProps) {
  const { metrics } = snapshot
  const alertTone = snapshot.alerts.some((alert) => alert.tone === 'danger')
    ? 'danger'
    : snapshot.alerts.some((alert) => alert.tone === 'warning')
      ? 'warning'
      : 'success'

  return (
    <div className="stack">
      <div className="metric-grid">
        <MetricCard
          helper={`${metrics.openWorkshopCases} casos taller abiertos`}
          icon={<Activity aria-hidden size={18} />}
          label="Operaciones activas"
          tone={metrics.activeOperations > 0 ? 'info' : 'neutral'}
          value={metrics.activeOperations}
        />
        <MetricCard
          helper={`${metrics.pendingQuotes} cotizaciones pendientes`}
          icon={<WalletCards aria-hidden size={18} />}
          label="Pipeline comercial"
          tone={metrics.pipelineTotal > 0 ? 'warning' : 'neutral'}
          value={formatCurrency(metrics.pipelineTotal)}
        />
        <MetricCard
          helper={`Margen neto ${formatCurrency(metrics.netMargin)}`}
          label="Margen fletes"
          tone={metrics.profitabilityMarginPercent >= 25 ? 'success' : metrics.profitabilityMarginPercent > 0 ? 'warning' : 'neutral'}
          value={metrics.profitabilityMarginPercent > 0 ? `${metrics.profitabilityMarginPercent}%` : 'Sin cierre'}
        />
        <MetricCard
          helper={metrics.lastActivityAt ? `Ultima actividad ${formatDate(metrics.lastActivityAt)}` : 'Sin actividad reciente'}
          icon={<MessagesSquare aria-hidden size={18} />}
          label="Comunicaciones abiertas"
          tone={metrics.openCommunications > 0 ? 'info' : 'neutral'}
          value={metrics.openCommunications}
        />
      </div>
      <div className="surface-panel stack-tight">
        <div className="split-row">
          <strong>Semaforo del cliente</strong>
          <Badge tone={alertTone}>{snapshot.alerts.length} senal(es)</Badge>
        </div>
        <div className="three-column-grid compact-grid">
          {snapshot.alerts.map((alert) => (
            <div className="surface-panel stack-tight" key={`${alert.label}-${alert.message}`}>
              <div className="split-row">
                <strong>{alert.label}</strong>
                <Badge tone={alert.tone}>
                  {alert.tone === 'danger' ? <AlertTriangle aria-hidden size={13} /> : null}
                  {alert.tone === 'success' ? 'OK' : alert.tone}
                </Badge>
              </div>
              <p className="muted-text">{alert.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
