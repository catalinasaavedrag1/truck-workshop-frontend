import { useEffect, useMemo, useState } from 'react'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { TruckCostCategoryBreakdown } from '../components/TruckCostCategoryBreakdown'
import { TruckCostFleetTable } from '../components/TruckCostFleetTable'
import { TruckCostOverview } from '../components/TruckCostOverview'
import { TruckCostPeriodControls } from '../components/TruckCostPeriodControls'
import { TruckCostTable } from '../components/TruckCostTable'
import styles from '../components/TruckCostsModule.module.css'
import { getTruckCostAnalytics } from '../services/truckCostAnalytics.service'
import type { TruckCostAnalytics, TruckCostPeriodMode } from '../types/truckCosts.types'

export function TruckCostsPage() {
  const now = new Date()
  const [period, setPeriod] = useState<TruckCostPeriodMode>('monthly')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [analytics, setAnalytics] = useState<TruckCostAnalytics | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const truckLabels = useMemo(
    () => Object.fromEntries((analytics?.trucks || []).map((truck) => [truck.truckId, truck.plate])),
    [analytics?.trucks],
  )

  useEffect(() => {
    let isMounted = true

    getTruckCostAnalytics({ month, period, year })
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
  }, [month, period, year])

  return (
    <PageContainer>
      <PageHeader
        actions={
          <TruckCostPeriodControls
            month={month}
            onMonthChange={setMonth}
            onPeriodChange={setPeriod}
            onYearChange={setYear}
            period={period}
            year={year}
          />
        }
        description="Costo total por camion conectado con combustible, incidentes, fletes, peajes y registros manuales."
        title="Costos por camion"
      />
      {isLoading ? <LoadingState label="Calculando costos conectados" /> : null}
      {errorMessage ? <ErrorState description={errorMessage} title="No se pudieron cargar los costos" /> : null}
      {analytics ? (
        <>
          <TruckCostOverview analytics={analytics} />
          <div className={styles.costLayout}>
            <Card>
              <div className="stack">
                <div className="split-row">
                  <h2 className="section-title">Ranking operativo por camion</h2>
                  <span className="muted-text">{analytics.period.label}</span>
                </div>
                <TruckCostFleetTable period={period} trucks={analytics.trucks} />
              </div>
            </Card>
            <TruckCostCategoryBreakdown categories={analytics.categories} />
          </div>
          <Card>
            <div className="stack">
              <div className="split-row">
                <h2 className="section-title">Movimientos que explican el costo</h2>
                <span className="muted-text">Ledger + combustible + incidentes + fletes</span>
              </div>
              <TruckCostTable costs={analytics.costs} truckLabels={truckLabels} />
            </div>
          </Card>
        </>
      ) : null}
    </PageContainer>
  )
}
