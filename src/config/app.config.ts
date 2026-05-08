import { ROUTES } from './routes'

export interface AppNavigationItem {
  label: string
  path: string
  icon: string
  children?: AppNavigationItem[]
}

export interface AppNavigationGroup {
  label: string
  items: AppNavigationItem[]
}

const navigationGroups: AppNavigationGroup[] = [
  {
    label: 'Inicio',
    items: [
      { label: 'Dashboard operativo', path: ROUTES.dashboard, icon: 'layout-dashboard' },
      { label: 'Agenda taller', path: ROUTES.schedule, icon: 'calendar-days' },
      {
        label: 'Casos taller',
        path: ROUTES.cases,
        icon: 'clipboard-list',
        children: [
          { label: 'Listado', path: ROUTES.cases, icon: 'clipboard-list' },
          { label: 'Nuevo caso', path: ROUTES.caseNew, icon: 'circle-plus' },
        ],
      },
      {
        label: 'Fletes',
        path: ROUTES.freightRequests,
        icon: 'route',
        children: [
          { label: 'Clientes', path: ROUTES.customers, icon: 'building-2' },
          { label: 'Solicitudes', path: ROUTES.freightRequests, icon: 'clipboard-list' },
          { label: 'Nueva solicitud', path: ROUTES.freightRequestNew, icon: 'circle-plus' },
          { label: 'Cotizaciones', path: ROUTES.freightQuotes, icon: 'file-text' },
          { label: 'Asignacion', path: ROUTES.freightAssignments, icon: 'calendar-check' },
          { label: 'Planillas choferes', path: ROUTES.driverTripSheets, icon: 'receipt-text' },
          { label: 'Rendimiento choferes', path: ROUTES.driverPerformanceReport, icon: 'gauge' },
        ],
      },
    ],
  },
  {
    label: 'Flota',
    items: [
      {
        label: 'Camiones y choferes',
        path: ROUTES.fleet,
        icon: 'truck',
        children: [
          { label: 'Centro de flota', path: ROUTES.fleet, icon: 'layout-dashboard' },
          { label: 'Disponibilidad', path: ROUTES.fleetAvailability, icon: 'kanban-square' },
          { label: 'Ficha camiones', path: ROUTES.fleetTrucks, icon: 'truck' },
          { label: 'Taller camiones', path: ROUTES.trucks, icon: 'wrench' },
          { label: 'Choferes', path: ROUTES.drivers, icon: 'users' },
          { label: 'Nuevo camion', path: ROUTES.truckNew, icon: 'circle-plus' },
          { label: 'Nuevo chofer', path: ROUTES.driverNew, icon: 'circle-plus' },
          { label: 'Documentos', path: ROUTES.truckDocuments, icon: 'files' },
          { label: 'Health Score', path: ROUTES.fleetHealthScore, icon: 'activity' },
        ],
      },
      { label: 'Estaciones taller', path: ROUTES.bays, icon: 'panel-top' },
    ],
  },
  {
    label: 'Operacion diaria',
    items: [
      {
        label: 'Checklists viaje',
        path: ROUTES.tripChecklists,
        icon: 'list-checks',
        children: [
          { label: 'Resumen', path: ROUTES.tripChecklists, icon: 'list-checks' },
          { label: 'Salida', path: ROUTES.tripChecklistDeparture, icon: 'send' },
          { label: 'Llegada', path: ROUTES.tripChecklistArrival, icon: 'flag' },
      ],
    },
      {
        label: 'Incidentes',
        path: ROUTES.incidents,
        icon: 'triangle-alert',
        children: [
          { label: 'Listado', path: ROUTES.incidents, icon: 'triangle-alert' },
          { label: 'Nuevo incidente', path: ROUTES.incidentsNew, icon: 'circle-plus' },
        ],
      },
      { label: 'Telemetria / GPS', path: ROUTES.telematics, icon: 'satellite' },
      { label: 'Comunicaciones', path: ROUTES.communications, icon: 'message-circle' },
      { label: 'Notificaciones', path: ROUTES.notifications, icon: 'bell' },
    ],
  },
  {
    label: 'Taller e inventario',
    items: [
      { label: 'Diagnostico', path: ROUTES.diagnosticsRoot, icon: 'clipboard-check' },
      { label: 'Asignaciones', path: ROUTES.assignments, icon: 'kanban-square' },
      {
        label: 'Mecanicos',
        path: ROUTES.mechanics,
        icon: 'wrench',
        children: [
          { label: 'Equipo taller', path: ROUTES.mechanics, icon: 'wrench' },
          { label: 'Especialidades', path: ROUTES.mechanicSpecialties, icon: 'tags' },
        ],
      },
      {
        label: 'Mantenimiento preventivo',
        path: ROUTES.preventiveMaintenance,
        icon: 'calendar-clock',
        children: [
          { label: 'Planes', path: ROUTES.preventiveMaintenance, icon: 'calendar-clock' },
          { label: 'Nuevo plan', path: ROUTES.preventiveMaintenanceNew, icon: 'circle-plus' },
        ],
      },
      {
        label: 'Rend. neumaticos',
        path: ROUTES.tirePerformance,
        icon: 'gauge',
        children: [
          { label: 'Reporte', path: ROUTES.tirePerformance, icon: 'gauge' },
          { label: 'Ingreso stock', path: ROUTES.tirePerformanceIntake, icon: 'package-plus' },
          { label: 'Instalacion', path: ROUTES.tirePerformanceInstall, icon: 'wrench' },
          { label: 'Retiro', path: ROUTES.tirePerformanceRemove, icon: 'repeat-2' },
          { label: 'Comparacion', path: ROUTES.tirePerformanceComparison, icon: 'bar-chart-3' },
        ],
      },
      { label: 'Checklists diagnostico', path: ROUTES.checklists, icon: 'list-checks' },
      {
        label: 'Gestion inventario',
        path: ROUTES.warehouse,
        icon: 'warehouse',
        children: [
          { label: 'Centro inventario', path: ROUTES.warehouse, icon: 'warehouse' },
          { label: 'Repuestos / SKUs', path: ROUTES.parts, icon: 'package-search' },
          { label: 'Stock fisico', path: ROUTES.warehouseStock, icon: 'package-search' },
          { label: 'Ubicaciones', path: ROUTES.warehouseLocations, icon: 'warehouse' },
          { label: 'Encargados', path: ROUTES.warehouseManagers, icon: 'users' },
          { label: 'Ordenes de compra', path: ROUTES.purchaseOrders, icon: 'shopping-cart' },
          { label: 'Nueva OC', path: ROUTES.purchaseOrderNew, icon: 'circle-plus' },
          { label: 'Proveedores', path: ROUTES.suppliers, icon: 'building-2' },
          { label: 'Nuevo proveedor', path: ROUTES.supplierNew, icon: 'circle-plus' },
          { label: 'Reporte inventario', path: ROUTES.inventoryReport, icon: 'bar-chart-3' },
        ],
      },
    ],
  },
  {
    label: 'Compras y costos',
    items: [
      { label: 'Cotizaciones taller', path: ROUTES.quotes, icon: 'file-text' },
      { label: 'Aprobaciones', path: ROUTES.approvals, icon: 'badge-check' },
      { label: 'Costos por camion', path: ROUTES.truckCosts, icon: 'circle-dollar-sign' },
      {
        label: 'Combustible',
        path: ROUTES.fuel,
        icon: 'fuel',
        children: [
          { label: 'Registros', path: ROUTES.fuel, icon: 'fuel' },
          { label: 'Nuevo registro', path: ROUTES.fuelNew, icon: 'circle-plus' },
          { label: 'Reporte', path: ROUTES.fuelReport, icon: 'bar-chart-3' },
        ],
      },
      { label: 'Mano de obra', path: ROUTES.labor, icon: 'clock-3' },
      { label: 'Rentabilidad fletes', path: ROUTES.freightProfitability, icon: 'trending-up' },
    ],
  },
  {
    label: 'Administracion',
    items: [
      { label: 'Permisos', path: ROUTES.permissions, icon: 'shield-check' },
      { label: 'Atajos y teclado', path: ROUTES.shortcutSettings, icon: 'keyboard' },
      { label: 'Reportes', path: ROUTES.reports, icon: 'bar-chart-3' },
      { label: 'Rend. choferes', path: ROUTES.driverPerformanceReport, icon: 'gauge' },
    ],
  },
]

export const appConfig = {
  name: 'Truck Workshop',
  company: 'Operaciones Taller',
  navigationGroups,
  navigation: navigationGroups.flatMap((group) => group.items),
}
