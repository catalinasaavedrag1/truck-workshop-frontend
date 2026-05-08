import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { InventoryModuleNav } from '../../warehouse/components/InventoryModuleNav'
import styles from '../../warehouse/components/InventoryModule.module.css'
import { PurchaseOrderForm } from '../components/PurchaseOrderForm'

export function CreatePurchaseOrderPage() {
  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          description="Genera una orden desde una solicitud, un SKU bajo minimo o una compra directa de inventario."
          title="Crear orden de compra"
        />
        <InventoryModuleNav />
        <Card>
          <PurchaseOrderForm />
        </Card>
      </div>
    </PageContainer>
  )
}
