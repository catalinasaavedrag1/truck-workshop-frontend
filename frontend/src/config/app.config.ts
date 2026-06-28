import { ROUTES } from './routes'

export interface AppNavigationItem {
  label: string
  path: string
  icon: string
  section?: string
  showInSidebar?: boolean
  children?: AppNavigationItem[]
  /** Clave de contador dinamico (ver useSidebarBadges), ej 'notifications'. */
  badge?: string
  /** Texto de apoyo opcional para tooltips/documentacion del menu. */
  description?: string
  /** Permiso requerido para ver el item (reservado para control de acceso). */
  permission?: string
}

export interface AppNavigationGroup {
  label: string
  description?: string
  items: AppNavigationItem[]
}

const warehouseView = (view: string) => `${ROUTES.warehouse}?view=${view}`
const customerView = (view: string) => `${ROUTES.customers}?view=${view}`

// Arquitectura de navegacion: cada grupo representa UN dominio operativo y
// contiene un unico item "padre" con hijos agrupados por `section`. El Sidebar
// aplana ese padre (ver SidebarSection) y renderiza una jerarquia simple de
// dos niveles: Dominio -> Seccion -> Enlace. Los items rutinarios de creacion o
// de baja frecuencia se marcan con `showInSidebar: false`: siguen accesibles por
// URL, buscador del menu y paleta de comandos, pero no saturan el menu.
const navigationGroups: AppNavigationGroup[] = [
  {
    label: 'Inicio',
    description: 'Vista ejecutiva y foco operacional global',
    items: [
      { label: 'Dashboard operativo', path: ROUTES.dashboard, icon: 'layout-dashboard' },
    ],
  },
  {
    label: 'Taller',
    description: 'Recepcion, diagnostico, reparacion y cierre de casos',
    items: [
      {
        label: 'Taller',
        path: ROUTES.cases,
        icon: 'wrench',
        children: [
          { label: 'Casos', path: ROUTES.cases, icon: 'clipboard-list', section: 'Operacion', badge: 'criticalCases' },
          { label: 'Diagnostico', path: ROUTES.diagnosticsRoot, icon: 'activity', section: 'Operacion' },
          { label: 'Asignaciones', path: ROUTES.assignments, icon: 'calendar-check', section: 'Operacion' },
          { label: 'Aprobaciones', path: ROUTES.approvals, icon: 'clipboard-check', section: 'Operacion' },
          { label: 'Camiones en taller', path: ROUTES.trucks, icon: 'wrench', section: 'Operacion' },
          { label: 'Nuevo caso', path: ROUTES.caseNew, icon: 'circle-plus', section: 'Operacion', showInSidebar: false },
          { label: 'Cotizaciones', path: ROUTES.quotes, icon: 'file-text', section: 'Cotizacion y costos' },
          { label: 'Mano de obra', path: ROUTES.labor, icon: 'clock-3', section: 'Cotizacion y costos' },
          { label: 'Agenda taller', path: ROUTES.schedule, icon: 'calendar-days', section: 'Planificacion' },
          { label: 'Estaciones', path: ROUTES.bays, icon: 'panel-top', section: 'Planificacion' },
          { label: 'Checklists diagnostico', path: ROUTES.checklists, icon: 'list-checks', section: 'Planificacion' },
          { label: 'Mecanicos', path: ROUTES.mechanics, icon: 'users', section: 'Equipo' },
          { label: 'Especialidades', path: ROUTES.mechanicSpecialties, icon: 'badge-check', section: 'Equipo' },
          { label: 'Reportes taller', path: ROUTES.reports, icon: 'bar-chart-3', section: 'Analisis' },
        ],
      },
    ],
  },
  {
    label: 'Flota',
    description: 'Estado, mantenimiento y documentacion de camiones',
    items: [
      {
        label: 'Flota',
        path: ROUTES.fleet,
        icon: 'truck',
        children: [
          { label: 'Centro de flota', path: ROUTES.fleet, icon: 'layout-dashboard', section: 'Control' },
          { label: 'Disponibilidad', path: ROUTES.fleetAvailability, icon: 'kanban-square', section: 'Control' },
          { label: 'Health Score', path: ROUTES.fleetHealthScore, icon: 'activity', section: 'Control' },
          { label: 'Ficha de flota', path: ROUTES.fleetTrucks, icon: 'truck', section: 'Activos' },
          { label: 'Documentos', path: ROUTES.truckDocuments, icon: 'files', section: 'Activos' },
          { label: 'Nuevo camion', path: ROUTES.truckNew, icon: 'circle-plus', section: 'Activos', showInSidebar: false },
          { label: 'Mantenimiento preventivo', path: ROUTES.preventiveMaintenance, icon: 'calendar-clock', section: 'Mantenimiento' },
          { label: 'Nuevo plan preventivo', path: ROUTES.preventiveMaintenanceNew, icon: 'circle-plus', section: 'Mantenimiento', showInSidebar: false },
          { label: 'Rendimiento neumaticos', path: ROUTES.tirePerformance, icon: 'gauge', section: 'Neumaticos' },
          { label: 'Ingreso neumaticos', path: ROUTES.tirePerformanceIntake, icon: 'package-plus', section: 'Neumaticos', showInSidebar: false },
          { label: 'Instalacion neumaticos', path: ROUTES.tirePerformanceInstall, icon: 'wrench', section: 'Neumaticos', showInSidebar: false },
          { label: 'Retiro neumaticos', path: ROUTES.tirePerformanceRemove, icon: 'repeat-2', section: 'Neumaticos', showInSidebar: false },
          { label: 'Comparacion neumaticos', path: ROUTES.tirePerformanceComparison, icon: 'bar-chart-3', section: 'Neumaticos', showInSidebar: false },
          { label: 'Telemetria / GPS', path: ROUTES.telematics, icon: 'satellite', section: 'Telemetria' },
          { label: 'Choferes', path: ROUTES.drivers, icon: 'users', section: 'Conductores' },
          { label: 'Nuevo chofer', path: ROUTES.driverNew, icon: 'circle-plus', section: 'Conductores', showInSidebar: false },
        ],
      },
    ],
  },
  {
    label: 'Fletes y viajes',
    description: 'Solicitudes, cotizacion, asignacion y rentabilidad de fletes',
    items: [
      {
        label: 'Fletes',
        path: ROUTES.freightRequests,
        icon: 'route',
        children: [
          { label: 'Solicitudes', path: ROUTES.freightRequests, icon: 'clipboard-list', section: 'Solicitudes' },
          { label: 'Nueva solicitud', path: ROUTES.freightRequestNew, icon: 'circle-plus', section: 'Solicitudes', showInSidebar: false },
          { label: 'Portal cliente', path: ROUTES.freightClientPortal, icon: 'send', section: 'Solicitudes' },
          { label: 'Cotizaciones flete', path: ROUTES.freightQuotes, icon: 'file-text', section: 'Cotizacion' },
          { label: 'Asignacion flete', path: ROUTES.freightAssignments, icon: 'calendar-check', section: 'Ejecucion' },
          { label: 'Planillas choferes', path: ROUTES.driverTripSheets, icon: 'receipt-text', section: 'Ejecucion' },
          { label: 'Facturacion de fletes', path: ROUTES.freightInvoices, icon: 'receipt-text', section: 'Facturacion' },
          { label: 'Nueva factura flete', path: ROUTES.freightInvoiceNew, icon: 'circle-plus', section: 'Facturacion', showInSidebar: false },
          { label: 'Checklists viaje', path: ROUTES.tripChecklists, icon: 'list-checks', section: 'Viajes' },
          { label: 'Checklist salida', path: ROUTES.tripChecklistDeparture, icon: 'send', section: 'Viajes', showInSidebar: false },
          { label: 'Checklist llegada', path: ROUTES.tripChecklistArrival, icon: 'flag', section: 'Viajes', showInSidebar: false },
          { label: 'Rentabilidad fletes', path: ROUTES.freightProfitability, icon: 'trending-up', section: 'Analisis' },
        ],
      },
    ],
  },
  {
    label: 'Clientes',
    description: 'Cartera comercial, credito, tarifas y relacion',
    items: [
      {
        label: 'Clientes',
        path: ROUTES.customers,
        icon: 'building-2',
        children: [
          { label: 'Panel clientes', path: ROUTES.customers, icon: 'layout-dashboard', section: 'Gestion' },
          { label: 'Cartera', path: customerView('portfolio'), icon: 'building-2', section: 'Gestion' },
          { label: 'Nuevo cliente', path: customerView('create'), icon: 'circle-plus', section: 'Gestion', showInSidebar: false },
          { label: 'Credito y riesgo', path: customerView('credit'), icon: 'shield-check', section: 'Comercial' },
          { label: 'Tarifas', path: customerView('pricing'), icon: 'tags', section: 'Comercial' },
          { label: 'Operaciones', path: customerView('operations'), icon: 'route', section: 'Operacion' },
          { label: 'Comunicaciones', path: customerView('communications'), icon: 'message-circle', section: 'Relacion' },
          { label: 'Rentabilidad', path: customerView('profitability'), icon: 'trending-up', section: 'Analisis' },
        ],
      },
    ],
  },
  {
    label: 'Abastecimiento',
    description: 'Bodega, compras, inventario y proveedores',
    items: [
      {
        label: 'Abastecimiento',
        path: ROUTES.warehouse,
        icon: 'warehouse',
        children: [
          { label: 'Panel de control', path: ROUTES.warehouse, icon: 'warehouse', section: 'Decision' },
          { label: 'Reposicion sugerida', path: warehouseView('suggestions'), icon: 'package-search', section: 'Decision' },
          { label: 'Solicitudes de compra', path: warehouseView('requests'), icon: 'clipboard-list', section: 'Decision' },
          { label: 'Ordenes de compra', path: ROUTES.purchaseOrders, icon: 'shopping-cart', section: 'Compras' },
          { label: 'Recepcion', path: warehouseView('receipts'), icon: 'package-plus', section: 'Compras' },
          { label: 'Facturas de compra', path: ROUTES.purchaseInvoices, icon: 'receipt-text', section: 'Compras' },
          { label: 'Proveedores', path: ROUTES.suppliers, icon: 'building-2', section: 'Compras' },
          { label: 'Nueva OC', path: ROUTES.purchaseOrderNew, icon: 'circle-plus', section: 'Compras', showInSidebar: false },
          { label: 'Nueva factura compra', path: ROUTES.purchaseInvoiceNew, icon: 'circle-plus', section: 'Compras', showInSidebar: false },
          { label: 'Nuevo proveedor', path: ROUTES.supplierNew, icon: 'circle-plus', section: 'Compras', showInSidebar: false },
          { label: 'Repuestos / SKUs', path: ROUTES.parts, icon: 'package-search', section: 'Inventario' },
          { label: 'Stock fisico', path: ROUTES.warehouseStock, icon: 'package-search', section: 'Inventario' },
          { label: 'Ubicaciones', path: ROUTES.warehouseLocations, icon: 'warehouse', section: 'Inventario' },
          { label: 'Reportes', path: ROUTES.inventoryReport, icon: 'bar-chart-3', section: 'Analisis' },
          { label: 'Control documentos', path: warehouseView('documents'), icon: 'receipt-text', section: 'Analisis', showInSidebar: false },
          { label: 'Compradores / responsables', path: ROUTES.warehouseManagers, icon: 'users', section: 'Analisis', showInSidebar: false },
          { label: 'Auditoria de compras', path: warehouseView('audit'), icon: 'shield-check', section: 'Analisis', showInSidebar: false },
          { label: 'Calendario abastecimiento', path: warehouseView('calendar'), icon: 'calendar-days', section: 'Analisis', showInSidebar: false },
        ],
      },
    ],
  },
  {
    label: 'Finanzas',
    description: 'Costos por camion, combustible y desempeno',
    items: [
      {
        label: 'Finanzas',
        path: ROUTES.truckCosts,
        icon: 'circle-dollar-sign',
        children: [
          { label: 'Costos por camion', path: ROUTES.truckCosts, icon: 'circle-dollar-sign', section: 'Costos' },
          { label: 'Combustible', path: ROUTES.fuel, icon: 'fuel', section: 'Combustible' },
          { label: 'Reporte combustible', path: ROUTES.fuelReport, icon: 'bar-chart-3', section: 'Combustible' },
          { label: 'Nuevo combustible', path: ROUTES.fuelNew, icon: 'circle-plus', section: 'Combustible', showInSidebar: false },
          { label: 'Rendimiento choferes', path: ROUTES.driverPerformanceReport, icon: 'gauge', section: 'Desempeno' },
        ],
      },
    ],
  },
  {
    label: 'Administracion',
    description: 'Incidentes, mensajeria, permisos y preferencias',
    items: [
      {
        label: 'Administracion',
        path: ROUTES.incidents,
        icon: 'shield-check',
        children: [
          { label: 'Incidentes', path: ROUTES.incidents, icon: 'triangle-alert', section: 'Operacion', badge: 'incidents' },
          { label: 'Nuevo incidente', path: ROUTES.incidentsNew, icon: 'circle-plus', section: 'Operacion', showInSidebar: false },
          { label: 'Notificaciones', path: ROUTES.notifications, icon: 'bell', section: 'Mensajeria', badge: 'notifications' },
          { label: 'Comunicaciones', path: ROUTES.communications, icon: 'message-circle', section: 'Mensajeria' },
          { label: 'Permisos', path: ROUTES.permissions, icon: 'shield-check', section: 'Configuracion' },
          { label: 'Atajos y teclado', path: ROUTES.shortcutSettings, icon: 'keyboard', section: 'Configuracion' },
        ],
      },
    ],
  },
]

export const appConfig = {
  name: 'Truck Workshop',
  company: 'Operaciones Taller',
  navigationGroups,
  navigation: navigationGroups.flatMap((group) => group.items),
}
