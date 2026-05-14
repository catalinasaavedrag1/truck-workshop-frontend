import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { InventoryModuleNav } from '../components/InventoryModuleNav'
import { InventorySummaryStrip } from '../components/InventorySummaryStrip'
import styles from '../components/InventoryModule.module.css'
import { WarehouseManagerCard } from '../components/WarehouseManagerCard'
import { warehouseManagersMock } from '../mocks/warehouse.mock'
import type { WarehouseManager } from '../types/warehouse.types'

export function WarehouseManagersPage() {
  const { data: warehouseManagers } = useResourceList<WarehouseManager>('/warehouse/managers', warehouseManagersMock, {
    order: 'asc',
    sort: 'name',
  })
  const activeCases = warehouseManagers.reduce((total, manager) => total + manager.activeCases, 0)
  const assignedLocations = new Set(warehouseManagers.flatMap((manager) => manager.assignedLocationIds)).size
  const averageLoad = warehouseManagers.length > 0 ? Math.round(activeCases / warehouseManagers.length) : 0

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          description="Responsables de ubicaciones, turnos, retiros y casos que requieren repuestos."
          title="Encargados de bodega"
        />
        <InventoryModuleNav />
        <InventorySummaryStrip
          items={[
            { helper: 'responsables visibles', label: 'Encargados', tone: 'neutral', value: warehouseManagers.length },
            { helper: 'casos que piden repuestos', label: 'Casos activos', tone: activeCases > 0 ? 'warning' : 'success', value: activeCases },
            { helper: 'zonas asignadas', label: 'Ubicaciones', tone: 'info', value: assignedLocations },
            { helper: 'casos por encargado', label: 'Carga promedio', tone: 'neutral', value: averageLoad },
          ]}
        />
        <div className={styles.managerGrid}>
          {warehouseManagers.map((manager) => (
            <WarehouseManagerCard key={manager.id} manager={manager} />
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
