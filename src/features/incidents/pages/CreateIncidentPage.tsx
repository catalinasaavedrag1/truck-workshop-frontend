import { Link } from 'react-router-dom'
import { List, Truck } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { IncidentForm } from '../components/IncidentForm'

export function CreateIncidentPage() {
  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            <Link to={ROUTES.incidents}>
              <Button icon={<List size={18} />} size="sm" variant="secondary">
                Ver incidentes
              </Button>
            </Link>
            <Link to={ROUTES.fleetAvailability}>
              <Button icon={<Truck size={18} />} size="sm" variant="secondary">
                Flota
              </Button>
            </Link>
          </div>
        }
        description="Registro conectado con camion, chofer, flete, taller, costos y documentacion para evitar incidencias aisladas."
        title="Registrar incidente"
      />
      <IncidentForm />
    </PageContainer>
  )
}
