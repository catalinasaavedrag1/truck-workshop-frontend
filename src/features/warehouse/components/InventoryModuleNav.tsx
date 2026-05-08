import { BarChart3, Building2, MapPinned, PackageSearch, ShoppingCart, Users, Warehouse } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import styles from './InventoryModule.module.css'

const navItems = [
  { icon: <Warehouse aria-hidden size={15} />, label: 'Centro inventario', path: ROUTES.warehouse },
  { icon: <PackageSearch aria-hidden size={15} />, label: 'SKUs', path: ROUTES.parts },
  { icon: <PackageSearch aria-hidden size={15} />, label: 'Stock fisico', path: ROUTES.warehouseStock },
  { icon: <MapPinned aria-hidden size={15} />, label: 'Ubicaciones', path: ROUTES.warehouseLocations },
  { icon: <Users aria-hidden size={15} />, label: 'Encargados', path: ROUTES.warehouseManagers },
  { icon: <ShoppingCart aria-hidden size={15} />, label: 'Compras', path: ROUTES.purchaseOrders },
  { icon: <Building2 aria-hidden size={15} />, label: 'Proveedores', path: ROUTES.suppliers },
  { icon: <BarChart3 aria-hidden size={15} />, label: 'Reporte', path: ROUTES.inventoryReport },
]

export function InventoryModuleNav() {
  return (
    <nav aria-label="Gestion de inventario" className={styles.moduleNav}>
      {navItems.map((item) => (
        <NavLink className={({ isActive }) => (isActive ? styles.active : undefined)} key={item.path} to={item.path}>
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
