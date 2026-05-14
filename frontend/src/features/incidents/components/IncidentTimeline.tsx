import { Card } from '../../../shared/components/Card/Card'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type { Incident } from '../types/incidents.types'
import { IncidentSeverityBadge } from './IncidentSeverityBadge'
import { IncidentStatusBadge } from './IncidentStatusBadge'
import { IncidentTypeBadge } from './IncidentTypeBadge'

interface IncidentTimelineProps {
  incident: Incident
}

export function IncidentTimeline({ incident }: IncidentTimelineProps) {
  return (
    <Card>
      <h2 className="section-title">Seguimiento</h2>
      <div className="timeline">
        <div className="timeline-step">
          <span className="timeline-dot">1</span>
          <div>
            <div className="split-row">
              <strong>Incidente registrado</strong>
              <IncidentTypeBadge type={incident.incidentType} />
            </div>
            <p className="muted-text">{formatDate(incident.occurredAt)} - {incident.location}</p>
          </div>
        </div>
        <div className="timeline-step">
          <span className="timeline-dot">2</span>
          <div>
            <div className="split-row">
              <strong>Evaluacion de impacto</strong>
              <IncidentSeverityBadge severity={incident.severity} />
            </div>
            <p className="muted-text">
              {formatCurrency(incident.estimatedCost || 0)} estimados / {incident.notes || 'Seguimiento pendiente por operaciones.'}
            </p>
          </div>
        </div>
        <div className="timeline-step">
          <span className="timeline-dot">3</span>
          <div>
            <div className="split-row">
              <strong>Derivacion operacional</strong>
              <IncidentStatusBadge status={incident.status} />
            </div>
            <p className="muted-text">
              {incident.workshopCaseId
                ? `Conectado a caso taller ${incident.workshopCaseId}.`
                : incident.freightId
                  ? `Conectado a flete ${incident.freightId}.`
                  : 'Pendiente conectar con taller, flete, chofer o costos segun corresponda.'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
