import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Fuel,
  Gauge,
  ReceiptText,
  Route,
  ShieldCheck,
  Truck,
  Users,
  Wallet,
} from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { FilterBar } from '../../../shared/components/FilterBar/FilterBar'
import { Input } from '../../../shared/components/Input/Input'
import { MetricCard } from '../../../shared/components/MetricCard/MetricCard'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { Select } from '../../../shared/components/Select/Select'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { getDriverPerformanceReport } from '../services/driverPerformanceReport.service'
import type {
  DriverPerformanceReportData,
  DriverPerformanceRiskLevel,
  DriverPerformanceRow,
} from '../types/report.types'
import styles from './DriverPerformanceReportPage.module.css'

const periodOptions = [
  { label: '30 dias', value: '30' },
  { label: '60 dias', value: '60' },
  { label: '90 dias', value: '90' },
  { label: '180 dias', value: '180' },
  { label: '365 dias', value: '365' },
]

const statusOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Activos', value: 'active' },
  { label: 'Inactivos', value: 'inactive' },
]

const riskOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Aptos', value: 'READY' },
  { label: 'Revisar', value: 'REVIEW' },
  { label: 'Bloqueados', value: 'BLOCKED' },
]

const riskLabels: Record<DriverPerformanceRiskLevel, string> = {
  BLOCKED: 'Bloqueado',
  READY: 'Apto',
  REVIEW: 'Revisar',
}

const riskSortWeight: Record<DriverPerformanceRiskLevel, number> = {
  BLOCKED: 0,
  REVIEW: 1,
  READY: 2,
}

function emptyReport(): DriverPerformanceReportData {
  const now = new Date().toISOString()

  return {
    filters: {
      driverId: 'all',
      from: now,
      periodDays: 90,
      risk: 'all',
      status: 'all',
      to: now,
    },
    generatedAt: now,
    rows: [],
    summary: {
      activeDrivers: 0,
      averageFuelEfficiency: 0,
      averageOperationalScore: 0,
      blockedDrivers: 0,
      driversWithTrips: 0,
      readyDrivers: 0,
      reviewDrivers: 0,
      totalActiveFines: 0,
      totalDriverDocumentsIssues: 0,
      totalExpenses: 0,
      totalIncidentCost: 0,
      totalKm: 0,
      totalNetMargin: 0,
      totalOpenIncidents: 0,
      totalRevenue: 0,
      totalSheets: 0,
      totalWaitingHours: 0,
    },
  }
}

function formatNumber(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat('es-CL', { maximumFractionDigits }).format(value)
}

function formatPercent(value: number | null) {
  return value === null ? 'Sin dato' : `${formatNumber(value)}%`
}

function scoreTone(value: number): BadgeTone {
  if (value >= 82) return 'success'
  if (value >= 70) return 'warning'
  return 'danger'
}

function riskTone(value: DriverPerformanceRiskLevel): BadgeTone {
  if (value === 'READY') return 'success'
  if (value === 'REVIEW') return 'warning'
  return 'danger'
}

function shortDate(value: string | null) {
  return value ? formatDate(value) : 'Sin actividad'
}

