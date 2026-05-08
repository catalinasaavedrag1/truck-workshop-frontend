import { Link } from 'react-router-dom'
import { ArrowLeft, Flag } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { DepartureChecklistForm } from '../components/DepartureChecklistForm'

export function DepartureChecklistPage() {
  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            <Link to={ROUTES.tripChecklists}>
              <Button icon={<ArrowLeft size={18} />} variant="secondary">
                Resumen
              </Button>
            </Link>
            <Link to={ROUTES.tripChecklistArrival}>
              <Button icon={<Flag size={18} />} variant="secondary">
                Entrada
              </Button>
            </Link>
          </div>
        }
        description="Inspeccion de patio antes del despacho: camion, chofer, flete, seguridad, documentos y evidencia."
        title="Registrar salida de camion"
      />
      <DepartureChecklistForm />
    </PageContainer>
  )
}
