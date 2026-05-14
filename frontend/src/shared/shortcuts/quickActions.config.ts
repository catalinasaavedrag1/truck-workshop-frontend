import { ROUTES } from '../../config/routes'

export interface OperationalQuickAction {
  id: string
  icon: string
  label: string
  path: string
}

export const operationalQuickActions: OperationalQuickAction[] = [
  {
    id: 'new-workshop-case',
    icon: 'clipboard-plus',
    label: 'Nuevo caso',
    path: ROUTES.caseNew,
  },
  {
    id: 'workshop-schedule',
    icon: 'calendar-days',
    label: 'Agenda taller',
    path: ROUTES.schedule,
  },
  {
    id: 'new-freight-request',
    icon: 'route',
    label: 'Nuevo flete',
    path: ROUTES.freightRequestNew,
  },
  {
    id: 'new-purchase-order',
    icon: 'file-plus-2',
    label: 'Nueva orden de compra',
    path: ROUTES.purchaseOrderNew,
  },
  {
    id: 'parts',
    icon: 'package-plus',
    label: 'Crear SKU',
    path: ROUTES.parts,
  },
  {
    id: 'new-fuel-record',
    icon: 'fuel',
    label: 'Registrar combustible',
    path: ROUTES.fuelNew,
  },
  {
    id: 'reports',
    icon: 'bar-chart-3',
    label: 'Reportes',
    path: ROUTES.reports,
  },
  {
    id: 'customers',
    icon: 'building-2',
    label: 'Clientes',
    path: ROUTES.customers,
  },
]
