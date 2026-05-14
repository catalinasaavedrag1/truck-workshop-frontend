import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { CreateCaseForm } from '../components/CreateCaseForm'

export function CreateWorkshopCasePage() {
  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            <Link to={ROUTES.fleetAvailability}>
              <Button size="sm" variant="secondary">
                Ver disponibilidad
              </Button>
            </Link>
            <Link to={ROUTES.cases}>
              <Button size="sm" variant="secondary">
                Casos abiertos
              </Button>
            </Link>
          </div>
        }
        description="Ingreso operativo de taller conectado con flota, disponibilidad, diagnostico y agenda."
        title="Crear caso de taller"
      />
      <CreateCaseForm />
    </PageContainer>
  )
}
