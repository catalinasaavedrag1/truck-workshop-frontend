import { Link } from 'react-router-dom'
import { List, Truck } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { IncidentForm } from '../components/IncidentForm'
import styles from '../components/IncidentsModule.module.css'

export function CreateIncidentPage() {
  return (
    <PageContainer>
      <div className={styles.pageStack}>
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
          breadcrumbs={[
            { href: ROUTES.incidents, label: 'Incidentes' },
            { label: 'Nueva incidencia' },
          ]}
          description="Centro operativo para registrar, clasificar, conectar y derivar una incidencia logistica en pocos pasos."
          title="Nueva incidencia"
        />
        <IncidentForm />
      </div>
    </PageContainer>
  )
}
