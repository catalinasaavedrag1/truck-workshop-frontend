import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { InventoryModuleNav } from '../../warehouse/components/InventoryModuleNav'
import { InventorySummaryStrip } from '../../warehouse/components/InventorySummaryStrip'
import styles from '../../warehouse/components/InventoryModule.module.css'
import { SupplierComparisonTable } from '../../warehouse/components/SupplierComparisonTable'
import { supplierSkuComparisonMock } from '../../warehouse/mocks/procurement.mock'
import { SupplierTable } from '../components/SupplierTable'
import { suppliersMock } from '../mocks/suppliers.mock'
import type { Supplier } from '../types/supplier.types'

export function SuppliersPage() {
  const { data: suppliers } = useResourceList<Supplier>('/suppliers', suppliersMock, { order: 'asc', sort: 'name' })
  const activeSuppliers = suppliers.filter((supplier) => supplier.status === 'active')
  const inactiveSuppliers = suppliers.filter((supplier) => supplier.status === 'inactive')
  const averageRating =
    suppliers.length > 0
      ? (suppliers.reduce((total, supplier) => total + supplier.rating, 0) / suppliers.length).toFixed(1)
      : '0.0'
  const activePurchaseOrders = suppliers.reduce((total, supplier) => total + supplier.activePurchaseOrderIds.length, 0)
  const averageDeliveryDays =
    suppliers.length > 0
      ? Math.round(suppliers.reduce((total, supplier) => total + supplier.averageDeliveryDays, 0) / suppliers.length)
      : 0

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <Link to={ROUTES.supplierNew}>
              <Button icon={<Plus size={18} />}>Nuevo proveedor</Button>
            </Link>
          }
          description="Decision de proveedor por lead time real, cumplimiento, precio historico, reclamos, documentos y OC activas."
          title="Proveedores de abastecimiento"
        />
        <InventoryModuleNav />
        <InventorySummaryStrip
          items={[
            { helper: 'disponibles para comprar', label: 'Activos', tone: 'success', value: activeSuppliers.length },
            { helper: 'fuera de operacion', label: 'Inactivos', tone: inactiveSuppliers.length > 0 ? 'warning' : 'neutral', value: inactiveSuppliers.length },
            { helper: `${activePurchaseOrders} OC activas`, label: 'Rating promedio', tone: 'info', value: averageRating },
            { helper: 'promedio historico', label: 'Entrega', tone: 'neutral', value: `${averageDeliveryDays} dias` },
          ]}
        />
        <Card>
          <div className="stack">
            <SectionHeader
              description="Lista para decidir rapido a quien comprar segun estado, categoria, rating y entrega promedio."
              title="Directorio operacional"
            />
            <SupplierTable suppliers={suppliers} />
          </div>
        </Card>
        <Card>
          <div className="stack">
            <SectionHeader
              description="Compara precio, variacion, lead time real, cumplimiento, OC abiertas y reclamos por SKU."
              title="Comparacion de proveedores por SKU"
            />
            <SupplierComparisonTable rows={supplierSkuComparisonMock} />
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
