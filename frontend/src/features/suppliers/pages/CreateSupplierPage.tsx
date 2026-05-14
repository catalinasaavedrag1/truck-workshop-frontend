import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import styles from '../../warehouse/components/InventoryModule.module.css'
import { SupplierForm } from '../components/SupplierForm'

export function CreateSupplierPage() {
  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <Link to={ROUTES.suppliers}>
              <Button icon={<ArrowLeft size={18} />} variant="secondary">
                Volver
              </Button>
            </Link>
          }
          description="Alta de proveedores con categorias, contacto operativo y trazabilidad de auditoria."
          title="Crear proveedor"
        />
        <Card>
          <SupplierForm />
        </Card>
      </div>
    </PageContainer>
  )
}
