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
import { SupplierTable } from '../components/SupplierTable'
import { suppliersMock } from '../mocks/suppliers.mock'
import type { Supplier } from '../types/supplier.types'

export function SuppliersPage() {
  const { data: suppliers } = useResourceList<Supplier>('/suppliers', suppliersMock, { order: 'asc', sort: 'name' })

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <Link to={ROUTES.supplierNew}>
              <Button icon={<Plus size={18} />}>Nuevo proveedor</Button>
            </Link>
          }
          description="Proveedores de repuestos conectados a categorias, tiempos de entrega, compras y rating operacional."
          title="Proveedores de inventario"
        />
        <InventoryModuleNav />
        <Card>
          <SupplierTable suppliers={suppliers} />
        </Card>
      </div>
    </PageContainer>
  )
}
