import { AlertTriangle, BadgeCheck, CalendarClock, FileText, ShieldCheck, Ticket } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Card } from '../../../shared/components/Card/Card'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import {
  driverDocumentStatusLabels,
  driverDocumentStatusTones,
  driverDocumentTypeLabels,
  driverFineSeverityLabels,
  driverFineSeverityTones,
  driverFineStatusLabels,
  driverFineStatusTones,
} from '../constants/driverCompliance.constants'
import type { Driver, DriverDocument, DriverFine } from '../types/driver.types'
import { getDriverComplianceSummary } from '../utils/driverCompliance'
import styles from './DriverCompliancePanel.module.css'

interface DriverCompliancePanelProps {
  documents: DriverDocument[]
  driver: Driver
  fines: DriverFine[]
}

export function DriverCompliancePanel({ documents, driver, fines }: DriverCompliancePanelProps) {
  const summary = getDriverComplianceSummary(driver, documents, fines)
  const sortedDocuments = [...documents].sort((first, second) => {
    const priority = { EXPIRED: 0, MISSING: 1, EXPIRES_SOON: 2, VALID: 3 }
    return priority[first.status] - priority[second.status]
  })
  const sortedFines = [...fines].sort((first, second) => new Date(second.occurredAt).getTime() - new Date(first.occurredAt).getTime())

  return (
    <Card className={styles.panel}>
      <div className={styles.decision}>
        <div className={styles.decisionHeader}>
          <div className={styles.decisionCopy}>
            <h2>Cumplimiento del chofer</h2>
            <p>{summary.helper}</p>
          </div>
          <Badge tone={summary.tone}>{summary.decision}</Badge>
        </div>
        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span>Documentos observados</span>
            <strong>{summary.documentIssueCount}</strong>
          </div>
          <div className={styles.metric}>
            <span>Multas abiertas</span>
            <strong>{summary.activeFineCount}</strong>
          </div>
          <div className={styles.metric}>
            <span>Monto pendiente</span>
            <strong>{formatCurrency(summary.activeFineAmount)}</strong>
          </div>
          <div className={styles.metric}>
            <span>Multas vencidas</span>
            <strong>{summary.overdueFineCount}</strong>
          </div>
        </div>
        <div className={styles.flow}>
          <div className={styles.flowStep}>
            <strong>
              <FileText aria-hidden size={15} /> 1. Revisar documentos
            </strong>
            <span className={styles.muted}>Licencia, certificado medico, psicotecnico y capacitaciones.</span>
          </div>
          <div className={styles.flowStep}>
            <strong>
              <Ticket aria-hidden size={15} /> 2. Validar multas
            </strong>
            <span className={styles.muted}>Detecta multas abiertas, vencidas o ligadas a incidentes.</span>
          </div>
          <div className={styles.flowStep}>
            <strong>
              <ShieldCheck aria-hidden size={15} /> 3. Decidir salida
            </strong>
            <span className={styles.muted}>La decision se muestra antes de asignar ruta o camion.</span>
          </div>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionCopy}>
            <h3>Documentacion</h3>
            <p>Vigencias que afectan si el chofer puede operar.</p>
          </div>
          <Badge tone={summary.documentIssueCount > 0 ? 'warning' : 'success'}>{documents.length} registros</Badge>
        </div>
        <div className={styles.docList}>
          {sortedDocuments.length > 0 ? (
            sortedDocuments.map((document) => (
              <div className={styles.row} key={document.id}>
                <div className={styles.rowTitle}>
                  <strong>{driverDocumentTypeLabels[document.documentType]}</strong>
                  <span>{document.documentNumber || 'Sin numero registrado'}</span>
                </div>
                <div className={styles.rowTitle}>
                  <span>Vence</span>
                  <strong>{document.expiresAt ? formatDate(document.expiresAt) : 'Sin fecha'}</strong>
                </div>
                <Badge tone={driverDocumentStatusTones[document.status]}>
                  {driverDocumentStatusLabels[document.status]}
                </Badge>
              </div>
            ))
          ) : (
            <p className={styles.empty}>No hay documentos cargados para este chofer.</p>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionCopy}>
            <h3>Multas e infracciones</h3>
            <p>Eventos que pueden bloquear asignaciones o requerir aprobacion del supervisor.</p>
          </div>
          <Badge tone={summary.activeFineCount > 0 ? 'danger' : 'success'}>{summary.activeFineCount} abiertas</Badge>
        </div>
        <div className={styles.fineList}>
          {sortedFines.length > 0 ? (
            sortedFines.map((fine) => (
              <div className={styles.row} key={fine.id}>
                <div className={styles.rowTitle}>
                  <strong>{fine.fineNumber}</strong>
                  <span>{fine.description}</span>
                </div>
                <div className={styles.rowTitle}>
                  <span>
                    <CalendarClock aria-hidden size={13} /> {formatDate(fine.occurredAt)} - {fine.location}
                  </span>
                  <strong>{fine.fineType}</strong>
                </div>
                <div className={styles.fineAmount}>
                  <strong>{formatCurrency(fine.amount || 0)}</strong>
                  <span className="inline-actions">
                    <Badge tone={driverFineSeverityTones[fine.severity]}>
                      {driverFineSeverityLabels[fine.severity]}
                    </Badge>
                    <Badge tone={driverFineStatusTones[fine.status]}>{driverFineStatusLabels[fine.status]}</Badge>
                  </span>
                  {fine.incidentId ? (
                    <Link className="muted-text" to={ROUTES.incidentDetail(fine.incidentId)}>
                      Ver incidente
                    </Link>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <p className={styles.empty}>
              <BadgeCheck aria-hidden size={14} /> Sin multas registradas para este chofer.
            </p>
          )}
        </div>
      </section>

      {summary.tone === 'danger' ? (
        <p className={styles.empty}>
          <AlertTriangle aria-hidden size={14} /> Antes de asignar este chofer, regulariza documentos o multas abiertas.
        </p>
      ) : null}
    </Card>
  )
}
