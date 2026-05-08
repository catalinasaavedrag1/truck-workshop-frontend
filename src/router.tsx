import { lazy, Suspense } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { Navigate, createBrowserRouter, createHashRouter } from 'react-router-dom'
import { ROUTES } from './config/routes'
import { LoadingState } from './shared/components/LoadingState/LoadingState'
import { MainLayout } from './shared/layout/MainLayout/MainLayout'

function lazyPage<TModule extends Record<string, unknown>>(loader: () => Promise<TModule>, exportName: keyof TModule) {
  return lazy(async () => {
    const module = await loader()
    return { default: module[exportName] as ComponentType }
  })
}

function routeElement(element: ReactNode) {
  return <Suspense fallback={routeFallback}>{element}</Suspense>
}

const routeFallback = <LoadingState label="Cargando vista" />

const LoginPage = lazyPage(() => import('./features/auth/pages/LoginPage'), 'LoginPage')
const DashboardPage = lazyPage(() => import('./features/dashboard/pages/DashboardPage'), 'DashboardPage')
const ApprovalsPage = lazyPage(() => import('./features/approvals/pages/ApprovalsPage'), 'ApprovalsPage')
const CommunicationsPage = lazyPage(() => import('./features/communications/pages/CommunicationsPage'), 'CommunicationsPage')
const CustomerDetailPage = lazyPage(() => import('./features/customers/pages/CustomerDetailPage'), 'CustomerDetailPage')
const CustomersPage = lazyPage(() => import('./features/customers/pages/CustomersPage'), 'CustomersPage')
const CreateDriverPage = lazyPage(() => import('./features/drivers/pages/CreateDriverPage'), 'CreateDriverPage')
const DriverDetailPage = lazyPage(() => import('./features/drivers/pages/DriverDetailPage'), 'DriverDetailPage')
const DriversPage = lazyPage(() => import('./features/drivers/pages/DriversPage'), 'DriversPage')
const DriverTripSheetsPage = lazyPage(
  () => import('./features/driver-trip-sheets/pages/DriverTripSheetsPage'),
  'DriverTripSheetsPage',
)
const AssignmentsPage = lazyPage(() => import('./features/assignments/pages/AssignmentsPage'), 'AssignmentsPage')
const DiagnosticChecklistsPage = lazyPage(
  () => import('./features/diagnostic-checklists/pages/DiagnosticChecklistsPage'),
  'DiagnosticChecklistsPage',
)
const DiagnosticPage = lazyPage(() => import('./features/diagnostics/pages/DiagnosticPage'), 'DiagnosticPage')
const FleetAvailabilityPage = lazyPage(() => import('./features/fleet/pages/FleetAvailabilityPage'), 'FleetAvailabilityPage')
const FleetDashboardPage = lazyPage(() => import('./features/fleet/pages/FleetDashboardPage'), 'FleetDashboardPage')
const FleetTruckDetailPage = lazyPage(() => import('./features/fleet/pages/TruckDetailPage'), 'TruckDetailPage')
const TruckHealthScorePage = lazyPage(() => import('./features/fleet/pages/TruckHealthScorePage'), 'TruckHealthScorePage')
const TruckMasterPage = lazyPage(() => import('./features/fleet/pages/TruckMasterPage'), 'TruckMasterPage')
const CreateFreightRequestPage = lazyPage(
  () => import('./features/freight/pages/CreateFreightRequestPage'),
  'CreateFreightRequestPage',
)
const FreightAssignmentsPage = lazyPage(
  () => import('./features/freight/pages/FreightAssignmentsPage'),
  'FreightAssignmentsPage',
)
const FreightQuoteDetailPage = lazyPage(
  () => import('./features/freight/pages/FreightQuoteDetailPage'),
  'FreightQuoteDetailPage',
)
const FreightQuotesPage = lazyPage(() => import('./features/freight/pages/FreightQuotesPage'), 'FreightQuotesPage')
const FreightRequestDetailPage = lazyPage(
  () => import('./features/freight/pages/FreightRequestDetailPage'),
  'FreightRequestDetailPage',
)
const FreightRequestsPage = lazyPage(() => import('./features/freight/pages/FreightRequestsPage'), 'FreightRequestsPage')
const FreightProfitabilityPage = lazyPage(
  () => import('./features/freight-profitability/pages/FreightProfitabilityPage'),
  'FreightProfitabilityPage',
)
const CreateFuelRecordPage = lazyPage(() => import('./features/fuel/pages/CreateFuelRecordPage'), 'CreateFuelRecordPage')
const FuelPage = lazyPage(() => import('./features/fuel/pages/FuelPage'), 'FuelPage')
const FuelReportPage = lazyPage(() => import('./features/fuel/pages/FuelReportPage'), 'FuelReportPage')
const CreateIncidentPage = lazyPage(() => import('./features/incidents/pages/CreateIncidentPage'), 'CreateIncidentPage')
const IncidentDetailPage = lazyPage(() => import('./features/incidents/pages/IncidentDetailPage'), 'IncidentDetailPage')
const IncidentsPage = lazyPage(() => import('./features/incidents/pages/IncidentsPage'), 'IncidentsPage')
const LaborPage = lazyPage(() => import('./features/labor/pages/LaborPage'), 'LaborPage')
const MechanicsPage = lazyPage(() => import('./features/mechanics/pages/MechanicsPage'), 'MechanicsPage')
const MechanicSpecialtiesPage = lazyPage(
  () => import('./features/mechanics/pages/MechanicSpecialtiesPage'),
  'MechanicSpecialtiesPage',
)
const MechanicDetailPage = lazyPage(() => import('./features/mechanics/pages/MechanicDetailPage'), 'MechanicDetailPage')
const NotificationsPage = lazyPage(() => import('./features/notifications/pages/NotificationsPage'), 'NotificationsPage')
const PermissionsPage = lazyPage(() => import('./features/permissions/pages/PermissionsPage'), 'PermissionsPage')
const ShortcutSettingsPage = lazyPage(() => import('./features/settings/pages/ShortcutSettingsPage'), 'ShortcutSettingsPage')
const PartsPage = lazyPage(() => import('./features/parts/pages/PartsPage'), 'PartsPage')
const PartDetailPage = lazyPage(() => import('./features/parts/pages/PartDetailPage'), 'PartDetailPage')
const CreateMaintenancePlanPage = lazyPage(
  () => import('./features/preventive-maintenance/pages/CreateMaintenancePlanPage'),
  'CreateMaintenancePlanPage',
)
const MaintenancePlanDetailPage = lazyPage(
  () => import('./features/preventive-maintenance/pages/MaintenancePlanDetailPage'),
  'MaintenancePlanDetailPage',
)
const PreventiveMaintenancePage = lazyPage(
  () => import('./features/preventive-maintenance/pages/PreventiveMaintenancePage'),
  'PreventiveMaintenancePage',
)
const CreatePurchaseOrderPage = lazyPage(
  () => import('./features/purchase-orders/pages/CreatePurchaseOrderPage'),
  'CreatePurchaseOrderPage',
)
const PurchaseOrderDetailPage = lazyPage(
  () => import('./features/purchase-orders/pages/PurchaseOrderDetailPage'),
  'PurchaseOrderDetailPage',
)
const PurchaseOrdersPage = lazyPage(
  () => import('./features/purchase-orders/pages/PurchaseOrdersPage'),
  'PurchaseOrdersPage',
)
const QuoteDetailPage = lazyPage(() => import('./features/quotes/pages/QuoteDetailPage'), 'QuoteDetailPage')
const QuotesPage = lazyPage(() => import('./features/quotes/pages/QuotesPage'), 'QuotesPage')
const RepairSolutionPage = lazyPage(
  () => import('./features/repair-solutions/pages/RepairSolutionPage'),
  'RepairSolutionPage',
)
const ReportsPage = lazyPage(() => import('./features/reports/pages/ReportsPage'), 'ReportsPage')
const DriverPerformanceReportPage = lazyPage(
  () => import('./features/reports/pages/DriverPerformanceReportPage'),
  'DriverPerformanceReportPage',
)
const SchedulePage = lazyPage(() => import('./features/schedule/pages/SchedulePage'), 'SchedulePage')
const CreateSupplierPage = lazyPage(() => import('./features/suppliers/pages/CreateSupplierPage'), 'CreateSupplierPage')
const SupplierDetailPage = lazyPage(() => import('./features/suppliers/pages/SupplierDetailPage'), 'SupplierDetailPage')
const SuppliersPage = lazyPage(() => import('./features/suppliers/pages/SuppliersPage'), 'SuppliersPage')
const TireComparisonPage = lazyPage(
  () => import('./features/tire-performance/pages/TireComparisonPage'),
  'TireComparisonPage',
)
const TireStockIntakePage = lazyPage(
  () => import('./features/tire-performance/pages/TireStockIntakePage'),
  'TireStockIntakePage',
)
const TireInstallationPage = lazyPage(
  () => import('./features/tire-performance/pages/TireInstallationPage'),
  'TireInstallationPage',
)
const TirePerformanceReportPage = lazyPage(
  () => import('./features/tire-performance/pages/TirePerformanceReportPage'),
  'TirePerformanceReportPage',
)
const TireRemovalPage = lazyPage(() => import('./features/tire-performance/pages/TireRemovalPage'), 'TireRemovalPage')
const ArrivalChecklistPage = lazyPage(
  () => import('./features/trip-checklists/pages/ArrivalChecklistPage'),
  'ArrivalChecklistPage',
)
const DepartureChecklistPage = lazyPage(
  () => import('./features/trip-checklists/pages/DepartureChecklistPage'),
  'DepartureChecklistPage',
)
const TripChecklistsPage = lazyPage(
  () => import('./features/trip-checklists/pages/TripChecklistsPage'),
  'TripChecklistsPage',
)
const TruckCostDetailPage = lazyPage(() => import('./features/truck-costs/pages/TruckCostDetailPage'), 'TruckCostDetailPage')
const TruckCostsPage = lazyPage(() => import('./features/truck-costs/pages/TruckCostsPage'), 'TruckCostsPage')
const TruckDocumentDetailPage = lazyPage(
  () => import('./features/truck-documents/pages/TruckDocumentDetailPage'),
  'TruckDocumentDetailPage',
)
const TruckDocumentsPage = lazyPage(
  () => import('./features/truck-documents/pages/TruckDocumentsPage'),
  'TruckDocumentsPage',
)
const CreateTruckPage = lazyPage(() => import('./features/trucks/pages/CreateTruckPage'), 'CreateTruckPage')
const TruckDetailPage = lazyPage(() => import('./features/trucks/pages/TruckDetailPage'), 'TruckDetailPage')
const TrucksPage = lazyPage(() => import('./features/trucks/pages/TrucksPage'), 'TrucksPage')
const TelematicsPage = lazyPage(() => import('./features/telematics/pages/TelematicsPage'), 'TelematicsPage')
const WarehouseDashboardPage = lazyPage(
  () => import('./features/warehouse/pages/WarehouseDashboardPage'),
  'WarehouseDashboardPage',
)
const InventoryReportPage = lazyPage(
  () => import('./features/warehouse/pages/InventoryReportPage'),
  'InventoryReportPage',
)
const WarehouseLocationsPage = lazyPage(
  () => import('./features/warehouse/pages/WarehouseLocationsPage'),
  'WarehouseLocationsPage',
)
const WarehouseManagersPage = lazyPage(
  () => import('./features/warehouse/pages/WarehouseManagersPage'),
  'WarehouseManagersPage',
)
const WarehouseStockPage = lazyPage(() => import('./features/warehouse/pages/WarehouseStockPage'), 'WarehouseStockPage')
const BaysPage = lazyPage(() => import('./features/workshop-bays/pages/BaysPage'), 'BaysPage')
const CreateWorkshopCasePage = lazyPage(
  () => import('./features/workshop-cases/pages/CreateWorkshopCasePage'),
  'CreateWorkshopCasePage',
)
const WorkshopCaseDetailPage = lazyPage(
  () => import('./features/workshop-cases/pages/WorkshopCaseDetailPage'),
  'WorkshopCaseDetailPage',
)
const WorkshopCasesPage = lazyPage(() => import('./features/workshop-cases/pages/WorkshopCasesPage'), 'WorkshopCasesPage')

