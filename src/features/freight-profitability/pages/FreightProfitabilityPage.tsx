import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { FreightCostBreakdown } from '../components/FreightCostBreakdown'
import { FreightProfitabilityCards } from '../components/FreightProfitabilityCards'
import { FreightProfitabilityTable } from '../components/FreightProfitabilityTable'
import { freightProfitabilityMock } from '../mocks/freightProfitability.mock'
import type { FreightProfitability } from '../types/freightProfitability.types'

export function FreightProfitabilityPage() {
  const { data: profitabilityItems } = useResourceList<FreightProfitability>(
    '/freight-profitability',
    freightProfitabilityMock,
    { order: 'desc', sort: 'grossMargin' },
  )

  return (
    <PageContainer>
      <PageHeader
        description="Compara precio cobrado, combustible, peajes, chofer, desgaste, mantencion y margen por flete."
        title="Rentabilidad por flete"
      />
      <FreightProfitabilityCards items={profitabilityItems} />
      <div className="two-column-grid">
        <Card>
          <FreightProfitabilityTable items={profitabilityItems} />
        </Card>
        {profitabilityItems[0] ? (
          <FreightCostBreakdown item={profitabilityItems[0]} />
        ) : (
          <EmptyState title="Sin datos de rentabilidad" />
        )}
      </div>
    </PageContainer>
  )
}
