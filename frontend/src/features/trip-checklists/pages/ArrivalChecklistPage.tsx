import { Link } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { ArrivalChecklistForm } from '../components/ArrivalChecklistForm'

export function ArrivalChecklistPage() {
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
            <Link to={ROUTES.tripChecklistDeparture}>
              <Button icon={<Send size={18} />} variant="secondary">
                Salida
              </Button>
            </Link>
          </div>
        }
        description="Cierra el retorno del camion: kilometraje final, combustible, recepcion, danos y evidencia."
        title="Registrar entrada de camion"
      />
      <ArrivalChecklistForm />
    </PageContainer>
  )
}
