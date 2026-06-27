import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { FleetAvailabilityBoard } from '../components/FleetAvailabilityBoard'
import { fleetAvailabilityMock, fleetTrucksMock } from '../mocks/fleet.mock'
import type { FleetAvailabilityItem, FleetTruck } from '../types/fleet.types'

export function FleetAvailabilityPage() {
  const { data: fleetAvailability } = useResourceList<FleetAvailabilityItem>(
    '/fleet/availability',
    fleetAvailabilityMock,
    { order: 'asc', sort: 'availableAt' },
  )
  const { data: fleetTrucks } = useResourceList<FleetTruck>('/fleet/trucks', fleetTrucksMock, {
    order: 'asc',
    sort: 'plate',
  })

  return (
    <PageContainer>
      <PageHeader
        description="Camiones disponibles hoy, bloqueados y quien los conduce."
        title="Disponibilidad de camiones"
      />
      <FleetAvailabilityBoard availability={fleetAvailability} trucks={fleetTrucks} />
    </PageContainer>
  )
}
