import { AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../Button/Button'
import { EmptyState } from '../EmptyState/EmptyState'
import { PageContainer } from '../../layout/PageContainer/PageContainer'

export function RouteNotFound() {
  return (
    <PageContainer>
      <EmptyState
        action={(
          <Link to={ROUTES.dashboard}>
            <Button>Volver al dashboard</Button>
          </Link>
        )}
        description="La ruta no existe o ya no esta disponible. Usa la busqueda global o vuelve al panel operativo."
        icon={<AlertCircle size={22} />}
        title="Vista no encontrada"
      />
    </PageContainer>
  )
}
