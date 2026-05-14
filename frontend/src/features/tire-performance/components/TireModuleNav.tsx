import { BarChart3, Gauge } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'

const items = [
  { icon: Gauge, label: 'Flujo / reporte', path: ROUTES.tirePerformance },
  { icon: BarChart3, label: 'Comparar compras', path: ROUTES.tirePerformanceComparison },
]

export function TireModuleNav() {
  return (
    <nav aria-label="Rendimiento de neumaticos" className="module-tabs">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <NavLink
            className={({ isActive }) => ['module-tab', isActive ? 'module-tab-active' : ''].filter(Boolean).join(' ')}
            end={item.path === ROUTES.tirePerformance}
            key={item.path}
            to={item.path}
          >
            <Icon aria-hidden size={16} />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