export function DriverPerformanceReportPage() {
  const [searchParams] = useSearchParams()
  const [report, setReport] = useState<DriverPerformanceReportData>(() => emptyReport())
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [periodDays, setPeriodDays] = useState(90)
  const [risk, setRisk] = useState<DriverPerformanceRiskLevel | 'all'>('all')
  const [status, setStatus] = useState<'active' | 'all' | 'inactive'>('all')
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(() => searchParams.get('driverId'))

  useEffect(() => {
    let mounted = true

    const loadReport = async () => {
      setIsLoading(true)
      const data = await getDriverPerformanceReport({
        periodDays,
        risk,
        search: query,
        status,
      })

      if (mounted) {
        setReport(data)
        setIsLoading(false)
      }
    }

    void loadReport()

    return () => {
      mounted = false
    }
  }, [periodDays, query, risk, status])

  const selectedRow = useMemo(
    () => report.rows.find((row) => row.driverId === selectedDriverId) || report.rows[0] || null,
    [report.rows, selectedDriverId],
  )
  const activeCount = (query ? 1 : 0) + (periodDays !== 90 ? 1 : 0) + (risk !== 'all' ? 1 : 0) + (status !== 'all' ? 1 : 0)

  const columns = useMemo<TableColumn<DriverPerformanceRow>[]>(
    () => [
      {
        header: 'Chofer',
        key: 'driverName',
        render: (item) => (
          <div className={styles.driverCell}>
            <strong>{item.driverName}</strong>
            <span>
              {item.document} / {item.license}
            </span>
            <small>{item.assignedTruck ? item.assignedTruck.plate : 'Sin camion asignado'}</small>
          </div>
        ),
      },
      {
        align: 'right',
        header: 'Score',
        key: 'operationalScore',
        render: (item) => (
          <div className={styles.scoreStack}>
            <Badge tone={scoreTone(item.scores.operationalScore)}>{item.scores.operationalScore}/100</Badge>
            <span>{item.performanceBand}</span>
          </div>
        ),
        sortValue: (item) => item.scores.operationalScore,
      },
      {
        align: 'right',
        header: 'Decision',
        key: 'riskLevel',
        render: (item) => <Badge tone={riskTone(item.riskLevel)}>{riskLabels[item.riskLevel]}</Badge>,
        sortValue: (item) => riskSortWeight[item.riskLevel],
      },
      {
        align: 'right',
        header: 'Viajes',
        key: 'sheets',
        render: (item) => (
          <div className="stack-tight">
            <strong>{item.tripMetrics.sheets}</strong>
            <span className="muted-text">{formatNumber(item.route.kmReal, 0)} km</span>
          </div>
        ),
        sortValue: (item) => item.tripMetrics.sheets,
      },
      {
        align: 'right',
        header: 'Margen',
        key: 'margin',
        render: (item) => (
          <div className="stack-tight">
            <strong>{formatCurrency(item.finance.netMargin)}</strong>
            <span className="muted-text">{formatNumber(item.finance.marginPercentage)}%</span>
          </div>
        ),
        sortValue: (item) => item.finance.netMargin,
      },
      {
        align: 'right',
        header: 'Combustible',
        key: 'fuel',
        render: (item) => (
          <div className="stack-tight">
            <strong>{item.fuel.averageKmPerLiter ? `${formatNumber(item.fuel.averageKmPerLiter)} km/l` : 'Sin dato'}</strong>
            <span className="muted-text">{item.fuel.suspiciousRecords} sospechosas</span>
          </div>
        ),
        sortValue: (item) => item.fuel.averageKmPerLiter,
      },
      {
        align: 'right',
        header: 'Riesgos',
        key: 'risks',
        render: (item) => (
          <div className="stack-tight">
            <strong>{item.blockers.length}</strong>
            <span className="muted-text">{item.safety.openIncidents} inc. / {item.compliance.activeFines} multas</span>
          </div>
        ),
        sortValue: (item) => item.blockers.length + item.safety.openIncidents + item.compliance.activeFines,
      },
      {
        header: 'Proxima accion',
        key: 'nextAction',
        render: (item) => <span className="muted-text">{item.nextAction}</span>,
      },
    ],
    [],
  )

  const resetFilters = () => {
    setQuery('')
    setPeriodDays(90)
    setRisk('all')
    setStatus('all')
  }

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            <Link to={ROUTES.driverTripSheets}>
              <Button icon={<ReceiptText size={18} />} size="sm" variant="secondary">
                Planillas
              </Button>
            </Link>
            <Link to={ROUTES.drivers}>
              <Button icon={<Users size={18} />} size="sm" variant="secondary">
                Choferes
              </Button>
            </Link>
          </div>
        }
        description="Consolida planillas, gastos, peajes, espera, combustible, multas, documentos, incidentes, checklists, telemetria y unidad asignada."
        title="Rendimiento de choferes"
      />

      <div className={styles.summaryGrid}>
        <MetricCard
          helper={`${report.summary.readyDrivers} aptos / ${report.summary.reviewDrivers} revisar / ${report.summary.blockedDrivers} bloqueados`}
          icon={<Gauge aria-hidden size={18} />}
          label="Score operativo"
          tone={report.summary.averageOperationalScore >= 82 ? 'success' : report.summary.averageOperationalScore >= 70 ? 'warning' : 'danger'}
          value={`${report.summary.averageOperationalScore}/100`}
        />
        <MetricCard
          helper={`${report.summary.totalSheets} planillas / ${formatNumber(report.summary.totalKm, 0)} km`}
          icon={<Route aria-hidden size={18} />}
          label="Viajes medidos"
          tone="info"
          value={report.summary.driversWithTrips}
        />
        <MetricCard
          helper={`Ingresos ${formatCurrency(report.summary.totalRevenue)} / gastos ${formatCurrency(report.summary.totalExpenses)}`}
          icon={<Wallet aria-hidden size={18} />}
          label="Margen neto"
          tone={report.summary.totalNetMargin >= 0 ? 'success' : 'danger'}
          value={formatCurrency(report.summary.totalNetMargin)}
        />
        <MetricCard
          helper={`${report.summary.totalDriverDocumentsIssues} documentos obs. / ${report.summary.totalActiveFines} multas`}
          icon={<ShieldCheck aria-hidden size={18} />}
          label="Cumplimiento"
          tone={report.summary.blockedDrivers > 0 ? 'warning' : 'success'}
          value={`${report.summary.activeDrivers} activos`}
        />
        <MetricCard
          helper={`${report.summary.totalOpenIncidents} incidentes abiertos / ${formatCurrency(report.summary.totalIncidentCost)} estimado`}
          icon={<AlertTriangle aria-hidden size={18} />}
          label="Seguridad"
          tone={report.summary.totalOpenIncidents > 0 ? 'danger' : 'success'}
          value={report.summary.totalOpenIncidents}
        />
      </div>

      <FilterBar
        activeCount={activeCount}
        activeFilters={[
          ...(query ? [{ label: 'Busqueda', onRemove: () => setQuery(''), value: query }] : []),
          ...(periodDays !== 90 ? [{ label: 'Periodo', onRemove: () => setPeriodDays(90), value: `${periodDays} dias` }] : []),
          ...(risk !== 'all' ? [{ label: 'Decision', onRemove: () => setRisk('all'), value: riskLabels[risk] }] : []),
          ...(status !== 'all' ? [{ label: 'Estado', onRemove: () => setStatus('all'), value: status === 'active' ? 'Activos' : 'Inactivos' }] : []),
        ]}
        description="Filtra por periodo, riesgo operacional o estado para priorizar quien puede salir, quien requiere revision y quien esta bloqueado."
        onClear={resetFilters}
        title="Control de rendimiento"
      >
        <Input
          label="Buscar"
          name="driverPerformanceSearch"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Chofer, documento, licencia, patente o accion"
          value={query}
        />
        <Select
          label="Periodo"
          name="driverPerformancePeriod"
          onChange={(event) => setPeriodDays(Number(event.target.value))}
          options={periodOptions}
          value={String(periodDays)}
        />
        <Select
          label="Decision"
          name="driverPerformanceRisk"
          onChange={(event) => setRisk(event.target.value as DriverPerformanceRiskLevel | 'all')}
          options={riskOptions}
          value={risk}
        />
        <Select
          label="Estado"
          name="driverPerformanceStatus"
          onChange={(event) => setStatus(event.target.value as 'active' | 'all' | 'inactive')}
          options={statusOptions}
          value={status}
        />
      </FilterBar>

      <div className={styles.workbench}>
        <Card>
          <div className="stack">
            <div className="split-row">
              <div>
                <h2 className="section-title">Ranking operativo</h2>
                <p className="muted-text">Selecciona un chofer para ver el detalle de costos, seguridad y cumplimiento.</p>
              </div>
              <Badge tone="info">{report.rows.length} choferes</Badge>
            </div>
            <Table
              columns={columns}
              data={report.rows}
              density="compact"
              emptyDescription="No hay choferes con datos para los filtros seleccionados."
              enableSearch
              getRowKey={(item) => item.driverId}
              getRowLabel={(item) => `Ver rendimiento de ${item.driverName}`}
              initialSort={{ direction: 'asc', key: 'riskLevel' }}
              isLoading={isLoading}
              loadingLabel="Calculando rendimiento de choferes"
              onRowClick={(item) => setSelectedDriverId(item.driverId)}
              searchPlaceholder="Buscar en choferes, riesgos o acciones"
            />
          </div>
        </Card>

        {selectedRow ? <DriverPerformanceDetail row={selectedRow} /> : (
          <Card>
            <EmptyState description="Ajusta filtros o registra planillas de viaje para comenzar a medir." title="Sin chofer seleccionado" />
          </Card>
        )}
      </div>
    </PageContainer>
  )
}

