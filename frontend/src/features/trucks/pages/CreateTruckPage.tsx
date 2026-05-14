import { Link } from 'react-router-dom'
import { ArrowLeft, ClipboardCheck, Gauge, ShieldCheck } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import styles from '../components/TruckModule.module.css'
import { TruckForm } from '../components/TruckForm'

export function CreateTruckPage() {
  return (
    <PageContainer>
      <PageHeader
        actions={
          <Link to={ROUTES.fleetTrucks}>
            <Button icon={<ArrowLeft size={18} />} variant="secondary">
              Volver a ficha camiones
            </Button>
          </Link>
        }
        description="Alta unica de unidad para que luego pueda usarse en disponibilidad, taller, documentos, fletes y costos."
        title="Nuevo camion de flota"
      />
      <div className={styles.formLayout}>
        <TruckForm />
        <Card className={styles.guideCard}>
          <div>
            <h2 className="section-title">Criterios de alta</h2>
            <p className={styles.formHint}>Completa datos verificables para evitar duplicados y errores de agenda.</p>
          </div>
          <div className={styles.guideList}>
            <div className={styles.guideItem}>
              <span className={styles.guideIcon}>
                <ShieldCheck aria-hidden size={16} />
              </span>
              <div>
                <strong>Identificacion unica</strong>
                <p className={styles.formHint}>Patente y VIN deben coincidir con los documentos del camion.</p>
              </div>
            </div>
            <div className={styles.guideItem}>
              <span className={styles.guideIcon}>
                <Gauge aria-hidden size={16} />
              </span>
              <div>
                <strong>Kilometraje actual</strong>
                <p className={styles.formHint}>Usalo para ordenar mantenciones y evaluar desgaste.</p>
              </div>
            </div>
            <div className={styles.guideItem}>
              <span className={styles.guideIcon}>
                <ClipboardCheck aria-hidden size={16} />
              </span>
              <div>
                <strong>Estado inicial</strong>
                <p className={styles.formHint}>Si ingresa con falla, parte como en taller o bloqueado.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
