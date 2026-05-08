import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardList, Gauge, PackageSearch } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Card } from '../../../shared/components/Card/Card'
import { formatDate } from '../../../shared/utils/formatDate'
import type { Mechanic } from '../types/mechanic.types'
import type { MechanicOperationalSummary } from '../utils/mechanicOperations'
import { MechanicAvailabilityBadge } from './MechanicAvailabilityBadge'
import styles from './MechanicView.module.css'

interface MechanicOperationalPanelProps {
  mechanic: Mechanic
  summary: MechanicOperationalSummary
}

export function MechanicOperationalPanel({ mechanic, summary }: MechanicOperationalPanelProps) {
  const nextEvent = summary.nextEvent

  return (
    <Card className={styles.operationalPanel}>
      <div className={styles.decisionHeader}>
        <div className={styles.identityBlock}>
          <div className={styles.avatar} aria-hidden>
            {mechanic.name
              .split(' ')
              .slice(0, 2)
              .map((part) => part.charAt(0))
              .join('')}
          </div>
          <div>
            <div className={styles.badgeLine}>
              <MechanicAvailabilityBadge availability={mechanic.availability} />
              <Badge tone={summary.decision.tone}>{summary.decision.label}</Badge>
            </div>
            <h2>{mechanic.name}</h2>
            <p>{mechanic.specialty || 'Especialidad no registrada'} - Turno {mechanic.shift || 'sin turno'}</p>
          </div>
        </div>
        <div className={styles.decisionBox}>
          <strong>{summary.decision.label}</strong>
          <span>{summary.decision.helper}</span>
        </div>
      </div>

      <div className={styles.metricGrid}>
        <Metric icon={<Gauge size={18} />} label="Carga activa" value={`${summary.activeCaseCount}/${mechanic.maxCases}`} tone={summary.loadTone} />
        <Metric icon={<ClipboardList size={18} />} label="SLA en riesgo" value={summary.slaRiskCases} tone={summary.slaRiskCases > 0 ? 'warning' : 'success'} />
        <Metric icon={<PackageSearch size={18} />} label="Bloqueos repuesto" value={summary.blockedByParts} tone={summary.blockedByParts > 0 ? 'warning' : 'success'} />
        <Metric icon={<CalendarClock size={18} />} label="Horas agenda" value={`${summary.scheduledHours} h`} tone="info" />
      </div>

      <div className={styles.loadSection}>
        <div className="split-row">
          <span className="muted-text">{summary.loadLabel}</span>
          <strong>{summary.capacityUsedPercent}% ocupado</strong>
        </div>
        <div className={styles.progressTrack}>
          <span style={{ width: `${summary.capacityUsedPercent}%` }} />
        </div>
      </div>

      <div className={styles.nextBlock}>
        <div>
          <strong>Proximo foco operativo</strong>
          <p>
            {nextEvent
              ? `${nextEvent.caseNumber} - ${nextEvent.title} - ${formatDate(nextEvent.startsAt)}`
              : 'No tiene bloques de agenda registrados.'}
          </p>
        </div>
        {nextEvent ? (
          <Link to={ROUTES.caseDetail(nextEvent.caseId)}>Abrir caso</Link>
        ) : (
          <Link to={ROUTES.assignments}>Asignar caso</Link>
        )}
      </div>

      {summary.breachedCases > 0 ? (
        <p className={styles.warningNote}>
          <AlertTriangle aria-hidden size={14} /> Tiene casos con SLA vencido. Prioriza cierre, diagnostico o escalamiento.
        </p>
      ) : (
        <p className={styles.successNote}>
          <CheckCircle2 aria-hidden size={14} /> No registra SLA vencido en sus casos activos.
        </p>
      )}
    </Card>
  )
}

interface MetricProps {
  icon: ReactNode
  label: string
  tone: 'danger' | 'info' | 'neutral' | 'success' | 'warning'
  value: number | string
}

function Metric({ icon, label, tone, value }: MetricProps) {
  return (
    <div className={[styles.metric, styles[tone]].join(' ')}>
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  )
}
