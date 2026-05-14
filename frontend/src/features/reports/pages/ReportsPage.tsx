import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, ReceiptText } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { FilterBar } from '../../../shared/components/FilterBar/FilterBar'
import { Input } from '../../../shared/components/Input/Input'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { Select } from '../../../shared/components/Select/Select'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { CasesReportTable } from '../components/CasesReportTable'
import { MechanicPerformanceReport } from '../components/MechanicPerformanceReport'
import {
  DriverTripSheetPerformanceReport,
  FleetRiskReport,
  FreightProfitabilityReport,
  FuelDeviationReport,
  PurchaseInventoryReport,
  TechnicalInspectionExpirationReport,
  TireEconomicsReport,
} from '../components/OperationalReports'
import { OperationalAlerts, ReportCatalog, ReportMetricGrid } from '../components/ReportCards'
import { ReportBarList } from '../components/ReportBarList'
import { RepairTimeReport } from '../components/RepairTimeReport'
import { getDriverTripSheetReport, getReportsDashboard, getTechnicalInspectionExpirationReport } from '../services/reports.service'
import type {
  CasesReportRow,
  DriverTripSheetPerformanceRow,
  DriverTripSheetReportData,
  FleetRiskRow,
  FreightProfitabilityReportRow,
  FuelDeviationReportRow,
  MechanicPerformanceRow,
  PurchaseInventoryRow,
  ReportSection,
  TechnicalInspectionExpirationReportData,
  TechnicalInspectionExpirationRow,
  TireEconomicsRow,
} from '../types/report.types'
import styles from './ReportsPage.module.css'

const sectionOptions = [
  { label: 'Resumen ejecutivo', value: 'overview' },
  { label: 'Taller y SLA', value: 'workshop' },
  { label: 'Flota', value: 'fleet' },
  { label: 'Vencimientos RT', value: 'documents' },
  { label: 'Rendimiento choferes', value: 'driverSheets' },
  { label: 'Costos y rentabilidad', value: 'finance' },
  { label: 'Inventario y compras', value: 'inventory' },
  { label: 'Neumaticos', value: 'tires' },
]

const expirationWindowOptions = [
  { label: '30 dias', value: '30' },
  { label: '60 dias', value: '60' },
  { label: '90 dias', value: '90' },
  { label: '180 dias', value: '180' },
]

function matchesQuery<T>(row: T, query: string) {
  if (!query.trim()) {
    return true
  }

  return JSON.stringify(row).toLowerCase().includes(query.trim().toLowerCase())
}

function formatCurrencyShort(value: number) {
  return new Intl.NumberFormat('es-CL', {
    currency: 'CLP',
    maximumFractionDigits: 0,
    notation: 'compact',
    style: 'currency',
  }).format(value)
}

function formatNumberShort(value: number) {
  return new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 }).format(value)
}

function sectionTitle(section: ReportSection) {
  return sectionOptions.find((item) => item.value === section)?.label || 'Reporte'
}

function filterRows<T>(rows: T[], query: string) {
  return rows.filter((row) => matchesQuery(row, query))
}

interface ReportSectionHeaderProps {
  title: string
  description: string
  count?: number
}

function ReportSectionHeader({ title, description, count }: ReportSectionHeaderProps) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {typeof count === 'number' ? <Badge tone="info">{count} registros</Badge> : null}
    </div>
  )
}

