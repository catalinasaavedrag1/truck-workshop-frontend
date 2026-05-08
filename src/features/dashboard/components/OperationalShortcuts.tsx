import { CalendarDays, ClipboardPlus, PackageSearch, Route, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Card } from '../../../shared/components/Card/Card'

const shortcuts = [
  {
    description: 'Registrar llegada y activar SLA',
    icon: ClipboardPlus,
    label: 'Nuevo caso',
    path: ROUTES.caseNew,
  },
  {
    description: 'Ver trabajos por estacion y mecanico',
    icon: CalendarDays,
    label: 'Agenda taller',
    path: ROUTES.schedule,
  },
  {
    description: 'Stock y casos bloqueados',
    icon: PackageSearch,
    label: 'Bodega',
    path: ROUTES.warehouse,
  },
  {
    description: 'Crear solicitud comercial',
    icon: Route,
    label: 'Nuevo flete',
    path: ROUTES.freightRequestNew,
  },
  {
    description: 'Compras, cotizaciones y reparaciones',
    icon: ShieldCheck,
    label: 'Aprobaciones',
    path: ROUTES.approvals,
  },
]

export function OperationalShortcuts() {
  return (
    <Card>
      <div className="stack">
        <div className="section-heading-row">
          <h2 className="section-title">Accesos operativos</h2>
          <span className="muted-text">acciones frecuentes</span>
        </div>
        <div className="shortcut-grid">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon

            return (
              <Link className="shortcut-link" key={shortcut.path} to={shortcut.path}>
                <Icon aria-hidden size={18} />
                <span>
                  <strong>{shortcut.label}</strong>
                  <small>{shortcut.description}</small>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
