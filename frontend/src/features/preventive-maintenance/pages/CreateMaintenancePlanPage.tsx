import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { MaintenancePlanForm } from '../components/MaintenancePlanForm'

export function CreateMaintenancePlanPage() {
  return (
    <PageContainer>
      <PageHeader
        actions={
          <Link to={ROUTES.preventiveMaintenance}>
            <Button icon={<ArrowLeft size={18} />} variant="secondary">
              Volver
            </Button>
          </Link>
        }
        description="Crea reglas por kilometraje, fecha o ambas para dejar listo el flujo preventivo."
        title="Crear plan de mantencion"
      />
      <MaintenancePlanForm />
    </PageContainer>
  )
}