export function ReportsPage() {
  const dashboard = useMemo(() => getReportsDashboard(), [])
  const [activeSection, setActiveSection] = useState<ReportSection>('overview')
  const [query, setQuery] = useState('')
  const [expirationDays, setExpirationDays] = useState(90)
  const [expirationReport, setExpirationReport] = useState<TechnicalInspectionExpirationReportData>(
    dashboard.technicalInspectionExpirations,
  )
  const [isExpirationLoading, setIsExpirationLoading] = useState(false)
  const [driverTripSheetReport, setDriverTripSheetReport] = useState<DriverTripSheetReportData>(
    dashboard.driverTripSheetReport,
  )
  const [isDriverTripSheetLoading, setIsDriverTripSheetLoading] = useState(false)

  const activeCount = (query ? 1 : 0) + (activeSection !== 'overview' ? 1 : 0) + (activeSection === 'documents' ? 1 : 0)
  const caseRows = filterRows<CasesReportRow>(dashboard.caseStatusRows, query)
  const mechanicRows = filterRows<MechanicPerformanceRow>(dashboard.mechanicRows, query)
  const fleetRows = filterRows<FleetRiskRow>(dashboard.fleetRiskRows, query)
  const technicalInspectionRows = filterRows<TechnicalInspectionExpirationRow>(expirationReport.rows, query)
  const inventoryRows = filterRows<PurchaseInventoryRow>(dashboard.purchaseInventoryRows, query)
  const freightRows = filterRows<FreightProfitabilityReportRow>(dashboard.freightProfitabilityRows, query)
  const driverTripRows = filterRows<DriverTripSheetPerformanceRow>(driverTripSheetReport.rows, query)
  const fuelRows = filterRows<FuelDeviationReportRow>(dashboard.fuelDeviationRows, query)
  const tireRows = filterRows<TireEconomicsRow>(dashboard.tireEconomicsRows, query)

  const resetFilters = () => {
    setActiveSection('overview')
    setExpirationDays(90)
    setQuery('')
  }

  useEffect(() => {
    let mounted = true

    const loadExpirationReport = async () => {
      setIsExpirationLoading(true)
      const report = await getTechnicalInspectionExpirationReport(expirationDays)

      if (mounted) {
        setExpirationReport(report)
        setIsExpirationLoading(false)
      }
    }

    void loadExpirationReport()

    return () => {
      mounted = false
    }
  }, [expirationDays])

  useEffect(() => {
    let mounted = true

    const loadDriverTripSheetReport = async () => {
      setIsDriverTripSheetLoading(true)
      const report = await getDriverTripSheetReport()

      if (mounted) {
        setDriverTripSheetReport(report)
        setIsDriverTripSheetLoading(false)
      }
    }

    void loadDriverTripSheetReport()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <PageContainer>
      <PageHeader
        actions={<Badge tone="info">{sectionTitle(activeSection)}</Badge>}
        description="Vista ejecutiva y operativa para taller, flota, compras, fletes, combustible y neumaticos."
        title="Reporteria"
      />

      <ReportMetricGrid metrics={dashboard.metrics} />

      <FilterBar
        activeCount={activeCount}
        activeFilters={[
          ...(query ? [{ label: 'Busqueda', onRemove: () => setQuery(''), value: query }] : []),
          ...(activeSection !== 'overview'
            ? [
                {
                  label: 'Vista',
                  onRemove: () => setActiveSection('overview'),
                  value: sectionTitle(activeSection),
                },
              ]
            : []),
          ...(activeSection === 'documents'
            ? [
                {
                  label: 'Horizonte RT',
                  onRemove: () => setExpirationDays(90),
                  value: `${expirationDays} dias`,
                },
              ]
            : []),
        ]}
        description="Busqueda rapida sobre los reportes visibles."
        onClear={resetFilters}
        title="Control de reportes"
      >
        <Input
          label="Buscar"
          name="reportSearch"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Patente, cliente, SKU, mecanico..."
          value={query}
        />
        <Select
          label="Vista"
          name="reportSection"
          onChange={(event) => setActiveSection(event.target.value as ReportSection)}
          options={sectionOptions}
          value={activeSection}
        />
        {activeSection === 'documents' ? (
          <Select
            label="Horizonte"
            name="expirationWindow"
            onChange={(event) => setExpirationDays(Number(event.target.value))}
            options={expirationWindowOptions}
            value={String(expirationDays)}
          />
        ) : null}
      </FilterBar>

      <ReportCatalog activeSection={activeSection} items={dashboard.catalog} onSelect={setActiveSection} />

      {activeSection === 'overview' ? (
        <div className="page-grid">
          <Card>
            <div className="stack">
              <ReportSectionHeader
                count={dashboard.alerts.length}
                description="Prioridades que cruzan taller, flota, inventario y combustible."
                title="Alertas operativas"
              />
              <OperationalAlerts alerts={dashboard.alerts} />
            </div>
          </Card>
          <div className={styles.reportGrid}>
            <Card>
              <div className="stack">
                <ReportSectionHeader description="Distribucion de riesgo de plazo en casos activos." title="SLA taller" />
                <ReportBarList items={dashboard.slaRows} />
              </div>
            </Card>
            <RepairTimeReport rows={dashboard.repairStageRows} />
          </div>
          <Card>
            <div className="stack">
              <ReportSectionHeader
                count={caseRows.length}
                description="Estado, horas promedio, SLA, bloqueos y costo estimado."
                title="Casos por estado"
              />
              <CasesReportTable rows={caseRows} />
            </div>
          </Card>
          <Card>
            <div className="stack">
              <ReportSectionHeader
                count={fleetRows.length}
                description="Camiones ordenados por menor health score y bloqueo operativo."
                title="Riesgo de flota"
              />
              <FleetRiskReport rows={fleetRows.slice(0, 5)} />
            </div>
          </Card>
        </div>
      ) : null}

      {activeSection === 'workshop' ? (
        <div className="page-grid">
          <div className={styles.reportGrid}>
            <Card>
              <div className="stack">
                <ReportSectionHeader description="Casos OK, en riesgo y vencidos." title="SLA por caso" />
                <ReportBarList items={dashboard.slaRows} />
              </div>
            </Card>
            <RepairTimeReport rows={dashboard.repairStageRows} />
          </div>
          <Card>
            <div className="stack">
              <ReportSectionHeader
                count={caseRows.length}
                description="Agrupacion operativa para jefatura de taller."
                title="Casos por estado"
              />
              <CasesReportTable rows={caseRows} />
            </div>
          </Card>
          <Card>
            <div className="stack">
              <ReportSectionHeader
                count={mechanicRows.length}
                description="Carga, utilizacion, criticidad y retrabajo."
                title="Desempeno de mecanicos"
              />
              <MechanicPerformanceReport rows={mechanicRows} />
            </div>
          </Card>
        </div>
      ) : null}

      {activeSection === 'fleet' ? (
        <div className="page-grid">
          <Card>
            <div className="stack">
              <ReportSectionHeader description="Disponibilidad real de unidades por estado." title="Estado de flota" />
              <ReportBarList items={dashboard.fleetStatusRows} />
            </div>
          </Card>
          <Card>
            <div className="stack">
              <ReportSectionHeader
                count={fleetRows.length}
                description="Health score, documentos, mantenciones, costo/km y bloqueos."
                title="Riesgo por camion"
              />
              <FleetRiskReport rows={fleetRows} />
            </div>
          </Card>
        </div>
      ) : null}

      {activeSection === 'documents' ? (
        <div className="page-grid">
          <div className={styles.expirationSummaryGrid}>
            <ExpirationSummaryCard
              helper="Unidades sin revision tecnica cargada o con fecha vencida."
              label="Bloquean operacion"
              tone={expirationReport.summary.expired + expirationReport.summary.missing > 0 ? 'danger' : 'success'}
              value={String(expirationReport.summary.expired + expirationReport.summary.missing)}
            />
            <ExpirationSummaryCard
              helper="Requieren cupo de revision dentro de 15 dias."
              label="Urgentes"
              tone={expirationReport.summary.due15 > 0 ? 'warning' : 'success'}
              value={String(expirationReport.summary.due15)}
            />
            <ExpirationSummaryCard
              helper="Coordinar agenda, chofer y documentos antes del vencimiento."
              label="Proximas 30 dias"
              tone={expirationReport.summary.due30 > 0 ? 'warning' : 'success'}
              value={String(expirationReport.summary.due30)}
            />
            <ExpirationSummaryCard
              helper={`Dentro del horizonte operacional de ${expirationReport.summary.horizonDays} dias.`}
              label="Total a gestionar"
              tone={expirationReport.summary.total > 0 ? 'info' : 'success'}
              value={String(expirationReport.summary.total)}
            />
          </div>
          <Card>
            <div className="stack">
              <ReportSectionHeader
                count={technicalInspectionRows.length}
                description="Ordenado por bloqueo, urgencia y fecha para organizar revision tecnica con anticipacion."
                title="Revision tecnica por vencer"
              />
              <TechnicalInspectionExpirationReport isLoading={isExpirationLoading} rows={technicalInspectionRows} />
            </div>
          </Card>
        </div>
      ) : null}

      {activeSection === 'driverSheets' ? (
        <div className="page-grid">
          <div className={styles.expirationSummaryGrid}>
            <ExpirationSummaryCard
              helper="Planillas cerradas o en revision desde fletes ejecutados."
              label="Planillas"
              tone="info"
              value={String(driverTripSheetReport.summary.sheets)}
            />
            <ExpirationSummaryCard
              helper="Despues de peajes, viaticos, espera y otros gastos."
              label="Margen neto"
              tone={driverTripSheetReport.summary.netMargin >= 0 ? 'success' : 'danger'}
              value={formatCurrencyShort(driverTripSheetReport.summary.netMargin)}
            />
            <ExpirationSummaryCard
              helper="Horas improductivas acumuladas por carga, descarga o esperas externas."
              label="Horas espera"
              tone={driverTripSheetReport.summary.waitingHours > 4 ? 'warning' : 'success'}
              value={`${formatNumberShort(driverTripSheetReport.summary.waitingHours)} h`}
            />
            <ExpirationSummaryCard
              helper="Calculado por margen, desvio de km y horas de espera."
              label="Score"
              tone={driverTripSheetReport.summary.averageScore >= 85 ? 'success' : 'warning'}
              value={`${driverTripSheetReport.summary.averageScore}/100`}
            />
          </div>
          <Card>
            <div className={styles.tireInsight}>
              <ReceiptText aria-hidden size={28} />
              <div>
                <h2>Reporte detallado por chofer</h2>
                <p>
                  Abre la vista dedicada para cruzar rendimiento, multas, documentos, combustible, incidentes y checklists
                  por responsable de ruta.
                </p>
                <Link to={ROUTES.driverPerformanceReport}>
                  <Button size="sm" variant="secondary">Abrir rendimiento completo</Button>
                </Link>
              </div>
            </div>
          </Card>
          <Card>
            <div className="stack">
              <ReportSectionHeader
                count={driverTripRows.length}
                description="Rendimiento por chofer considerando peajes, comida, propina, estacionamiento, horas de espera, costo/km y margen."
                title="Rendimiento de viajes por chofer"
              />
              <DriverTripSheetPerformanceReport isLoading={isDriverTripSheetLoading} rows={driverTripRows} />
            </div>
          </Card>
        </div>
      ) : null}

      {activeSection === 'finance' ? (
        <div className="page-grid">
          <Card>
            <div className="stack">
              <ReportSectionHeader
                count={freightRows.length}
                description="Margen por flete, costo/km e ingreso operacional."
                title="Rentabilidad de fletes"
              />
              <FreightProfitabilityReport rows={freightRows} />
            </div>
          </Card>
          <Card>
            <div className="stack">
              <ReportSectionHeader
                count={fuelRows.length}
                description="Consumo, gasto y desviaciones por camion y chofer."
                title="Combustible y desviaciones"
              />
              <FuelDeviationReport rows={fuelRows} />
            </div>
          </Card>
        </div>
      ) : null}

      {activeSection === 'inventory' ? (
        <div className="page-grid">
          <Card>
            <div className="stack">
              <ReportSectionHeader description="Ordenes por avance de compra." title="Estado de compras" />
              <ReportBarList items={dashboard.purchaseStatusRows} />
            </div>
          </Card>
          <Card>
            <div className="stack">
              <ReportSectionHeader
                count={inventoryRows.length}
                description="SKUs bajo minimo, sin stock, compras activas y casos impactados."
                title="Inventario critico"
              />
              <PurchaseInventoryReport rows={inventoryRows} />
            </div>
          </Card>
        </div>
      ) : null}

      {activeSection === 'tires' ? (
        <div className="page-grid">
          <Card>
            <div className="stack">
              <ReportSectionHeader
                count={tireRows.length}
                description="Comparacion economica de neumaticos nuevos y recauchados."
                title="Costo real por kilometro"
              />
              <TireEconomicsReport rows={tireRows} />
            </div>
          </Card>
          <Card>
            <div className={styles.tireInsight}>
              <BarChart3 aria-hidden size={28} />
              <div>
                <h2>Decision de compra por rendimiento</h2>
                <p>
                  El reporte prioriza costo por kilometro y muestra cuando un neumatico de menor precio entrega mejor
                  rentabilidad, aunque dure menos kilometros.
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </PageContainer>
  )
}

function ExpirationSummaryCard({
  helper,
  label,
  tone,
  value,
}: {
  helper: string
  label: string
  tone: 'danger' | 'info' | 'success' | 'warning'
  value: string
}) {
  return (
    <article className={[styles.expirationSummaryCard, styles[tone]].join(' ')}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{helper}</p>
    </article>
  )
}
