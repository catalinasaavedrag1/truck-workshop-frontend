import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Gauge, Plus, Truck, Users } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { FilterBar } from '../../../shared/components/FilterBar/FilterBar'
import { MetricCard } from '../../../shared/components/MetricCard/MetricCard'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { Select } from '../../../shared/components/Select/Select'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import styles from '../../trucks/components/TruckModule.module.css'
import { DriverTable } from '../components/DriverTable'
import { driverDocumentsMock, driverFinesMock } from '../mocks/driverDocuments.mock'
import { driversMock } from '../mocks/drivers.mock'
import type { Driver, DriverDocument, DriverFine, DriverStatus } from '../types/driver.types'
import { getDriverComplianceSummary } from '../utils/driverCompliance'

const statusOptions: { label: string; value: DriverStatus | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Activos', value: 'active' },
  { label: 'Inactivos', value: 'inactive' },
]

export function DriversPage() {
  const [searchParams] = useSearchParams()
  const statusQuery = searchParams.get('status')
  const [status, setStatus] = useState<DriverStatus | 'all'>(
    statusQuery === 'active' || statusQuery === 'inactive' ? statusQuery : 'all',
  )
  const { data: drivers } = useResourceList<Driver>('/drivers', driversMock, { sort: 'name', order: 'asc' })
  const { data: documents } = useResourceList<DriverDocument>('/driver-documents', driverDocumentsMock, {
    sort: 'expiresAt',
    order: 'asc',
  })
  const { data: fines } = useResourceList<DriverFine>('/driver-fines', driverFinesMock, {
    sort: 'occurredAt',
    order: 'desc',
  })
  const { data: trucks } = useResourceList<FleetTruck>('/fleet/trucks', fleetTrucksMock, { sort: 'plate', order: 'asc' })

  const filteredDrivers = useMemo(
    () => drivers.filter((driver) => status === 'all' || driver.status === status),
    [drivers, status],
  )
  const summary = useMemo(() => {
    const assignedDriverIds = new Set(trucks.map((truck) => truck.assignedDriverId).filter(Boolean))
    const complianceSummaries = drivers.map((driver) =>
      getDriverComplianceSummary(
        driver,
        documents.filter((document) => document.driverId === driver.id),
        fines.filter((fine) => fine.driverId === driver.id),
      ),
    )

    return {
      active: drivers.filter((driver) => driver.status === 'active').length,
      assigned: drivers.filter((driver) => assignedDriverIds.has(driver.id)).length,
      blocked: complianceSummaries.filter((item) => item.tone === 'danger').length,
      documentIssues: complianceSummaries.reduce((total, item) => total + item.documentIssueCount, 0),
      finesOpen: complianceSummaries.reduce((total, item) => total + item.activeFineCount, 0),
      inactive: drivers.filter((driver) => driver.status === 'inactive').length,
      total: drivers.length,
    }
  }, [documents, drivers, fines, trucks])
  const statusLabel = statusOptions.find((option) => option.value === status)?.label

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            <Link to={ROUTES.driverNew}>
              <Button icon={<Plus size={18} />}>Nuevo chofer</Button>
            </Link>
            <Link to={ROUTES.fleetTrucks}>
              <Button icon={<Truck size={18} />} variant="secondary">
                Ficha camiones
              </Button>
            </Link>
            <Link to={ROUTES.driverPerformanceReport}>
              <Button icon={<Gauge size={18} />} variant="secondary">
                Rendimiento
              </Button>
            </Link>
          </div>
        }
        description="Submodulo de flota para controlar disponibilidad de choferes, licencia, contacto y unidad asignada."
        title="Choferes de flota"
      />
      <div className={styles.summaryGrid}>
        <MetricCard icon={<Users aria-hidden size={18} />} label="Choferes registrados" to={ROUTES.drivers} value={summary.total} />
        <MetricCard
          helper="Pueden ser asignados a rutas o unidades"
          icon={<CheckCircle2 aria-hidden size={18} />}
          label="Activos"
          tone="success"
          to={`${ROUTES.drivers}?status=active`}
          value={summary.active}
        />
        <MetricCard
          helper="Con camion vinculado en ficha maestra"
          icon={<Truck aria-hidden size={18} />}
          label="Con unidad"
          tone="info"
          to={ROUTES.drivers}
          value={summary.assigned}
        />
        <MetricCard
          helper={`${summary.documentIssues} documentos observados`}
          icon={<Users aria-hidden size={18} />}
          label="Con bloqueo"
          tone={summary.blocked > 0 ? 'danger' : 'success'}
          to={ROUTES.drivers}
          value={summary.blocked}
        />
        <MetricCard
          helper="Multas abiertas o en revision"
          icon={<Users aria-hidden size={18} />}
          label="Multas activas"
          tone={summary.finesOpen > 0 ? 'warning' : 'success'}
          to={ROUTES.drivers}
          value={summary.finesOpen}
        />
      </div>
      <FilterBar
        activeCount={status !== 'all' ? 1 : 0}
        activeFilters={
          status !== 'all'
            ? [{ label: 'Estado', onRemove: () => setStatus('all'), value: statusLabel }]
            : []
        }
        description="Filtra por estado y usa la busqueda de la tabla para encontrar chofer, documento, licencia o patente asociada."
        onClear={() => setStatus('all')}
        title="Filtro de choferes"
      >
        <Select
          label="Estado"
          name="driverStatus"
          onChange={(event) => setStatus(event.target.value as DriverStatus | 'all')}
          options={statusOptions}
          value={status}
        />
      </FilterBar>
      <Card>
        <DriverTable documents={documents} drivers={filteredDrivers} fines={fines} trucks={trucks} />
      </Card>
    </PageContainer>
  )
}
