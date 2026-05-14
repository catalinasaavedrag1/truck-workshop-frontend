import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { EntityLink } from '../../../shared/components/EntityLink'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import type { Mechanic } from '../types/mechanic.types'
import type { MechanicOperationalSummary } from '../utils/mechanicOperations'
import { MechanicAvailabilityBadge } from './MechanicAvailabilityBadge'
import styles from './MechanicView.module.css'

interface MechanicTableProps {
  isLoading?: boolean
  mechanics: Mechanic[]
  summaryByMechanicId: Map<string, MechanicOperationalSummary>
}

export function MechanicTable({ isLoading = false, mechanics, summaryByMechanicId }: MechanicTableProps) {
  const columns: TableColumn<Mechanic>[] = [
    {
      header: 'Mecanico',
      key: 'name',
      render: (item) => (
        <div className={styles.mechanicCell}>
          <EntityLink id={item.id} type="mechanic">
            {item.name}
          </EntityLink>
          <span className="muted-text">{item.specialty || 'Sin especialidad'} - {item.shift || 'Sin turno'}</span>
          <span className="muted-text">{item.email || item.userName || 'Sin usuario vinculado'}</span>
        </div>
      ),
      sortValue: (item) => item.name,
    },
    {
      header: 'Decision operativa',
      key: 'decision',
      render: (item) => {
        const summary = summaryByMechanicId.get(item.id)

        return summary ? (
          <div className={styles.mechanicCell}>
            <span className={styles.badgeLine}>
              <MechanicAvailabilityBadge availability={item.availability} />
              <Badge tone={summary.decision.tone}>{summary.decision.label}</Badge>
            </span>
            <span className={styles.helperText}>{summary.remainingCapacity} cupos libres</span>
          </div>
        ) : (
          <MechanicAvailabilityBadge availability={item.availability} />
        )
      },
      searchableValue: (item) => summaryByMechanicId.get(item.id)?.decision.label,
      sortValue: (item) => summaryByMechanicId.get(item.id)?.decision.label || item.availability,
    },
    {
      align: 'right',
      header: 'Carga',
      key: 'load',
      render: (item) => {
        const summary = summaryByMechanicId.get(item.id)
        const activeCases = summary?.activeCaseCount ?? item.activeCases
        const maxCases = Math.max(1, item.maxCases)
        const usage = summary?.capacityUsedPercent ?? Math.round((activeCases / maxCases) * 100)

        return (
          <div className={styles.loadCell}>
            <strong>{activeCases}/{item.maxCases}</strong>
            <div className={styles.progressTrack} aria-hidden>
              <span style={{ width: `${Math.min(100, usage)}%` }} />
            </div>
            <span className="muted-text">{summary?.loadLabel || `${usage}% ocupado`}</span>
          </div>
        )
      },
      sortValue: (item) => summaryByMechanicId.get(item.id)?.capacityUsedPercent ?? item.activeCases,
    },
    {
      header: 'Riesgo taller',
      key: 'risk',
      render: (item) => {
        const summary = summaryByMechanicId.get(item.id)

        if (!summary || (summary.slaRiskCases === 0 && summary.blockedByParts === 0 && summary.highPriorityCases === 0)) {
          return <Badge tone="success">Sin alertas</Badge>
        }

        return (
          <span className={styles.riskLine}>
            {summary.slaRiskCases > 0 ? <Badge tone="warning">{summary.slaRiskCases} SLA</Badge> : null}
            {summary.blockedByParts > 0 ? <Badge tone="warning">{summary.blockedByParts} repuestos</Badge> : null}
            {summary.criticalCases > 0 ? <Badge tone="danger">{summary.criticalCases} criticos</Badge> : null}
          </span>
        )
      },
      searchableValue: (item) => {
        const summary = summaryByMechanicId.get(item.id)
        return summary ? `${summary.slaRiskCases} sla ${summary.blockedByParts} repuestos ${summary.criticalCases} criticos` : ''
      },
      sortValue: (item) => {
        const summary = summaryByMechanicId.get(item.id)
        return summary ? summary.slaRiskCases + summary.blockedByParts + summary.criticalCases : 0
      },
    },
    {
      align: 'right',
      header: 'Agenda',
      key: 'schedule',
      render: (item) => {
        const summary = summaryByMechanicId.get(item.id)

        return (
          <div className={styles.mechanicCell}>
            <strong>{summary?.scheduleEvents.length ?? 0} bloques</strong>
            <span className="muted-text">{summary?.scheduledHours ?? 0} h programadas</span>
          </div>
        )
      },
      sortValue: (item) => summaryByMechanicId.get(item.id)?.scheduledHours ?? 0,
    },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <Link to={ROUTES.mechanicDetail(item.id)}>
          <Button size="sm" variant="secondary">
            Abrir ficha
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={mechanics}
      density="compact"
      enableSearch
      emptyDescription="Crea un mecanico para poder asignar casos, planificar agenda y medir carga del taller."
      getRowHref={(item) => ROUTES.mechanicDetail(item.id)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir ficha del mecanico ${item.name}`}
      getSearchText={(item) => {
        const summary = summaryByMechanicId.get(item.id)

        return [
          item.name,
          item.userName,
          item.email,
          item.specialty,
          item.shift,
          item.availability,
          summary?.decision.label,
          summary?.decision.helper,
          summary?.loadLabel,
        ].join(' ')
      }}
      initialSort={{ direction: 'desc', key: 'risk' }}
      isLoading={isLoading}
      searchPlaceholder="Buscar mecanico, especialidad, turno, riesgo o disponibilidad"
    />
  )
}