const routes = [
  {
    element: routeElement(<LoginPage />),
    path: ROUTES.login,
  },
  {
    children: [
      { element: <Navigate replace to={ROUTES.dashboard} />, index: true },
      { element: routeElement(<DashboardPage />), path: ROUTES.dashboard },
      { element: routeElement(<WorkshopCasesPage />), path: ROUTES.cases },
      { element: routeElement(<CreateWorkshopCasePage />), path: ROUTES.caseNew },
      { element: routeElement(<WorkshopCaseDetailPage />), path: ROUTES.caseAssign() },
      { element: routeElement(<WorkshopCaseDetailPage />), path: ROUTES.caseEscalate() },
      { element: routeElement(<WorkshopCaseDetailPage />), path: ROUTES.caseClose() },
      { element: routeElement(<WorkshopCaseDetailPage />), path: ROUTES.caseDetail() },
      { element: routeElement(<SchedulePage />), path: ROUTES.schedule },
      { element: routeElement(<BaysPage />), path: ROUTES.bays },
      { element: routeElement(<TrucksPage />), path: ROUTES.trucks },
      { element: routeElement(<CreateTruckPage />), path: ROUTES.truckNew },
      { element: routeElement(<TruckDetailPage />), path: ROUTES.truckDetail() },
      { element: routeElement(<DriversPage />), path: ROUTES.drivers },
      { element: routeElement(<CreateDriverPage />), path: ROUTES.driverNew },
      { element: routeElement(<DriverDetailPage />), path: ROUTES.driverDetail() },
      { element: routeElement(<DiagnosticPage />), path: ROUTES.diagnosticsRoot },
      { element: routeElement(<DiagnosticPage />), path: ROUTES.diagnostics() },
      { element: routeElement(<RepairSolutionPage />), path: ROUTES.repairSolutions() },
      { element: routeElement(<AssignmentsPage />), path: ROUTES.assignments },
      { element: routeElement(<MechanicsPage />), path: ROUTES.mechanics },
      { element: routeElement(<MechanicSpecialtiesPage />), path: ROUTES.mechanicSpecialties },
      { element: routeElement(<MechanicDetailPage />), path: ROUTES.mechanicDetail() },
      { element: routeElement(<WarehouseDashboardPage />), path: ROUTES.warehouse },
      { element: routeElement(<InventoryReportPage />), path: ROUTES.inventoryReport },
      { element: routeElement(<WarehouseLocationsPage />), path: ROUTES.warehouseLocations },
      { element: routeElement(<WarehouseManagersPage />), path: ROUTES.warehouseManagers },
      { element: routeElement(<WarehouseStockPage />), path: ROUTES.warehouseStock },
      { element: routeElement(<PurchaseOrdersPage />), path: ROUTES.purchaseOrders },
      { element: routeElement(<CreatePurchaseOrderPage />), path: ROUTES.purchaseOrderNew },
      { element: routeElement(<PurchaseOrderDetailPage />), path: ROUTES.purchaseOrderDetail() },
      { element: routeElement(<SuppliersPage />), path: ROUTES.suppliers },
      { element: routeElement(<CreateSupplierPage />), path: ROUTES.supplierNew },
      { element: routeElement(<SupplierDetailPage />), path: ROUTES.supplierDetail() },
      { element: routeElement(<QuotesPage />), path: ROUTES.quotes },
      { element: routeElement(<QuoteDetailPage />), path: ROUTES.quoteDetail() },
      { element: routeElement(<LaborPage />), path: ROUTES.labor },
      { element: routeElement(<ApprovalsPage />), path: ROUTES.approvals },
      { element: routeElement(<DiagnosticChecklistsPage />), path: ROUTES.checklists },
      { element: routeElement(<CommunicationsPage />), path: ROUTES.communications },
      { element: routeElement(<NotificationsPage />), path: ROUTES.notifications },
      { element: routeElement(<CustomersPage />), path: ROUTES.customers },
      { element: routeElement(<CustomerDetailPage />), path: ROUTES.customerDetail() },
      { element: routeElement(<FreightRequestsPage />), path: ROUTES.freightRequests },
      { element: routeElement(<CreateFreightRequestPage />), path: ROUTES.freightRequestNew },
      { element: routeElement(<FreightRequestDetailPage />), path: ROUTES.freightRequestDetail() },
      { element: routeElement(<FreightQuotesPage />), path: ROUTES.freightQuotes },
      { element: routeElement(<FreightQuoteDetailPage />), path: ROUTES.freightQuoteDetail() },
      { element: routeElement(<FreightAssignmentsPage />), path: ROUTES.freightAssignments },
      { element: routeElement(<DriverTripSheetsPage />), path: ROUTES.driverTripSheets },
      { element: routeElement(<TirePerformanceReportPage />), path: ROUTES.tirePerformance },
      { element: routeElement(<TireStockIntakePage />), path: ROUTES.tirePerformanceIntake },
      { element: routeElement(<TireInstallationPage />), path: ROUTES.tirePerformanceInstall },
      { element: routeElement(<TireRemovalPage />), path: ROUTES.tirePerformanceRemove },
      { element: routeElement(<TireComparisonPage />), path: ROUTES.tirePerformanceComparison },
      { element: routeElement(<FleetDashboardPage />), path: ROUTES.fleet },
      { element: routeElement(<TruckMasterPage />), path: ROUTES.fleetTrucks },
      { element: routeElement(<FleetTruckDetailPage />), path: ROUTES.fleetTruckDetail() },
      { element: routeElement(<FleetAvailabilityPage />), path: ROUTES.fleetAvailability },
      { element: routeElement(<TruckHealthScorePage />), path: ROUTES.fleetHealthScore },
      { element: routeElement(<PreventiveMaintenancePage />), path: ROUTES.preventiveMaintenance },
      { element: routeElement(<CreateMaintenancePlanPage />), path: ROUTES.preventiveMaintenanceNew },
      { element: routeElement(<MaintenancePlanDetailPage />), path: ROUTES.preventiveMaintenanceDetail() },
      { element: routeElement(<TruckCostsPage />), path: ROUTES.truckCosts },
      { element: routeElement(<TruckCostDetailPage />), path: ROUTES.truckCostDetail() },
      { element: routeElement(<FuelPage />), path: ROUTES.fuel },
      { element: routeElement(<CreateFuelRecordPage />), path: ROUTES.fuelNew },
      { element: routeElement(<FuelReportPage />), path: ROUTES.fuelReport },
      { element: routeElement(<TruckDocumentsPage />), path: ROUTES.truckDocuments },
      { element: routeElement(<TruckDocumentDetailPage />), path: ROUTES.truckDocumentDetail() },
      { element: routeElement(<TripChecklistsPage />), path: ROUTES.tripChecklists },
      { element: routeElement(<DepartureChecklistPage />), path: ROUTES.tripChecklistDeparture },
      { element: routeElement(<ArrivalChecklistPage />), path: ROUTES.tripChecklistArrival },
      { element: routeElement(<FreightProfitabilityPage />), path: ROUTES.freightProfitability },
      { element: routeElement(<IncidentsPage />), path: ROUTES.incidents },
      { element: routeElement(<CreateIncidentPage />), path: ROUTES.incidentsNew },
      { element: routeElement(<IncidentDetailPage />), path: ROUTES.incidentDetail() },
      { element: routeElement(<TelematicsPage />), path: ROUTES.telematics },
      { element: routeElement(<PermissionsPage />), path: ROUTES.permissions },
      { element: routeElement(<ShortcutSettingsPage />), path: ROUTES.shortcutSettings },
      { element: routeElement(<PartsPage />), path: ROUTES.parts },
      { element: routeElement(<PartDetailPage />), path: ROUTES.partDetail() },
      { element: routeElement(<ReportsPage />), path: ROUTES.reports },
      { element: routeElement(<DriverPerformanceReportPage />), path: ROUTES.driverPerformanceReport },
    ],
    element: <MainLayout />,
    path: ROUTES.root,
  },
]

const createRouter = window.location.protocol === 'file:' ? createHashRouter : createBrowserRouter

export const router = createRouter(routes)
