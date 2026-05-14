import { ROUTES } from './routes'

export interface AppNavigationItem {
  label: string
  path: string
  icon: string
  section?: string
  showInSidebar?: boolean
  children?: AppNavigationItem[]
}

export interface AppNavigationGroup {
  label: string
  items: AppNavigationItem[]
}

const warehouseView = (view: string) => `${ROUTES.warehouse}?view=${view}`

const navigationGroups: AppNavigationGroup[] = [
  {
    label: 'Plataforma',
    items: [
      { label: 'Dashboard operativo', path: ROUTES.dashboard, icon: 'layout-dashboard' },
      {
        label: 'Taller',
        path: ROUTES.cases,
        icon: 'wrench',
        children: [
          { label: 'Casos', path: ROUTES.cases, icon: 'clipboard-list', section: 'Operacion taller' },
          { label: 'Nuevo caso', path: ROUTES.caseNew, icon: 'circle-plus', section: 'Operacion taller', showInSidebar: false },
          { label: 'Agenda taller', path: ROUTES.schedule, icon: 'calendar-days', section: 'Planificacion' },
          { label: 'Mecanicos', path: ROUTES.mechanics, icon: 'users', section: 'Equipo taller' },
          { label: 'Estaciones taller', path: ROUTES.bays, icon: 'panel-top', section: 'Planificacion' },
          { label: 'Reportes', path: ROUTES.reports, icon: 'bar-chart-3', section: 'Analisis' },
        ],
      },
      {
        label: 'Flota',
        path: ROUTES.fleet,
        icon: 'truck',
        children: [
          { label: 'Centro de flota', path: ROUTES.fleet, icon: 'layout-dashboard', section: 'Control flota' },
          { label: 'Disponibilidad', path: ROUTES.fleetAvailability, icon: 'kanban-square', section: 'Control flota' },
          { label: 'Health Score', path: ROUTES.fleetHealthScore, icon: 'activity', section: 'Control flota' },
          { label: 'Ficha camiones', path: ROUTES.fleetTrucks, icon: 'truck', section: 'Activos' },
          { label: 'Camiones taller', path: ROUTES.trucks, icon: 'wrench', section: 'Activos', showInSidebar: false },
          { label: 'Nuevo camion', path: ROUTES.truckNew, icon: 'circle-plus', section: 'Activos', showInSidebar: false },
          { label: 'Documentos', path: ROUTES.truckDocuments, icon: 'files', section: 'Activos' },
          { label: 'Choferes', path: ROUTES.drivers, icon: 'users', section: 'Equipo ruta' },
          { label: 'Nuevo chofer', path: ROUTES.driverNew, icon: 'circle-plus', section: 'Equipo ruta', showInSidebar: false },
          { label: 'Mantenimiento preventivo', path: ROUTES.preventiveMaintenance, icon: 'calendar-clock', section: 'Preventivo' },
          { label: 'Nuevo plan preventivo', path: ROUTES.preventiveMaintenanceNew, icon: 'circle-plus', section: 'Preventivo', showInSidebar: false },
          { label: 'Rendimiento neumaticos', path: ROUTES.tirePerformance, icon: 'gauge', section: 'Neumaticos' },
          { label: 'Ingreso neumaticos', path: ROUTES.tirePerformanceIntake, icon: 'package-plus', section: 'Neumaticos', showInSidebar: false },
          { label: 'Instalacion neumaticos', path: ROUTES.tirePerformanceInstall, icon: 'wrench', section: 'Neumaticos', showInSidebar: false },
          { label: 'Retiro neumaticos', path: ROUTES.tirePerformanceRemove, icon: 'repeat-2', section: 'Neumaticos', showInSidebar: false },
          { label: 'Comparacion neumaticos', path: ROUTES.tirePerformanceComparison, icon: 'bar-chart-3', section: 'Neumaticos', showInSidebar: false },
          { label: 'Checklists viaje', path: ROUTES.tripChecklists, icon: 'list-checks', section: 'Viajes' },
          { label: 'Checklist salida', path: ROUTES.tripChecklistDeparture, icon: 'send', section: 'Viajes', showInSidebar: false },
          { label: 'Checklist llegada', path: ROUTES.tripChecklistArrival, icon: 'flag', section: 'Viajes', showInSidebar: false },
          { label: 'Telemetria / GPS', path: ROUTES.telematics, icon: 'satellite', section: 'Viajes' },
        ],
      },
      {
        label: 'Compras y abastecimiento',
        path: ROUTES.warehouse,
        icon: 'shopping-cart',
        children: [
          { label: 'Panel de control', path: ROUTES.warehouse, icon: 'warehouse', section: 'Decision' },
          { label: 'Reposicion sugerida', path: warehouseView('suggestions'), icon: 'package-search', section: 'Decision' },
          { label: 'Solicitudes de compra', path: warehouseView('requests'), icon: 'clipboard-list', section: 'Decision' },
          { label: 'Ordenes de compra', path: ROUTES.purchaseOrders, icon: 'shopping-cart', section: 'Ejecucion' },
          { label: 'Recepcion', path: warehouseView('receipts'), icon: 'package-plus', section: 'Ejecucion' },
          { label: 'Control documentos', path: warehouseView('documents'), icon: 'receipt-text', section: 'Ejecucion' },
          { label: 'Repuestos / SKUs', path: ROUTES.parts, icon: 'package-search', section: 'Catalogo y stock' },
          { label: 'Stock fisico', path: ROUTES.warehouseStock, icon: 'package-search', section: 'Catalogo y stock' },
          { label: 'Ubicaciones', path: ROUTES.warehouseLocations, icon: 'warehouse', section: 'Catalogo y stock' },
          { label: 'Compradores / responsables', path: ROUTES.warehouseManagers, icon: 'users', section: 'Responsables' },
          { label: 'Nueva OC', path: ROUTES.purchaseOrderNew, icon: 'circle-plus', section: 'Compras', showInSidebar: false },
          { label: 'Proveedores', path: ROUTES.suppliers, icon: 'building-2', section: 'Proveedores' },
          { label: 'Nuevo proveedor', path: ROUTES.supplierNew, icon: 'circle-plus', section: 'Proveedores', showInSidebar: false },
          { label: 'Auditoria de compras', path: warehouseView('audit'), icon: 'shield-check', section: 'Auditoria' },
          { label: 'Calendario abastecimiento', path: warehouseView('calendar'), icon: 'calendar-days', section: 'Auditoria' },
          { label: 'Reportes abastecimiento', path: ROUTES.inventoryReport, icon: 'bar-chart-3', section: 'Auditoria' },
        ],
      },
      {
        label: 'Logistica',
        path: ROUTES.freightRequests,
        icon: 'route',
        children: [
          { label: 'Clientes', path: ROUTES.customers, icon: 'building-2', section: 'Clientes' },
          { label: 'Solicitudes', path: ROUTES.freightRequests, icon: 'clipboard-list', section: 'Solicitudes' },
          { label: 'Nueva solicitud', path: ROUTES.freightRequestNew, icon: 'circle-plus', section: 'Solicitudes', showInSidebar: false },
          { label: 'Portal cliente', path: ROUTES.freightClientPortal, icon: 'send', section: 'Solicitudes' },
          { label: 'Cotizaciones flete', path: ROUTES.freightQuotes, icon: 'file-text', section: 'Cotizacion' },
          { label: 'Asignacion flete', path: ROUTES.freightAssignments, icon: 'calendar-check', section: 'Ejecucion' },
          { label: 'Planillas choferes', path: ROUTES.driverTripSheets, icon: 'receipt-text', section: 'Viajes' },
          { label: 'Rentabilidad fletes', path: ROUTES.freightProfitability, icon: 'trending-up', section: 'Analisis' },
        ],
      },
      {
        label: 'Finanzas',
        path: ROUTES.truckCosts,
        icon: 'circle-dollar-sign',
        children: [
          { label: 'Costos por camion', path: ROUTES.truckCosts, icon: 'circle-dollar-sign', section: 'Control financiero' },
          { label: 'Combustible', path: ROUTES.fuel, icon: 'fuel', section: 'Combustible' },
          { label: 'Nuevo combustible', path: ROUTES.fuelNew, icon: 'circle-plus', section: 'Combustible', showInSidebar: false },
          { label: 'Reporte combustible', path: ROUTES.fuelReport, icon: 'bar-chart-3', section: 'Reportes', showInSidebar: false },
          { label: 'Reporte inventario', path: ROUTES.inventoryReport, icon: 'bar-chart-3', section: 'Reportes', showInSidebar: false },
          { label: 'Reportes operativos', path: ROUTES.reports, icon: 'bar-chart-3', section: 'Reportes' },
          { label: 'Rendimiento choferes', path: ROUTES.driverPerformanceReport, icon: 'gauge', section: 'Reportes' },
        ],
      },
      {
        label: 'Configuracion',
        path: ROUTES.permissions,
        icon: 'shield-check',
        children: [
          { label: 'Permisos', path: ROUTES.permissions, icon: 'shield-check', section: 'Seguridad' },
          { label: 'Atajos y teclado', path: ROUTES.shortcutSettings, icon: 'keyboard', section: 'Preferencias' },
          { label: 'Comunicaciones', path: ROUTES.communications, icon: 'message-circle', section: 'Mensajeria' },
          { label: 'Notificaciones', path: ROUTES.notifications, icon: 'bell', section: 'Mensajeria' },
          { label: 'Incidentes', path: ROUTES.incidents, icon: 'triangle-alert', section: 'Control operacional' },
          { label: 'Nuevo incidente', path: ROUTES.incidentsNew, icon: 'circle-plus', section: 'Control operacional', showInSidebar: false },
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
