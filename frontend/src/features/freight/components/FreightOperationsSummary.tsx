import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import type { FreightAssignment, FreightQuote, FreightRequest } from '../types/freight.types'
import { findAssignmentForRequest, getFreightPriority, getFreightRequestStage } from '../utils/freightOperations'
import styles from './FreightModule.module.css'

interface FreightOperationsSummaryProps {
  assignments: FreightAssignment[]
  quotes: FreightQuote[]
  requests: FreightRequest[]
}

export function FreightOperationsSummary({ assignments, quotes, requests }: FreightOperationsSummaryProps) {
  const quoting = requests.filter((request) => ['NEW', 'QUOTING'].includes(request.status)).length
  const waitingDecision = requests.filter((request) => request.status === 'QUOTE_SENT').length
  const readyToAssign = requests.filter(
    (request) => request.status === 'APPROVED' && !findAssignmentForRequest(assignments, request.id),
  ).length
  const running = assignments.filter((assignment) => ['SCHEDULED', 'IN_TRANSIT'].includes(assignment.status)).length
  const critical = requests.filter((request) => getFreightPriority(request).level === 'critical').length
  const sentQuotes = quotes.filter((quote) => quote.status === 'SENT').length

  const items = [
    {
      label: 'Solicitudes por cotizar',
      path: ROUTES.freightRequests,
      value: quoting,
      helper: 'Ingreso y tarifa preliminar',
    },
    {
      label: 'Decisiones pendientes',
      path: ROUTES.freightQuotes,
      value: waitingDecision || sentQuotes,
      helper: 'Cotizaciones enviadas',
    },
    {
      label: 'Listas para asignar',
      path: ROUTES.freightAssignments,
      value: readyToAssign,
      helper: 'Aprobadas sin camion',
    },
    {
      label: 'Programadas / ruta',
      path: ROUTES.freightAssignments,
      value: running,
      helper: 'Despacho y seguimiento',
    },
    {
      label: 'Alertas operativas',
      path: ROUTES.freightRequests,
      value: critical,
      helper: 'Retiro vencido o 24 h',
    },
  ]

  const counts = requests.reduce(
    (current, request) => ({
      ...current,
      [getFreightRequestStage(request)]: (current[getFreightRequestStage(request)] ?? 0) + 1,
    }),
    {} as Record<string, number>,
  )

  return (
    <section className={styles.flowPanel}>
      <div className={styles.flowHeader}>
        <div>
          <h2>Control operacional de fletes</h2>
          <p>Lectura unica para venta, programacion y despacho.</p>
        </div>
      </div>
      <div className={styles.opsGrid}>
        {items.map((item) => (
          <Link className={styles.opsItem} key={item.label} to={item.path}>
            <small>{item.label}</small>
            <strong>{item.value}</strong>
            <span>{item.helper}</span>
          </Link>
        ))}
      </div>
      <div className={styles.flowSteps}>
        {['request', 'quote', 'approval', 'assignment', 'dispatch', 'tracking', 'closure'].map((stage) => (
          <div className={styles.flowStep} key={stage}>
            <span className={styles.flowStepCount}>{counts[stage] ?? 0}</span>
            <strong>{stageLabel(stage)}</strong>
            <span>{stageHint(stage)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function stageLabel(stage: string) {
  const labels: Record<string, string> = {
    approval: 'Aprobacion',
    assignment: 'Asignacion',
    closure: 'Cierre',
    dispatch: 'Despacho',
    quote: 'Cotizacion',
    request: 'Solicitud',
    tracking: 'Seguimiento',
  }

  return labels[stage] || stage
}

function stageHint(stage: string) {
  const hints: Record<string, string> = {
    approval: 'cliente decide',
    assignment: 'camion y chofer',
    closure: 'entrega final',
    dispatch: 'salida programada',
    quote: 'tarifa activa',
    request: 'datos base',
    tracking: 'en ruta',
  }

  return hints[stage] || ''
}
