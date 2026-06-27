import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Activity, AlertTriangle, CheckCircle2, RefreshCw, ShieldAlert, Wrench } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EntityLink } from '../../../shared/components/EntityLink'
import { FilterBar } from '../../../shared/components/FilterBar/FilterBar'
import { MetricCard } from '../../../shared/components/MetricCard/MetricCard'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { Select } from '../../../shared/components/Select/Select'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { operationalStatusLabels, operationalStatusTones } from '../constants/fleet.constants'
import { fleetTrucksMock, truckHealthScoresMock } from '../mocks/fleet.mock'
import {
  buildFleetHealthFallbackOverview,
  getFleetHealthScoreOverview,
  recalculateFleetHealthScores,
} from '../services/fleetHealthScore.service'
import type {
  FleetHealthScoreOverview,
  FleetHealthScoreRow,
  TruckHealthActionState,
  TruckHealthRiskCategory,
  TruckHealthStatus,
} from '../types/fleet.types'
import styles from './TruckHealthScorePage.module.css'

const statusOptions = [
  { label: 'Todos los estados', value: 'all' },
  { label: 'Operativo sano', value: 'HEALTHY' },
  { label: 'Atencion', value: 'WARNING' },
  { label: 'Riesgo operativo', value: 'RISK' },
  { label: 'Critico', value: 'CRITICAL' },
]

const actionOptions = [
  { label: 'Todas las acciones', value: 'all' },
  { label: 'Aptos despacho', value: 'DISPATCH_READY' },
  { label: 'Revisar antes de asignar', value: 'REVIEW_BEFORE_ASSIGNMENT' },
  { label: 'Bloqueados', value: 'BLOCKED' },
]

const riskCategoryLabels: Record<TruckHealthRiskCategory, string> = {
  COSTS: 'Costos',
  DOCUMENTS: 'Documentos',
  FUEL: 'Combustible',
  INCIDENTS: 'Incidencias',
  MAINTENANCE: 'Mantencion',
  NONE: 'Sin riesgo',
  OPERATIONAL: 'Operacion',
  TELEMETRY: 'GPS',
}

const actionStateLabels: Record<TruckHealthActionState, string> = {
  BLOCKED: 'Bloquear',
  DISPATCH_READY: 'Apto despacho',
  REVIEW_BEFORE_ASSIGNMENT: 'Revisar',
}

function isHealthStatus(value: string | null): value is TruckHealthStatus {
  return value === 'HEALTHY' || value === 'WARNING' || value === 'RISK' || value === 'CRITICAL'
}

function isActionState(value: string | null): value is TruckHealthActionState {
  return value === 'BLOCKED' || value === 'DISPATCH_READY' || value === 'REVIEW_BEFORE_ASSIGNMENT'
}