function DriverPerformanceDetail({ row }: { row: DriverPerformanceRow }) {
  const expenseItems = [
    { label: 'Combustible', value: row.route.fuelCost, tone: 'info' },
    { label: 'Peajes', value: row.route.tollCost, tone: 'warning' },
    { label: 'Comida', value: row.route.mealCost, tone: 'neutral' },
    { label: 'Propina', value: row.route.tipCost, tone: 'neutral' },
    { label: 'Estacionamiento', value: row.route.parkingCost, tone: 'neutral' },
    { label: 'Espera', value: row.route.waitingCost, tone: 'danger' },
    { label: 'Alojamiento', value: row.route.lodgingCost, tone: 'neutral' },
    { label: 'Otros', value: row.route.otherCost, tone: 'neutral' },
  ].filter((item) => item.value > 0)
  const maxExpense = Math.max(...expenseItems.map((item) => item.value), 1)

  return (
    <aside className={styles.detailPanel}>
      <Card>
        <div className="stack">
          <div className={styles.detailHeader}>
            <div>
              <h2>{row.driverName}</h2>
              <p>{row.document} / {row.license}</p>
            </div>
            <Badge tone={riskTone(row.riskLevel)}>{row.decision}</Badge>
          </div>
          <div className={styles.scoreHero}>
            <strong>{row.scores.operationalScore}</strong>
            <span>score operativo</span>
            <p>{row.nextAction}</p>
          </div>
          <div className={styles.quickLinks}>
            <Link to={ROUTES.driverDetail(row.driverId)}>
              <Button icon={<Users size={16} />} size="sm" variant="secondary">
                Ficha chofer
              </Button>
            </Link>
            {row.assignedTruck ? (
              <Link to={ROUTES.fleetTruckDetail(row.assignedTruck.id)}>
                <Button icon={<Truck size={16} />} size="sm" variant="secondary">
                  {row.assignedTruck.plate}
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </Card>

      <Card>
        <div className="stack">
          <h2 className="section-title">Lectura rapida</h2>
          <div className={styles.signalGrid}>
            <Signal label="Viaje" score={row.scores.tripScore} />
            <Signal label="Cumplimiento" score={row.scores.complianceScore} />
            <Signal label="Seguridad" score={row.scores.safetyScore} />
            <Signal label="Margen" score={row.scores.profitabilityScore} />
            <Signal label="Combustible" score={row.scores.fuelScore} />
            <Signal label="Puntualidad" score={row.scores.punctualityScore} />
          </div>
        </div>
      </Card>

      <Card>
        <div className="stack">
          <h2 className="section-title">Metricas operativas</h2>
          <dl className={styles.detailList}>
            <div>
              <dt>Viajes / km</dt>
              <dd>{row.tripMetrics.sheets} / {formatNumber(row.route.kmReal, 0)} km</dd>
            </div>
            <div>
              <dt>Asignaciones</dt>
              <dd>{row.tripMetrics.assignments} total / {row.tripMetrics.scheduledAssignments} programadas</dd>
            </div>
            <div>
              <dt>Margen</dt>
              <dd>{formatCurrency(row.finance.netMargin)} ({formatNumber(row.finance.marginPercentage)}%)</dd>
            </div>
            <div>
              <dt>Costo por km</dt>
              <dd>{formatCurrency(row.finance.averageCostPerKm)}</dd>
            </div>
            <div>
              <dt>Km/l</dt>
              <dd>{row.fuel.averageKmPerLiter ? `${formatNumber(row.fuel.averageKmPerLiter)} km/l` : 'Sin dato'}</dd>
            </div>
            <div>
              <dt>Espera</dt>
              <dd>{formatNumber(row.route.waitingHours)} h / {formatCurrency(row.route.waitingCost)}</dd>
            </div>
            <div>
              <dt>A tiempo</dt>
              <dd>{formatPercent(row.tripMetrics.onTimeRate)}</dd>
            </div>
            <div>
              <dt>Documentos</dt>
              <dd>{row.compliance.hardDocumentIssues} bloqueantes / {row.compliance.expiringDocuments} por vencer</dd>
            </div>
            <div>
              <dt>Incidentes</dt>
              <dd>{row.safety.openIncidents} abiertos / {row.safety.totalIncidents} total</dd>
            </div>
          </dl>
        </div>
      </Card>

      <Card>
        <div className="stack">
          <h2 className="section-title">Gastos del periodo</h2>
          {expenseItems.length ? (
            <div className={styles.expenseList}>
              {expenseItems.map((item) => (
                <div className={styles.expenseRow} key={item.label}>
                  <span>{item.label}</span>
                  <div className={styles.expenseTrack}>
                    <span
                      className={styles[item.tone]}
                      style={{ width: `${Math.max((item.value / maxExpense) * 100, 6)}%` }}
                    />
                  </div>
                  <strong>{formatCurrency(item.value)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-text">Sin gastos registrados en el periodo.</p>
          )}
        </div>
      </Card>

      <Card>
        <div className="stack">
          <h2 className="section-title">Bloqueos y senales</h2>
          {row.blockers.length ? (
            <div className={styles.blockerList}>
              {row.blockers.map((blocker) => (
                <span key={blocker}>
                  <AlertTriangle aria-hidden size={14} />
                  {blocker}
                </span>
              ))}
            </div>
          ) : (
            <div className={styles.readyState}>
              <BadgeCheck aria-hidden size={18} />
              <span>Sin bloqueos criticos para asignacion.</span>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="stack">
          <h2 className="section-title">Ultimos movimientos</h2>
          <RecentList row={row} />
        </div>
      </Card>
    </aside>
  )
}

function Signal({ label, score }: { label: string; score: number }) {
  return (
    <div className={styles.signal}>
      <div>
        <span>{label}</span>
        <strong>{score}</strong>
      </div>
      <div className={styles.signalTrack}>
        <span className={styles[scoreTone(score)]} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function RecentList({ row }: { row: DriverPerformanceRow }) {
  const items = [
    ...row.recent.trips.map((item) => ({
      helper: `${formatCurrency(item.netMargin)} margen / ${item.performanceScore}/100`,
      id: `trip-${item.id}`,
      icon: <Route aria-hidden size={16} />,
      label: item.sheetNumber,
      when: item.tripDate,
    })),
    ...row.recent.incidents.map((item) => ({
      helper: `${item.type} / ${item.status}`,
      id: `incident-${item.id}`,
      icon: <AlertTriangle aria-hidden size={16} />,
      label: item.incidentNumber,
      when: item.occurredAt,
    })),
    ...row.recent.fuelRecords.map((item) => ({
      helper: `${formatNumber(item.liters, 0)} l / ${item.kmPerLiter ? `${formatNumber(item.kmPerLiter)} km/l` : 'sin km/l'}`,
      id: `fuel-${item.id}`,
      icon: <Fuel aria-hidden size={16} />,
      label: item.deviationStatus,
      when: item.date,
    })),
    ...row.recent.checklists.map((item) => ({
      helper: item.summary,
      id: `checklist-${item.id}`,
      icon: <Activity aria-hidden size={16} />,
      label: `${item.kind} ${item.status}`,
      when: item.occurredAt,
    })),
  ]
    .sort((first, second) => new Date(second.when).getTime() - new Date(first.when).getTime())
    .slice(0, 8)

  if (!items.length) {
    return <p className="muted-text">Sin movimientos recientes para el periodo seleccionado.</p>
  }

  return (
    <div className={styles.timeline}>
      {items.map((item) => (
        <article key={item.id}>
          <span>{item.icon}</span>
          <div>
            <strong>{item.label}</strong>
            <p>{item.helper}</p>
          </div>
          <small>{shortDate(item.when)}</small>
        </article>
      ))}
    </div>
  )
}
