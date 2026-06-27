import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { FreightCostBreakdown } from '../components/FreightCostBreakdown'
import { FreightProfitabilityChart } from '../components/FreightProfitabilityChart'
import { FreightProfitabilityCards } from '../components/FreightProfitabilityCards'
import { FreightProfitabilityTable } from '../components/FreightProfitabilityTable'
import styles from '../components/FreightProfitability.module.css'
import { freightProfitabilityMock } from '../mocks/freightProfitability.mock'
import type { FreightProfitability } from '../types/freightProfitability.types'

export function FreightProfitabilityPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data: profitabilityItems } = useResourceList<FreightProfitability>(
    '/freight-profitability',
    freightProfitabilityMock,
    { order: 'desc', sort: 'grossMargin' },
  )
  const sortedItems = useMemo(
    () => [...profitabilityItems].sort((first, second) => second.grossMargin - first.grossMargin),
    [profitabilityItems],
  )
  const selectedItem = sortedItems.find((item) => item.id === selectedId) || sortedItems[0]

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <div className="inline-actions">
              <Link to={ROUTES.freightRequests}>
                <Button size="sm" variant="secondary">
                  Solicitudes
                </Button>
              </Link>
              <Link to={ROUTES.driverTripSheets}>
                <Button size="sm" variant="secondary">
                  Planillas
                </Button>
              </Link>
              <Link to={ROUTES.freightAssignments}>
                <Button size="sm" variant="primary">
                  Asignaciones
                </Button>
              </Link>
            </div>
          }
          description="Tarifa, costo/km y margen neto por ruta."
          title="Rentabilidad por flete"
        />
        <FreightProfitabilityCards items={profitabilityItems} />
        <FreightProfitabilityChart items={sortedItems} onSelect={setSelectedId} selectedId={selectedItem?.id} />
        <div className={styles.workspace}>
          <Card className={styles.tablePanel}>
            <div className={styles.tableShell}>
              <SectionHeader
                description="Selecciona un flete para ver el desglose de costos y su lectura por kilometro."
                title="Fletes cerrados con rentabilidad calculada"
              />
              <FreightProfitabilityTable
                items={sortedItems}
                onSelect={setSelectedId}
                selectedId={selectedItem?.id}
              />
            </div>
          </Card>
          {selectedItem ? (
            <FreightCostBreakdown item={selectedItem} />
          ) : (
            <EmptyState title="Sin datos de rentabilidad" />
          )}
        </div>
      </div>
    </PageContainer>
  )
}
