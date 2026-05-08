import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { InventoryModuleNav } from '../components/InventoryModuleNav'
import styles from '../components/InventoryModule.module.css'
import { WarehouseManagerCard } from '../components/WarehouseManagerCard'
import { warehouseManagersMock } from '../mocks/warehouse.mock'
import type { WarehouseManager } from '../types/warehouse.types'

export function WarehouseManagersPage() {
  const { data: warehouseManagers } = useResourceList<WarehouseManager>('/warehouse/managers', warehouseManagersMock, {
    order: 'asc',
    sort: 'name',
  })

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          description="Responsables de ubicaciones, turnos, retiros y casos que requieren repuestos."
          title="Encargados de bodega"
        />
        <InventoryModuleNav />
        <div className="three-column-grid">
          {warehouseManagers.map((manager) => (
            <WarehouseManagerCard key={manager.id} manager={manager} />
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
