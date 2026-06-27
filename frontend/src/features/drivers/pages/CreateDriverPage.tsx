import { Link } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Phone, Truck } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import styles from '../../trucks/components/TruckModule.module.css'
import { DriverForm } from '../components/DriverForm'

export function CreateDriverPage() {
  return (
    <PageContainer>
      <PageHeader
        actions={
          <Link to={ROUTES.drivers}>
            <Button icon={<ArrowLeft size={18} />} variant="secondary">
              Volver a choferes
            </Button>
          </Link>
        }
        description="Alta de chofer para asociar camiones, fletes y checklists."
        title="Nuevo chofer de flota"
      />
      <div className={styles.formLayout}>
        <Card className={styles.formCard}>
          <DriverForm />
        </Card>
        <Card className={styles.guideCard}>
          <div>
            <h2 className="section-title">Datos que evitan friccion</h2>
            <p className={styles.formHint}>La ficha debe permitir asignar rapido sin buscar informacion fuera del sistema.</p>
          </div>
          <div className={styles.guideList}>
            <div className={styles.guideItem}>
              <span className={styles.guideIcon}>
                <BadgeCheck aria-hidden size={16} />
              </span>
              <div>
                <strong>Licencia vigente</strong>
                <p className={styles.formHint}>Usala como criterio para decidir si puede salir a ruta.</p>
              </div>
            </div>
            <div className={styles.guideItem}>
              <span className={styles.guideIcon}>
                <Phone aria-hidden size={16} />
              </span>
              <div>
                <strong>Contacto directo</strong>
                <p className={styles.formHint}>Reduce llamadas internas cuando hay incidentes o cambios de despacho.</p>
              </div>
            </div>
            <div className={styles.guideItem}>
              <span className={styles.guideIcon}>
                <Truck aria-hidden size={16} />
              </span>
              <div>
                <strong>Vinculo con unidad</strong>
                <p className={styles.formHint}>La asignacion se visualiza desde la ficha maestra del camion.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
