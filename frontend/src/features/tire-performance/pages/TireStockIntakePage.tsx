import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { TireStockIntakeForm } from '../components/TireStockIntakeForm'

export function TireStockIntakePage() {
  return (
    <PageContainer>
      <PageHeader
        actions={
          <Link to={ROUTES.tirePerformanceInstall}>
            <Button icon={<ArrowRight size={18} />} variant="secondary">
              Ir a instalacion
            </Button>
          </Link>
        }
        description="Inicia el ciclo real: cada unidad queda registrada en stock antes de instalarla en un camion."
        title="Ingreso de neumaticos a stock"
      />
      <TireStockIntakeForm />
    </PageContainer>
  )
}
