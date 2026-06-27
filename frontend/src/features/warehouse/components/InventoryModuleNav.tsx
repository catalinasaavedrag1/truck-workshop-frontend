import { BarChart3, Building2, MapPinned, PackageSearch, ReceiptText, ShoppingCart, Users, Warehouse } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import styles from './InventoryModule.module.css'

const navItems = [
  { icon: <Warehouse aria-hidden size={15} />, label: 'Panel control', path: ROUTES.warehouse },
  { icon: <PackageSearch aria-hidden size={15} />, label: 'SKUs / Catalogo', path: ROUTES.parts },
  { icon: <PackageSearch aria-hidden size={15} />, label: 'Stock fisico', path: ROUTES.warehouseStock },
  { icon: <MapPinned aria-hidden size={15} />, label: 'Ubicaciones', path: ROUTES.warehouseLocations },
  { icon: <Users aria-hidden size={15} />, label: 'Compradores', path: ROUTES.warehouseManagers },
  { icon: <ShoppingCart aria-hidden size={15} />, label: 'Ordenes de compra', path: ROUTES.purchaseOrders },
  { icon: <ReceiptText aria-hidden size={15} />, label: 'Facturas de compra', path: ROUTES.purchaseInvoices },
  { icon: <Building2 aria-hidden size={15} />, label: 'Proveedores', path: ROUTES.suppliers },
  { icon: <BarChart3 aria-hidden size={15} />, label: 'Reportes', path: ROUTES.inventoryReport },
]

export function InventoryModuleNav() {
  return (
    <nav aria-label="Compras y abastecimiento" className={styles.moduleNav}>
      {navItems.map((item) => (
        <NavLink className={({ isActive }) => (isActive ? styles.active : undefined)} key={item.path} to={item.path}>
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