export function TruckHealthScorePage() {
  const [searchParams] = useSearchParams()
  const statusQuery = searchParams.get('status')
  const fallbackOverview = useMemo(
    () => buildFleetHealthFallbackOverview(fleetTrucksMock, truckHealthScoresMock),
    [],
  )
  const [overview, setOverview] = useState<FleetHealthScoreOverview>(fallbackOverview)
  const [query, setQuery] = useState(searchParams.get('query') || searchParams.get('truck') || '')
  const [statusFilter, setStatusFilter] = useState<TruckHealthStatus | 'all'>(
    isHealthStatus(statusQuery) ? statusQuery : 'all',
  )
  const [actionFilter, setActionFilter] = useState<TruckHealthActionState | 'all'>(
    isActionState(statusQuery) ? statusQuery : 'all',
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isRecalculating, setIsRecalculating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const loadOverview = useCallback(
    async (mode: 'read' | 'recalculate' = 'read') => {
      const recalculating = mode === 'recalculate'
      setErrorMessage('')
      setIsLoading(!recalculating)
      setIsRecalculating(recalculating)

      try {
        const nextOverview = recalculating
          ? await recalculateFleetHealthScores('Operaciones')
          : await getFleetHealthScoreOverview()

        setOverview(nextOverview)
      } catch (error) {
        setOverview(fallbackOverview)
        setErrorMessage(`${getApiErrorMessage(error)}. Mostrando respaldo local hasta recuperar backend.`)
      } finally {
        setIsLoading(false)
        setIsRecalculating(false)
      }
    },
    [fallbackOverview, setErrorMessage, setIsLoading, setIsRecalculating, setOverview],
  )

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadOverview()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [loadOverview])

  const filteredRows = useMemo(() => {
    const normalizedQuery = normalizeSearch(query)

    return overview.rows.filter((row) => {
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter
      const matchesAction = actionFilter === 'all' || row.actionState === actionFilter
      const searchableText = normalizeSearch(
        [
          row.plate,
          row.truckLabel,
          row.assignedDriverName,
          row.mainBlocker,
          row.summary,
          row.nextAction,
          riskCategoryLabels[row.topRiskCategory],
        ].join(' '),
      )

      return matchesStatus && matchesAction && (!normalizedQuery || searchableText.includes(normalizedQuery))
    })
  }, [actionFilter, overview.rows, query, statusFilter])

  const activeFilters = [
    statusFilter !== 'all'
      ? {
          label: 'Estado',
          onRemove: () => setStatusFilter('all'),
          value: statusOptions.find((option) => option.value === statusFilter)?.label,
        }
      : undefined,
    actionFilter !== 'all'
      ? {
          label: 'Accion',
          onRemove: () => setActionFilter('all'),
          value: actionOptions.find((option) => option.value === actionFilter)?.label,
        }
      : undefined,
    query
      ? {
          label: 'Busqueda',
          onRemove: () => setQuery(''),
          value: query,
        }
      : undefined,
  ].filter(Boolean)

  const worstRows = filteredRows.slice(0, 3)
  const columns = useMemo<TableColumn<FleetHealthScoreRow>[]>(
    () => [
      {
        header: 'Camion',
        key: 'truck',
        render: (row) => (
          <div className={styles.truckCell}>
            <EntityLink id={row.truckId} type="truck">
              {row.plate}
            </EntityLink>
            <span>{[row.brand, row.model].filter(Boolean).join(' ') || row.truckId}</span>
            <small>{row.assignedDriverName || 'Sin chofer asignado'}</small>
          </div>
        ),
        searchableValue: (row) => row.truckLabel,
        sortValue: (row) => row.plate,
      },
      {
        header: 'Score',
        key: 'score',
        render: (row) => <ScoreCell row={row} />,
        sortValue: (row) => row.score,
      },
      {
        header: 'Estado',
        key: 'status',
        render: (row) => (
          <div className={styles.statusStack}>
            <Badge tone={getScoreTone(row.status)}>{row.statusLabel}</Badge>
            <Badge tone={getActionTone(row.actionState)}>{actionStateLabels[row.actionState]}</Badge>
            <Badge tone={operationalStatusTones[row.operationalStatus]}>{operationalStatusLabels[row.operationalStatus]}</Badge>
          </div>
        ),
        sortValue: (row) => row.status,
      },
      {
        header: 'Riesgos principales',
        key: 'risks',
        render: (row) => (
          <div className={styles.riskList}>
            {row.deductions.length > 0 ? (
              row.deductions.slice(0, 3).map((deduction) => (
                <span key={`${row.truckId}-${deduction.label}`}>
                  {deduction.label} <strong>-{deduction.points}</strong>
                </span>
              ))
            ) : (
              <span>Sin descuentos relevantes</span>
            )}
          </div>
        ),
        searchableValue: (row) => row.deductions.map((item) => item.label).join(' '),
        sortValue: (row) => row.topRiskCategory,
      },
      {
        header: 'Accion',
        key: 'action',
        render: (row) => <p className={styles.actionText}>{row.nextAction}</p>,
        searchableValue: (row) => row.nextAction,
        sortable: false,
      },
      {
        align: 'right',
        header: 'Costo/km',
        key: 'costPerKm',
        render: (row) => <strong>{row.costPerKm > 0 ? formatCurrency(row.costPerKm) : '-'}</strong>,
        sortValue: (row) => row.costPerKm,
      },
    ],
    [],
  )

  return (
    <PageContainer>
      <PageHeader
        actions={
          <>
            <Button
              disabled={isLoading || isRecalculating}
              icon={<RefreshCw size={17} />}
              onClick={() => void loadOverview()}
              type="button"
              variant="secondary"
            >
              Actualizar
            </Button>
            <Button
              disabled={isLoading || isRecalculating}
              icon={<Activity size={17} />}
              onClick={() => void loadOverview('recalculate')}
              type="button"
            >
              {isRecalculating ? 'Recalculando...' : 'Recalcular backend'}
            </Button>
          </>
        }
        description="Que camiones pueden salir, cuales revisar y cuales bloquear."
        title="Health Score flota"
      />

      {errorMessage ? <div className={styles.warningBanner}>{errorMessage}</div> : null}

      <div className={styles.metricGrid}>
        <MetricCard
          helper="Promedio calculado con riesgos vivos"
          icon={<Activity size={18} />}
          label="Score flota"
          tone={overview.summary.averageScore >= 85 ? 'success' : overview.summary.averageScore >= 70 ? 'warning' : 'danger'}
          to={ROUTES.fleetHealthScore}
          value={`${overview.summary.averageScore}/100`}
        />
        <MetricCard
          helper="Pueden entrar a planificacion"
          icon={<CheckCircle2 size={18} />}
          label="Aptos despacho"
          tone="success"
          to={`${ROUTES.fleetHealthScore}?status=DISPATCH_READY`}
          value={overview.summary.dispatchReady}
        />
        <MetricCard
          helper="Revisar antes de asignar"
          icon={<Wrench size={18} />}
          label="Con observacion"
          tone="warning"
          to={`${ROUTES.fleetHealthScore}?status=REVIEW_BEFORE_ASSIGNMENT`}
          value={overview.summary.reviewRequired}
        />
        <MetricCard
          helper={overview.summary.worstTruck ? `${overview.summary.worstTruck.plate} con ${overview.summary.worstTruck.score}/100` : 'Sin datos'}
          icon={<ShieldAlert size={18} />}
          label="Bloqueados"
          tone="danger"
          to={`${ROUTES.fleetHealthScore}?status=BLOCKED`}
          value={overview.summary.blocked}
        />
      </div>

      <Card className={styles.controlPanel}>
        <div className={styles.distributionHeader}>
          <div>
            <h2>Distribucion operacional</h2>
            <p>Lectura rapida por estado de riesgo y reglas de decision.</p>
          </div>
          <span>Actualizado {formatDate(overview.generatedAt)}</span>
        </div>
        <div className={styles.distributionBar} aria-label="Distribucion health score">
          <span className={styles.healthy} style={{ width: percent(overview.summary.healthy, overview.summary.total) }} />
          <span className={styles.warning} style={{ width: percent(overview.summary.warning, overview.summary.total) }} />
          <span className={styles.risk} style={{ width: percent(overview.summary.risk, overview.summary.total) }} />
          <span className={styles.critical} style={{ width: percent(overview.summary.critical, overview.summary.total) }} />
        </div>
        <div className={styles.ruleGrid}>
          {Object.entries(overview.rules).map(([status, rule]) => (
            <div key={status}>
              <Badge tone={getScoreTone(status as TruckHealthStatus)}>{statusOptions.find((option) => option.value === status)?.label}</Badge>
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </Card>

      <FilterBar
        activeCount={activeFilters.length}
        activeFilters={activeFilters}
        clearLabel="Limpiar filtros"
        description="Filtra por patente, chofer, bloqueo, riesgo o accion requerida."
        onClear={() => {
          setActionFilter('all')
          setQuery('')
          setStatusFilter('all')
        }}
        title="Control health score"
      >
        <label className={styles.searchField} htmlFor="health-score-search">
          <span>Buscar</span>
          <input
            id="health-score-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Patente, chofer, riesgo o accion"
            type="search"
            value={query}
          />
        </label>
        <Select
          label="Estado score"
          onChange={(event) => setStatusFilter(event.target.value as TruckHealthStatus | 'all')}
          options={statusOptions}
          value={statusFilter}
        />
        <Select
          label="Accion operacional"
          onChange={(event) => setActionFilter(event.target.value as TruckHealthActionState | 'all')}
          options={actionOptions}
          value={actionFilter}
        />
      </FilterBar>

      <div className={styles.riskBoard}>
        {worstRows.map((row) => (
          <Card className={styles.riskCard} key={row.truckId}>
            <div className={styles.riskCardHeader}>
              <span className={styles.riskIcon}>
                <AlertTriangle aria-hidden size={17} />
              </span>
              <div>
                <EntityLink id={row.truckId} type="truck">
                  {row.plate}
                </EntityLink>
                <small>{riskCategoryLabels[row.topRiskCategory]} · {row.score}/100</small>
              </div>
            </div>
            <p>{row.nextAction}</p>
          </Card>
        ))}
      </div>

      <Table
        columns={columns}
        data={filteredRows}
        density="compact"
        emptyDescription="Ajusta filtros o recalcula desde backend para obtener datos actualizados."
        emptyLabel="Sin camiones para mostrar"
        enablePagination
        getRowHref={(row) => ROUTES.fleetTruckDetail(row.truckId)}
        getRowKey={(row) => row.truckId}
        getRowLabel={(row) => `Abrir camion ${row.plate}`}
        isLoading={isLoading}
        loadingLabel="Calculando health score operacional"
        pageSize={10}
      />
    </PageContainer>
  )
}

function ScoreCell({ row }: { row: FleetHealthScoreRow }) {
  const delta = row.scoreDelta

  return (
    <div className={styles.scoreCell}>
      <div className={styles.scoreLine}>
        <strong>{row.score}/100</strong>
        {delta !== 0 ? <span className={delta > 0 ? styles.deltaUp : styles.deltaDown}>{delta > 0 ? '+' : ''}{delta}</span> : null}
      </div>
      <div className={styles.scoreTrack} aria-label={`Score ${row.score}`}>
        <span className={styles[getScoreClass(row.status)]} style={{ width: `${row.score}%` }} />
      </div>
    </div>
  )
}

function getScoreTone(status: TruckHealthStatus): BadgeTone {
  if (status === 'HEALTHY') {
    return 'success'
  }

  if (status === 'WARNING') {
    return 'warning'
  }

  return 'danger'
}

function getActionTone(actionState: TruckHealthActionState): BadgeTone {
  if (actionState === 'DISPATCH_READY') {
    return 'success'
  }

  if (actionState === 'REVIEW_BEFORE_ASSIGNMENT') {
    return 'warning'
  }

  return 'danger'
}

function getScoreClass(status: TruckHealthStatus) {
  if (status === 'HEALTHY') {
    return 'healthy'
  }

  if (status === 'WARNING') {
    return 'warning'
  }

  if (status === 'RISK') {
    return 'risk'
  }

  return 'critical'
}

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function percent(value: number, total: number) {
  if (total <= 0 || value <= 0) {
    return '0%'
  }

  return `${Math.max(4, Math.round((value / total) * 100))}%`
}
