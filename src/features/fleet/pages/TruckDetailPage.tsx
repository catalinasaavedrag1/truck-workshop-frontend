import { useParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceItem } from '../../../shared/hooks/useResourceItem'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { MaintenanceTruckContextPanel } from '../../preventive-maintenance/components/MaintenanceTruckContextPanel'
import { preventiveMaintenanceMock } from '../../preventive-maintenance/mocks/preventiveMaintenance.mock'
import type { PreventiveMaintenancePlan } from '../../preventive-maintenance/types/preventiveMaintenance.types'
import { TruckHealthScoreCard } from '../components/TruckHealthScoreCard'
import { TruckOperationalSummary } from '../components/TruckOperationalSummary'
import { TruckTimeline } from '../components/TruckTimeline'
import { fleetTrucksMock, truckHealthScoresMock, truckTimelineMock } from '../mocks/fleet.mock'
import type { TruckHealthScore, TruckTimelineEvent } from '../types/fleet.types'

export function TruckDetailPage() {
  const { truckId } = useParams()
  const { data: truck } = useResourceItem('/fleet/trucks', truckId, fleetTrucksMock)
  const { data: truckHealthScores } = useResourceList<TruckHealthScore>(
    '/fleet/health-scores',
    truckHealthScoresMock,
    { order: 'asc', sort: 'score' },
  )
  const { data: truckTimeline } = useResourceList<TruckTimelineEvent>(
    '/fleet/timeline-events',
    truckTimelineMock,
    { order: 'desc', sort: 'eventDate' },
  )
  const { data: preventivePlans } = useResourceList<PreventiveMaintenancePlan>(
    '/preventive-maintenance/plans',
    preventiveMaintenanceMock,
    { order: 'asc', sort: 'nextDueAt' },
  )

  if (!truck) {
    return (
      <PageContainer>
        <EmptyState icon={<AlertCircle size={22} />} title="Camion no encontrado" />
      </PageContainer>
    )
  }

  const score = truckHealthScores.find((item) => item.truckId === truck.id)
  const timeline = truckTimeline.filter((item) => item.truckId === truck.id)
  const truckPreventivePlans = preventivePlans.filter((plan) => plan.truckId === truck.id)

  return (
    <PageContainer>
      <PageHeader
        description={`${truck.brand} ${truck.model} - VIN ${truck.vin}`}
        title={`Ficha camion ${truck.plate}`}
      />
      <div className="two-column-grid">
        <TruckOperationalSummary truck={truck} />
        {score ? <TruckHealthScoreCard score={score} truck={truck} /> : null}
      </div>
      <MaintenanceTruckContextPanel plans={truckPreventivePlans} truck={truck} />
      <div className="three-column-grid">
        <Card>
          <h2 className="section-title">Documentos</h2>
          <p className="muted-text">Permiso, revision tecnica, seguros y certificados conectados al camion.</p>
          <strong>{truck.id === 'truck-002' ? '1 vencido' : 'Al dia'}</strong>
        </Card>
        <Card>
          <h2 className="section-title">Costos y combustible</h2>
          <p className="muted-text">Combustible, taller, neumaticos, peajes y permisos.</p>
          <strong>{truck.id === 'truck-005' ? 'Costo/km controlado' : 'Revisar costo/km'}</strong>
        </Card>
        <Card>
          <h2 className="section-title">Fletes e incidentes</h2>
          <p className="muted-text">Conecta chofer, checklist, flete, incidente y rentabilidad.</p>
          <strong>{truck.nextFreightId || 'Sin flete programado'}</strong>
        </Card>
      </div>
      <TruckTimeline events={timeline} />
    </PageContainer>
  )
}
