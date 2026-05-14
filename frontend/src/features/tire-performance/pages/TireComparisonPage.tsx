import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { TireComparisonChart } from '../components/TireComparisonChart'
import { TireDecisionPanel } from '../components/TireDecisionPanel'
import { TireModuleNav } from '../components/TireModuleNav'
import { TirePerformanceSummaryCards } from '../components/TirePerformanceSummaryCards'
import { tirePerformanceMock } from '../mocks/tirePerformance.mock'
import type { TireLifecycle } from '../types/tirePerformance.types'

export function TireComparisonPage() {
  const { data: tirePerformance } = useResourceList<TireLifecycle>(
    '/tire-performance/tires',
    tirePerformanceMock,
    { order: 'desc', sort: 'purchaseDate' },
  )

  return (
    <PageContainer>
      <PageHeader
        description="Compara nuevos vs recauchados por costo/km, kilometros rendidos, proveedor y marca."
        title="Comparacion de neumaticos"
      />
      <TireModuleNav />
      <TireDecisionPanel tires={tirePerformance} />
      <TirePerformanceSummaryCards tires={tirePerformance} />
      <TireComparisonChart tires={tirePerformance} />
    </PageContainer>
  )
}
