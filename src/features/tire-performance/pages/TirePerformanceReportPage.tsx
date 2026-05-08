import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, CheckCircle2, PackageCheck, PackagePlus, Plus, Repeat2, TrendingDown, Wrench } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { MetricCard } from '../../../shared/components/MetricCard/MetricCard'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { TirePerformanceFilters } from '../components/TirePerformanceFilters'
import { TirePerformanceTable } from '../components/TirePerformanceTable'
import { TireDecisionPanel } from '../components/TireDecisionPanel'
import { TireLifecycleStageBoard } from '../components/TireLifecycleStageBoard'
import { TireModuleNav } from '../components/TireModuleNav'
import { TireOperationalFlow } from '../components/TireOperationalFlow'
import { tirePerformanceMock } from '../mocks/tirePerformance.mock'
import type { TireLifecycle, TirePerformanceFilters as TirePerformanceFiltersModel } from '../types/tirePerformance.types'
import { buildTireOperationalReport } from '../utils/tirePerformanceOperations'
import styles from './TirePerformanceReportPage.module.css'

const initialFilters: TirePerformanceFiltersModel = {
  brand: 'all',
  fromDate: '',
  removalReason: 'all',
  status: 'all',
  supplierName: 'all',
  tirePosition: 'all',
  tireType: 'all',
  toDate: '',
  truckId: 'all',
  usageType: 'all',
}

function formatPerKm(value: number | undefined) {
  return value === undefined ? 'Sin datos' : `$${value.toFixed(2)}/km`
}

function formatKm(value: number | undefined) {
  return value === undefined ? 'Sin datos' : `${Math.round(value).toLocaleString('es-CL')} km`
}

