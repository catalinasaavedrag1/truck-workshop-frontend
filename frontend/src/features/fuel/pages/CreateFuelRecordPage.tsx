import { Link } from 'react-router-dom'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { FuelPriceStatusCard } from '../components/FuelPriceStatusCard'
import { FuelRecordForm } from '../components/FuelRecordForm'

export function CreateFuelRecordPage() {
  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            <Link to={ROUTES.fuel}>
              <Button icon={<ArrowLeft size={18} />} variant="secondary">
                Combustible
              </Button>
            </Link>
            <Link to={ROUTES.fuelReport}>
              <Button icon={<BarChart3 size={18} />} variant="secondary">
                Reporte
              </Button>
            </Link>
          </div>
        }
        description="Registra una carga con contexto, costo, odometro y evidencia para calcular rendimiento."
        title="Registrar combustible"
      />
      <FuelPriceStatusCard compact />
      <FuelRecordForm />
    </PageContainer>
  )
}
