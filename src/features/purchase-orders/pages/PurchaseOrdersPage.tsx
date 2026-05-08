import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { InventoryModuleNav } from '../../warehouse/components/InventoryModuleNav'
import styles from '../../warehouse/components/InventoryModule.module.css'
import { PurchaseOrderTable } from '../components/PurchaseOrderTable'
import { purchaseOrdersMock } from '../mocks/purchaseOrders.mock'
import type { PurchaseOrder } from '../types/purchaseOrder.types'

export function PurchaseOrdersPage() {
  const { data: purchaseOrders } = useResourceList<PurchaseOrder>('/purchase-orders', purchaseOrdersMock, {
    order: 'desc',
    sort: 'createdAt',
  })

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <Link to={ROUTES.purchaseOrderNew}>
              <Button icon={<Plus size={18} />}>Nueva orden</Button>
            </Link>
          }
          description="Ordenes de compra conectadas a SKUs, proveedores, stock fisico y casos bloqueados."
          title="Compras de inventario"
        />
        <InventoryModuleNav />
        <Card>
          <PurchaseOrderTable purchaseOrders={purchaseOrders} />
        </Card>
      </div>
    </PageContainer>
  )
}
