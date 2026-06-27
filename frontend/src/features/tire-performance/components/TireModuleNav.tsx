import { BarChart3, Gauge } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Tabs } from '../../../shared/components/Tabs/Tabs'

const items = [
  { icon: <Gauge aria-hidden size={16} />, id: ROUTES.tirePerformance, label: 'Flujo / reporte', to: ROUTES.tirePerformance },
  {
    icon: <BarChart3 aria-hidden size={16} />,
    id: ROUTES.tirePerformanceComparison,
    label: 'Comparar compras',
    to: ROUTES.tirePerformanceComparison,
  },
]

export function TireModuleNav() {
  const { pathname } = useLocation()
  const activeId = pathname.startsWith(ROUTES.tirePerformanceComparison)
    ? ROUTES.tirePerformanceComparison
    : ROUTES.tirePerformance

  return <Tabs activeId={activeId} ariaLabel="Rendimiento de neumaticos" items={items} />
}
