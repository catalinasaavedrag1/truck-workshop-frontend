import { Link } from 'react-router-dom'
import { BarChart3, Plus } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { FuelEfficiencyCard } from '../components/FuelEfficiencyCard'
import { FuelOperationalPatterns } from '../components/FuelOperationalPatterns'
import { FuelPriceStatusCard } from '../components/FuelPriceStatusCard'
import { FuelRecordTable } from '../components/FuelRecordTable'
import styles from '../components/FuelModule.module.css'
import { fuelRecordsMock } from '../mocks/fuel.mock'
import type { FuelRecord } from '../types/fuel.types'

export function FuelPage() {
  const { data: fuelRecords } = useResourceList<FuelRecord>('/fuel', fuelRecordsMock, { order: 'desc', sort: 'date' })

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            <Link to={ROUTES.fuelNew}>
              <Button icon={<Plus size={18} />}>Nueva carga</Button>
            </Link>
            <Link to={ROUTES.fuelReport}>
              <Button icon={<BarChart3 size={18} />} variant="secondary">
                Reporte
              </Button>
            </Link>
          </div>
        }
        description="Cargas, costo, rendimiento km/l y desviaciones por camion."
        title="Combustible"
      />
      <FuelPriceStatusCard />
      <FuelEfficiencyCard records={fuelRecords} />
      <FuelOperationalPatterns />
      <Card>
        <div className={styles.tableShell}>
          <SectionHeader
            description="Cada carga se clasifica por respaldo, costo, rendimiento y accion operacional."
            title="Cargas recientes"
          />
          <FuelRecordTable records={fuelRecords} />
        </div>
      </Card>
    </PageContainer>
  )
}