export function TirePerformanceReportPage() {
  const [filters, setFilters] = useState(initialFilters)
  const { data: tirePerformance, isLoading } = useResourceList<TireLifecycle>(
    '/tire-performance/tires',
    tirePerformanceMock,
    { order: 'desc', sort: 'purchaseDate' },
  )

  const tires = useMemo(
    () =>
      tirePerformance.filter((tire) => {
        const matchesType = filters.tireType === 'all' || tire.tireType === filters.tireType
        const matchesSupplier = filters.supplierName === 'all' || tire.supplierName === filters.supplierName
        const matchesBrand = filters.brand === 'all' || tire.brand === filters.brand
        const matchesTruck = filters.truckId === 'all' || tire.truckId === filters.truckId
        const matchesPosition = filters.tirePosition === 'all' || tire.tirePosition === filters.tirePosition
        const matchesUsage = filters.usageType === 'all' || tire.usageType === filters.usageType
        const matchesStatus = filters.status === 'all' || tire.status === filters.status
        const matchesReason = filters.removalReason === 'all' || tire.removalReason === filters.removalReason
        const purchaseDate = new Date(tire.purchaseDate)
        const matchesFrom = !filters.fromDate || purchaseDate >= new Date(filters.fromDate)
        const matchesTo = !filters.toDate || purchaseDate <= new Date(filters.toDate)

        return (
          matchesType &&
          matchesSupplier &&
          matchesBrand &&
          matchesTruck &&
          matchesPosition &&
          matchesUsage &&
          matchesStatus &&
          matchesReason &&
          matchesFrom &&
          matchesTo
        )
      }),
    [filters, tirePerformance],
  )
  const operationalReport = useMemo(() => buildTireOperationalReport(tirePerformance), [tirePerformance])
  const filteredReport = useMemo(() => buildTireOperationalReport(tires), [tires])

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            <Link to={ROUTES.tirePerformanceIntake}>
              <Button icon={<PackagePlus size={18} />}>Ingresar stock</Button>
            </Link>
            <Link to={ROUTES.tirePerformanceInstall}>
              <Button icon={<Plus size={18} />} variant="secondary">
                Instalar
              </Button>
            </Link>
            <Link to={ROUTES.tirePerformanceRemove}>
              <Button icon={<Repeat2 size={18} />} variant="secondary">
                Retirar
              </Button>
            </Link>
            <Link to={ROUTES.tirePerformanceComparison}>
              <Button icon={<BarChart3 size={18} />} variant="secondary">
                Comparar
              </Button>
            </Link>
          </div>
        }
        description="Flujo completo para medir costo real por kilometro: compra, stock, instalacion, retiro y cierre de datos."
        title="Rendimiento de neumaticos"
      />
      <TireModuleNav />
      <TireOperationalFlow report={operationalReport} />
      <TireLifecycleStageBoard report={operationalReport} />

      <div className={styles.metrics}>
        <MetricCard
          helper={`${operationalReport.readyForReport.length} ciclos cerrados de ${operationalReport.closedCycles.length}`}
          icon={<CheckCircle2 size={17} />}
          label="Reporte usable"
          tone={operationalReport.reportReadiness >= 85 ? 'success' : 'warning'}
          value={`${operationalReport.reportReadiness}%`}
        />
        <MetricCard
          helper={`${operationalReport.installed.length} actualmente en camion`}
          icon={<Wrench size={17} />}
          label="En seguimiento"
          tone="info"
          value={String(operationalReport.installed.length)}
        />
        <MetricCard
          helper="neumaticos listos para asignar"
          icon={<PackageCheck size={17} />}
          label="Stock operativo"
          tone={operationalReport.stock.length > 0 ? 'success' : 'neutral'}
          value={String(operationalReport.stock.length)}
        />
        <MetricCard
          helper={`km promedio: ${formatKm(operationalReport.averageKmUsed)}`}
          icon={<TrendingDown size={17} />}
          label="Costo promedio"
          tone={operationalReport.riskTires.length > 0 ? 'warning' : 'success'}
          value={formatPerKm(operationalReport.averageCostPerKm)}
        />
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.mainStack}>
          <TirePerformanceFilters
            filters={filters}
            onReset={() => setFilters(initialFilters)}
            setFilters={setFilters}
            tires={tirePerformance}
          />
          <Card>
            <div className="section-heading-row">
              <div>
                <h2 className="section-title">Ciclos de vida y rendimiento</h2>
                <p className="muted-text">
                  Mostrando {tires.length} de {tirePerformance.length} neumaticos. {filteredReport.readyForReport.length} ya
                  sirven para comparar costo/km.
                </p>
              </div>
            </div>
            <TirePerformanceTable isLoading={isLoading} tires={tires} />
          </Card>
        </div>

        <aside className={styles.sideStack}>
          <Card className={styles.cardStack}>
            <div className="section-heading-row">
              <div>
                <h2 className="section-title">Calidad del dato</h2>
                <p className="muted-text">Lo que falta para que el reporte sea accionable.</p>
              </div>
            </div>
            <ul className={styles.readinessList}>
              <li className={styles.readinessItem}>
                <div>
                  <strong>Ciclos cerrados con km final</strong>
                  <span>Base real para costo/km, proveedor, marca y recauchado.</span>
                </div>
                <span className={styles.readinessValue}>{operationalReport.readyForReport.length}</span>
              </li>
              <li className={styles.readinessItem}>
                <div>
                  <strong>Brechas que bloquean decision</strong>
                  <span>Instalaciones o retiros sin kilometraje, posicion o motivo.</span>
                </div>
                <span className={styles.readinessValue}>{operationalReport.dataGaps.length}</span>
              </li>
              <li className={styles.readinessItem}>
                <div>
                  <strong>Costo/km sobre umbral</strong>
                  <span>Unidades que requieren revisar contrato, proveedor o operacion.</span>
                </div>
                <span className={styles.readinessValue}>{operationalReport.riskTires.length}</span>
              </li>
              <li className={styles.readinessItem}>
                <div>
                  <strong>Ahorro recauchado por 100.000 km</strong>
                  <span>Calculado solo con ciclos completos nuevo vs recauchado.</span>
                </div>
                <span className={styles.readinessValue}>
                  {operationalReport.savingPer100k === undefined ? 'Sin datos' : formatCurrency(operationalReport.savingPer100k)}
                </span>
              </li>
            </ul>
          </Card>

          <Card className={styles.cardStack}>
            <div className="section-heading-row">
              <div>
                <h2 className="section-title">Alertas operativas</h2>
                <p className="muted-text">Prioriza estas correcciones antes de tomar decisiones de compra.</p>
              </div>
            </div>
            <div className={styles.alerts}>
              {operationalReport.operationalAlerts.length > 0 ? (
                operationalReport.operationalAlerts.map((alert) => (
                  <div className={[styles.alert, styles[alert.severity]].join(' ')} key={alert.id}>
                    <strong>{alert.title}</strong>
                    <span>{alert.description}</span>
                  </div>
                ))
              ) : (
                <p className="muted-text">No hay bloqueos relevantes en los ciclos actuales.</p>
              )}
            </div>
          </Card>

          <TireDecisionPanel tires={tirePerformance} />

          <Card className={styles.cardStack}>
            <div className="section-heading-row">
              <div>
                <h2 className="section-title">Accesos del flujo</h2>
                <p className="muted-text">Acciones directas para cerrar el reporte sin navegar de mas.</p>
              </div>
            </div>
            <div className={styles.quickActions}>
              <Link className={styles.quickAction} to={ROUTES.tirePerformanceIntake}>
                <div>
                  <strong>Ingresar compra recibida</strong>
                  <span>Crea unidades individuales antes de medir rendimiento.</span>
                </div>
                <ArrowRight aria-hidden size={16} />
              </Link>
              <Link className={styles.quickAction} to={ROUTES.tirePerformanceInstall}>
                <div>
                  <strong>Instalar desde stock</strong>
                  <span>Asocia neumatico, camion, posicion y km inicial.</span>
                </div>
                <ArrowRight aria-hidden size={16} />
              </Link>
              <Link className={styles.quickAction} to={ROUTES.tirePerformanceRemove}>
                <div>
                  <strong>Retirar y calcular costo/km</strong>
                  <span>Cierra km final, motivo y estado resultante.</span>
                </div>
                <ArrowRight aria-hidden size={16} />
              </Link>
              <Link className={styles.quickAction} to={ROUTES.tirePerformanceComparison}>
                <div>
                  <strong>Comparar nuevo vs recauchado</strong>
                  <span>Evalua proveedores y ahorro con ciclos completos.</span>
                </div>
                <ArrowRight aria-hidden size={16} />
              </Link>
            </div>
          </Card>
        </aside>
      </div>
    </PageContainer>
  )
}
