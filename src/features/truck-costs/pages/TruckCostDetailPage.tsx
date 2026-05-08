import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { TruckCostCategoryBreakdown } from '../components/TruckCostCategoryBreakdown'
import { TruckCostPeriodControls } from '../components/TruckCostPeriodControls'
import { TruckCostTable } from '../components/TruckCostTable'
import { TruckProfitabilityBadge } from '../components/TruckProfitabilityBadge'
import styles from '../components/TruckCostsModule.module.css'
import { getTruckCostAnalytics } from '../services/truckCostAnalytics.service'
import type { TruckCostAnalytics, TruckCostPeriodMode } from '../types/truckCosts.types'

export function TruckCostDetailPage() {
  const { truckId = '' } = useParams()
  const now = new Date()
  const [period, setPeriod] = useState<TruckCostPeriodMode>('monthly')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [analytics, setAnalytics] = useState<TruckCostAnalytics | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const truck = analytics?.trucks[0]
  const truckLabels = useMemo(() => (truck ? { [truck.truckId]: truck.plate } : {}), [truck])

  useEffect(() => {
    let isMounted = true

    getTruckCostAnalytics({ month, period, truckId, year })
      .then((data) => {
        if (isMounted) {
          setAnalytics(data)
          setErrorMessage('')
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(getApiErrorMessage(error))
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [month, period, truckId, year])

  if (!isLoading && !truck && !errorMessage) {
    return (
      <PageContainer>
        <EmptyState icon={<AlertCircle size={22} />} title="Costos no encontrados" />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className={styles.costHeaderActions}>
            <TruckCostPeriodControls
              month={month}
              onMonthChange={setMonth}
              onPeriodChange={setPeriod}
              onYearChange={setYear}
              period={period}
              year={year}
            />
            <Link to={ROUTES.fleetTruckDetail(truckId)}>
              <Button size="sm" variant="secondary">
                Ver camion
              </Button>
            </Link>
          </div>
        }
        description={truck ? `${truck.truckLabel} - ${analytics?.period.label || ''}` : 'Costo conectado por unidad'}
        title={truck ? `Costos ${truck.plate}` : 'Costos por camion'}
      />
      {isLoading ? <LoadingState label="Calculando costo del camion" /> : null}
      {errorMessage ? <ErrorState description={errorMessage} title="No se pudieron cargar los costos" /> : null}
      {truck ? (
        <>
          <div className={styles.detailSummary}>
            <CostMetric label={period === 'annual' ? 'Costo anual' : 'Costo mensual'} value={formatCurrency(truck.totalCost)} helper={analytics?.period.label || ''} />
            <CostMetric
              label="Costo por km"
              value={truck.km > 0 ? formatCurrency(truck.costPerKm) : 'Sin km'}
              helper={truck.km > 0 ? `${truck.km.toLocaleString('es-CL')} km conectados` : 'Sin kilometraje conectado al periodo'}
            />
            <CostMetric label="Margen fletes" value={formatCurrency(truck.netMargin)} helper={`${truck.freightCount} fletes relacionados`} />
            <Card>
              <div className="split-row">
                <span className="muted-text">Estado costo</span>
                <TruckProfitabilityBadge status={truck.profitabilityStatus} />
              </div>
              <strong className="metric-value">{truck.topCategory?.label || 'Sin costos'}</strong>
              <small>{truck.lastCostAt ? `Ultimo movimiento ${formatDate(truck.lastCostAt)}` : 'Sin movimientos en el periodo'}</small>
            </Card>
          </div>
          <div className={styles.costLayout}>
            <Card>
              <div className="stack">
                <div className="split-row">
                  <h2 className="section-title">Movimientos del camion</h2>
                  <span className="muted-text">Costo mensual/anual explicado</span>
                </div>
                <TruckCostTable costs={analytics?.costs || []} truckLabels={truckLabels} />
              </div>
            </Card>
            <TruckCostCategoryBreakdown categories={truck.categories} title="Composicion del camion" />
          </div>
        </>
      ) : null}
    </PageContainer>
  )
}

interface CostMetricProps {
  helper: string
  label: string
  value: string
}

function CostMetric({ helper, label, value }: CostMetricProps) {
  return (
    <Card>
      <span className="muted-text">{label}</span>
      <strong className="metric-value">{value}</strong>
      <small>{helper}</small>
    </Card>
  )
}
