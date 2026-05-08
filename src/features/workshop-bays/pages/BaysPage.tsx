import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { BayTable } from '../components/BayTable'
import { workshopBaysMock } from '../mocks/workshopBays.mock'
import type { WorkshopBay } from '../types/workshopBay.types'

export function BaysPage() {
  const { data: workshopBays } = useResourceList<WorkshopBay>('/bays', workshopBaysMock, {
    order: 'asc',
    sort: 'name',
  })
  const available = workshopBays.filter((bay) => bay.status === 'available').length
  const occupied = workshopBays.filter((bay) => bay.status === 'occupied').length
  const maintenance = workshopBays.filter((bay) => bay.status === 'maintenance').length

  return (
    <PageContainer>
      <PageHeader
        description="Puestos fisicos disponibles para mecanica, diagnostico, electrica, lavado y prueba."
        title="Estaciones de trabajo"
      />
      <div className="three-column-grid">
        <Card>
          <div className="stack">
            <span className="muted-text">Disponibles</span>
            <strong className="metric-value">{available}</strong>
          </div>
        </Card>
        <Card>
          <div className="stack">
            <span className="muted-text">Ocupadas</span>
            <strong className="metric-value">{occupied}</strong>
          </div>
        </Card>
        <Card>
          <div className="stack">
            <span className="muted-text">En mantencion</span>
            <strong className="metric-value">{maintenance}</strong>
          </div>
        </Card>
      </div>
      <Card>
        <BayTable bays={workshopBays} />
      </Card>
    </PageContainer>
  )
}
