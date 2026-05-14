import { Link } from 'react-router-dom'
import { Activity, ClipboardList, FileWarning, Truck } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { formatDate } from '../../../shared/utils/formatDate'
import { driversMock } from '../../drivers/mocks/drivers.mock'
import type { Driver } from '../../drivers/types/driver.types'
import { FleetAvailabilityBoard } from '../components/FleetAvailabilityBoard'
import { FleetOperationsHub } from '../components/FleetOperationsHub'
import { FleetStatsCards } from '../components/FleetStatsCards'
import { TruckHealthScoreCard } from '../components/TruckHealthScoreCard'
import {
  fleetAvailabilityMock,
  fleetTrucksMock,
  truckHealthScoresMock,
} from '../mocks/fleet.mock'
import type { FleetAvailabilityItem, FleetMetric, FleetTruck, TruckHealthScore } from '../types/fleet.types'

export function FleetDashboardPage() {
  const { data: fleetAvailability } = useResourceList<FleetAvailabilityItem>(
    '/fleet/availability',
    fleetAvailabilityMock,
    { order: 'asc', sort: 'availableAt' },
  )
  const { data: fleetTrucks } = useResourceList<FleetTruck>('/fleet/trucks', fleetTrucksMock, {
    order: 'asc',
    sort: 'plate',
  })
  const { data: drivers } = useResourceList<Driver>('/drivers', driversMock, { order: 'asc', sort: 'name' })
  const { data: truckHealthScores } = useResourceList<TruckHealthScore>(
    '/fleet/health-scores',
    truckHealthScoresMock,
    { order: 'asc', sort: 'score' },
  )
  const averageScore = truckHealthScores.length
    ? Math.round(truckHealthScores.reduce((total, score) => total + score.score, 0) / truckHealthScores.length)
    : 0
  const fleetMetrics: FleetMetric[] = [
    { label: 'Total camiones', value: String(fleetTrucks.length), helper: 'Flota activa registrada' },
    {
      label: 'Disponibles',
      value: String(fleetTrucks.filter((truck) => truck.operationalStatus === 'AVAILABLE').length),
      helper: 'Pueden asignarse hoy',
    },
    {
      label: 'En ruta',
      value: String(fleetTrucks.filter((truck) => truck.operationalStatus === 'ON_ROUTE').length),
      helper: 'Con flete activo',
    },
    {
      label: 'En taller',
      value: String(fleetTrucks.filter((truck) => truck.operationalStatus === 'IN_WORKSHOP').length),
      helper: 'Diagnostico o reparacion',
    },
    {
      label: 'Bloqueados',
      value: String(fleetTrucks.filter((truck) => truck.operationalStatus === 'BLOCKED').length),
      helper: 'No aptos para despacho',
    },
    { label: 'Health score prom.', value: `${averageScore}/100`, helper: 'Promedio operacional' },
  ]
  const worstScores = [...truckHealthScores].sort((a, b) => a.score - b.score).slice(0, 2)

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            <Link to={ROUTES.fleetAvailability}>
              <Button icon={<Truck size={18} />}>Ver disponibilidad</Button>
            </Link>
            <Link to={ROUTES.fleetHealthScore}>
              <Button icon={<Activity size={18} />} variant="secondary">
                Health score
              </Button>
            </Link>
          </div>
        }
        description="Control total de camiones, disponibilidad, riesgos, documentos, mantenciones y costos."
        title="Centro de flota"
      />
      <FleetOperationsHub drivers={drivers} healthScoreAverage={averageScore} trucks={fleetTrucks} />
      <FleetStatsCards metrics={fleetMetrics} />
      <div className="two-column-grid">
        <Card>
          <div className="section-heading-row">
            <div>
              <h2 className="section-title">Disponibilidad operacional</h2>
              <p className="muted-text">Camiones listos y bloqueados con su causa principal.</p>
            </div>
            <FileWarning size={20} />
          </div>
          <FleetAvailabilityBoard availability={fleetAvailability} showEmptyColumns={false} trucks={fleetTrucks} />
        </Card>
        <Card>
          <div className="section-heading-row">
            <div>
              <h2 className="section-title">Proximos eventos</h2>
              <p className="muted-text">Alertas operativas para hoy.</p>
            </div>
            <ClipboardList size={20} />
          </div>
          <div className="stack">
            <div className="list-row">
              <span>Revision tecnica KL-DF-91</span>
              <strong>Vencida</strong>
            </div>
            <div className="list-row">
              <span>Cambio aceite PR-JK-65</span>
              <strong>900 km</strong>
            </div>
            <div className="list-row">
              <span>Checklist salida BD-FR-80</span>
              <strong>{formatDate('2026-05-06T08:00:00.000Z')}</strong>
            </div>
          </div>
        </Card>
      </div>
      <div className="two-column-grid">
        {worstScores.map((score) => (
          <TruckHealthScoreCard
            key={score.truckId}
            score={score}
            truck={fleetTrucks.find((truck) => truck.id === score.truckId)}
          />
        ))}
      </div>
    </PageContainer>
  )
}
