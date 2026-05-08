import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CircleDollarSign, Gauge, TriangleAlert } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { FuelEfficiencyCard } from '../components/FuelEfficiencyCard'
import { FuelPriceStatusCard } from '../components/FuelPriceStatusCard'
import styles from '../components/FuelModule.module.css'
import { FuelRecordTable } from '../components/FuelRecordTable'
import { FuelReportFilters } from '../components/FuelReportFilters'
import type { FuelReportFilterState } from '../components/FuelReportFilters'
import { fuelRecordsMock } from '../mocks/fuel.mock'
import type { FuelRecord } from '../types/fuel.types'
import { getAverageKmPerLiter, getTotalFuelCost } from '../utils/fuelAnalytics'

export function FuelReportPage() {
  const { data: fuelRecords } = useResourceList<FuelRecord>('/fuel', fuelRecordsMock, { order: 'desc', sort: 'date' })
  const [filters, setFilters] = useState<FuelReportFilterState>({
    deviation: 'all',
    driverId: 'all',
    query: '',
    truckId: 'all',
  })

  const filteredRecords = useMemo(() => {
    const query = filters.query.trim().toLowerCase()

    return fuelRecords.filter((record) => {
      const matchesQuery = [record.stationName, record.receiptNumber || '', record.notes || '', record.truckId, record.driverId]
        .join(' ')
        .toLowerCase()
        .includes(query)
      const matchesTruck = filters.truckId === 'all' || record.truckId === filters.truckId
      const matchesDriver = filters.driverId === 'all' || record.driverId === filters.driverId
      const matchesDeviation = filters.deviation === 'all' || record.deviationStatus === filters.deviation

      return matchesQuery && matchesTruck && matchesDriver && matchesDeviation
    })
  }, [filters, fuelRecords])

  const suspicious = filteredRecords.filter((record) => record.deviationStatus === 'SUSPICIOUS')
  const warning = filteredRecords.filter((record) => record.deviationStatus === 'WARNING')

  return (
    <PageContainer>
      <PageHeader
        actions={
          <Link to={ROUTES.fuel}>
            <Button icon={<ArrowLeft size={18} />} variant="secondary">
              Combustible
            </Button>
          </Link>
        }
        description="Reporte para detectar desviaciones de consumo, cargas sospechosas y gasto por unidad o chofer."
        title="Reporte combustible"
      />
      <FuelReportFilters
        filters={filters}
        onChange={setFilters}
        onClear={() =>
          setFilters({
            deviation: 'all',
            driverId: 'all',
            query: '',
            truckId: 'all',
          })
        }
      />
      <FuelPriceStatusCard compact />
      <FuelEfficiencyCard records={filteredRecords} />
      <div className={styles.reportGrid}>
        <Card>
          <div className={styles.tableShell}>
            <SectionHeader
              description={`${filteredRecords.length} de ${fuelRecords.length} cargas visibles con los filtros actuales.`}
              title="Resultado filtrado"
            />
            <FuelRecordTable records={filteredRecords} />
          </div>
        </Card>
        <Card className={styles.insightCard}>
          <div className={styles.insightHeader}>
            <div className={styles.insightCopy}>
              <h2 className="section-title">Lectura ejecutiva</h2>
              <p className={styles.muted}>Prioriza acciones segun costo, rendimiento y severidad.</p>
            </div>
            <Badge tone={suspicious.length > 0 ? 'danger' : warning.length > 0 ? 'warning' : 'success'}>
              {suspicious.length > 0 ? 'Investigar' : warning.length > 0 ? 'Controlar' : 'Normal'}
            </Badge>
          </div>
          <div className={styles.insightList}>
            <div className={styles.insightItem}>
              <span className={styles.insightIcon}>
                <TriangleAlert aria-hidden size={16} />
              </span>
              <div>
                <strong>{suspicious.length} cargas a investigar</strong>
                <p className={styles.muted}>Revisar comprobante, odometro y ruta asociada.</p>
              </div>
            </div>
            <div className={styles.insightItem}>
              <span className={styles.insightIcon}>
                <Gauge aria-hidden size={16} />
              </span>
              <div>
                <strong>{getAverageKmPerLiter(filteredRecords).toFixed(1)} km/l promedio</strong>
                <p className={styles.muted}>Comparar contra historico del camion antes de sancionar.</p>
              </div>
            </div>
            <div className={styles.insightItem}>
              <span className={styles.insightIcon}>
                <CircleDollarSign aria-hidden size={16} />
              </span>
              <div>
                <strong>{getTotalFuelCost(filteredRecords).toLocaleString('es-CL', { currency: 'CLP', style: 'currency' })}</strong>
                <p className={styles.muted}>Costo total de la muestra filtrada.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
