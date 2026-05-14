# Frontend - inventario de features

Actualizado: 2026-05-14

Los modulos viven en `frontend/src/features`. Cada feature concentra paginas, componentes, servicios, tipos, mocks, constantes y utilidades del dominio. Para una lectura funcional por rutas y APIs, ver [mapa de modulos](modules.md).

## Mapa funcional

| Area | Features principales | Objetivo |
|---|---|---|
| Inicio | `dashboard` | KPIs y accesos operacionales. |
| Taller | `workshop-cases`, `diagnostics`, `diagnostic-checklists`, `repair-solutions`, `assignments`, `schedule`, `workshop-bays`, `mechanics`, `quotes`, `approvals`, `labor`, `sla` | Ciclo completo de caso: recepcion, diagnostico, cotizacion, aprobacion, reparacion y cierre. |
| Fletes y clientes | `freight`, `freight-profitability`, `driver-trip-sheets`, `customers`, `maps` | Cliente 360, torre de control logistica, solicitud, cotizacion, ruta, asignacion, ejecucion y rentabilidad. |
| Flota | `fleet`, `trucks`, `drivers`, `truck-documents`, `truck-costs`, `fuel`, `tire-performance`, `trip-checklists`, `telematics`, `preventive-maintenance` | Disponibilidad, documentos, costos, mantenimiento, combustible, neumaticos y viajes. |
| Abastecimiento | `warehouse`, `parts`, `purchase-orders`, `suppliers` | Decision de compra, stock, ubicaciones, SKUs, solicitudes, OC, recepcion, proveedores, auditoria, calendario y reportes. |
| Control | `incidents`, `communications`, `notifications`, `reports`, `permissions`, `settings` | Torre de control, comunicacion, alertas, reporteria, permisos y atajos. |
| Auth | `auth` | Login de desarrollo y sesion. |

## Inventario tecnico

| Feature | Pages | Components | Services | Hooks | Types | Mocks | Constants | Utils |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| approvals | 1 | 4 | 1 | 0 | 1 | 1 | 0 | 1 |
| assignments | 1 | 4 | 1 | 0 | 1 | 0 | 0 | 0 |
| auth | 1 | 2 | 1 | 1 | 1 | 0 | 0 | 0 |
| communications | 1 | 1 | 1 | 0 | 1 | 1 | 0 | 2 |
| customers | 2 | 13 | 1 | 0 | 1 | 1 | 1 | 3 |
| dashboard | 1 | 5 | 1 | 0 | 1 | 0 | 0 | 0 |
| diagnostic-checklists | 1 | 2 | 0 | 0 | 1 | 1 | 0 | 0 |
| diagnostics | 1 | 4 | 1 | 1 | 1 | 0 | 0 | 0 |
| driver-trip-sheets | 1 | 4 | 1 | 0 | 1 | 1 | 1 | 0 |
| drivers | 3 | 5 | 1 | 0 | 1 | 2 | 1 | 1 |
| escalation | 0 | 4 | 0 | 0 | 1 | 1 | 1 | 0 |
| fleet | 5 | 8 | 1 | 0 | 1 | 1 | 1 | 0 |
| freight | 7 | 25 | 2 | 0 | 1 | 1 | 3 | 1 |
| freight-profitability | 1 | 5 | 0 | 0 | 1 | 1 | 1 | 0 |
| fuel | 3 | 7 | 1 | 1 | 1 | 1 | 1 | 1 |
| incidents | 3 | 6 | 0 | 0 | 1 | 1 | 1 | 0 |
| labor | 1 | 3 | 0 | 0 | 1 | 1 | 0 | 0 |
| maps | 0 | 2 | 1 | 0 | 1 | 0 | 0 | 0 |
| mechanics | 3 | 9 | 1 | 0 | 1 | 1 | 0 | 1 |
| notifications | 1 | 1 | 1 | 0 | 1 | 1 | 0 | 1 |
| parts | 2 | 5 | 1 | 0 | 1 | 0 | 0 | 0 |
| permissions | 1 | 5 | 1 | 0 | 1 | 1 | 0 | 0 |
| preventive-maintenance | 3 | 7 | 0 | 0 | 1 | 1 | 1 | 1 |
| purchase-orders | 3 | 6 | 1 | 0 | 1 | 1 | 0 | 0 |
| quotes | 2 | 5 | 1 | 0 | 1 | 1 | 0 | 0 |
| repair-solutions | 1 | 4 | 1 | 0 | 1 | 0 | 0 | 0 |
| reports | 2 | 6 | 2 | 0 | 1 | 0 | 0 | 0 |
| schedule | 1 | 12 | 1 | 0 | 1 | 1 | 0 | 1 |
| settings | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| sla | 0 | 4 | 0 | 0 | 1 | 1 | 0 | 0 |
| suppliers | 3 | 3 | 1 | 0 | 1 | 1 | 0 | 0 |
| telematics | 1 | 5 | 0 | 0 | 1 | 1 | 1 | 1 |
| tire-performance | 5 | 15 | 1 | 0 | 1 | 1 | 1 | 1 |
| trip-checklists | 3 | 5 | 0 | 0 | 1 | 1 | 1 | 0 |
| truck-costs | 2 | 9 | 1 | 0 | 1 | 1 | 1 | 0 |
| truck-documents | 2 | 5 | 1 | 0 | 1 | 1 | 1 | 0 |
| trucks | 3 | 4 | 1 | 0 | 1 | 0 | 1 | 1 |
| warehouse | 5 | 26 | 4 | 0 | 2 | 2 | 0 | 0 |
| workshop-bays | 1 | 3 | 0 | 0 | 1 | 1 | 0 | 0 |
| workshop-cases | 3 | 23 | 1 | 2 | 1 | 0 | 2 | 1 |

## Pages por feature

| Feature | Pages |
|---|---|
| approvals | `ApprovalsPage` |
| assignments | `AssignmentsPage` |
| auth | `LoginPage` |
| communications | `CommunicationsPage` |
| customers | `CustomersPage`, `CustomerDetailPage` |
| dashboard | `DashboardPage` |
| diagnostic-checklists | `DiagnosticChecklistsPage` |
| diagnostics | `DiagnosticPage` |
| driver-trip-sheets | `DriverTripSheetsPage` |
| drivers | `DriversPage`, `CreateDriverPage`, `DriverDetailPage` |
| fleet | `FleetDashboardPage`, `TruckMasterPage`, `TruckDetailPage`, `FleetAvailabilityPage`, `TruckHealthScorePage` |
| freight | `FreightRequestsPage`, `CreateFreightRequestPage`, `FreightRequestDetailPage`, `FreightQuotesPage`, `FreightQuoteDetailPage`, `FreightAssignmentsPage`, `ClientFreightPortalPages` |
| freight-profitability | `FreightProfitabilityPage` |
| fuel | `FuelPage`, `CreateFuelRecordPage`, `FuelReportPage` |
| incidents | `IncidentsPage`, `CreateIncidentPage`, `IncidentDetailPage` |
| labor | `LaborPage` |
| mechanics | `MechanicsPage`, `MechanicSpecialtiesPage`, `MechanicDetailPage` |
| notifications | `NotificationsPage` |
| parts | `PartsPage`, `PartDetailPage` |
| permissions | `PermissionsPage` |
| preventive-maintenance | `PreventiveMaintenancePage`, `CreateMaintenancePlanPage`, `MaintenancePlanDetailPage` |
| purchase-orders | `PurchaseOrdersPage`, `CreatePurchaseOrderPage`, `PurchaseOrderDetailPage` |
| quotes | `QuotesPage`, `QuoteDetailPage` |
| repair-solutions | `RepairSolutionPage` |
| reports | `ReportsPage`, `DriverPerformanceReportPage` |
| schedule | `SchedulePage` |
| settings | `ShortcutSettingsPage` |
| suppliers | `SuppliersPage`, `CreateSupplierPage`, `SupplierDetailPage` |
| telematics | `TelematicsPage` |
| tire-performance | `TirePerformanceReportPage`, `TireStockIntakePage`, `TireInstallationPage`, `TireRemovalPage`, `TireComparisonPage` |
| trip-checklists | `TripChecklistsPage`, `DepartureChecklistPage`, `ArrivalChecklistPage` |
| truck-costs | `TruckCostsPage`, `TruckCostDetailPage` |
| truck-documents | `TruckDocumentsPage`, `TruckDocumentDetailPage` |
| trucks | `TrucksPage`, `CreateTruckPage`, `TruckDetailPage` |
| warehouse | `WarehouseDashboardPage`, `InventoryReportPage`, `WarehouseLocationsPage`, `WarehouseManagersPage`, `WarehouseStockPage` |
| workshop-bays | `BaysPage` |
| workshop-cases | `WorkshopCasesPage`, `CreateWorkshopCasePage`, `WorkshopCaseDetailPage` |

## Relacion frontend-backend

| Frontend | API principal |
|---|---|
| `auth` | `/auth/login` |
| `dashboard` | `/dashboard/summary` |
| `workshop-cases` | `/cases`, `/workshop-cases`, `/escalations` |
| `diagnostics` | `/diagnostics` |
| `diagnostic-checklists` | `/diagnostic-checklists`, alias `/checklists` |
| `repair-solutions` | `/repair-solutions` |
| `assignments` | `/assignments`, `/cases/:id/assignments` |
| `schedule` | `/schedule/events`, `/schedule/waiting-queue` |
| `workshop-bays` | `/bays` |
| `mechanics` | `/mechanics`, `/mechanic-specialties` |
| `quotes` | `/quotes` |
| `approvals` | `/approvals` |
| `labor` | `/labor/tasks`, alias `/labor` |
| `fleet` | `/fleet/trucks`, `/fleet/availability`, `/fleet/health-scores`, `/fleet/timeline-events` |
| `trucks` | `/trucks` |
| `drivers` | `/drivers`, `/driver-documents`, `/driver-fines` |
| `truck-documents` | `/truck-documents` |
| `truck-costs` | `/truck-costs`, `/truck-costs/summaries`, `/truck-costs/analytics` |
| `fuel` | `/fuel/records`, alias `/fuel`, `/fuel/prices/*` |
| `tire-performance` | `/tire-performance/tires` |
| `trip-checklists` | `/trip-checklists/departures`, `/trip-checklists/arrivals` |
| `telematics` | `/telematics` |
| `preventive-maintenance` | `/preventive-maintenance/plans`, alias `/preventive-maintenance` |
| `freight` | `/freight/requests`, `/freight/quotes`, `/freight/assignments`, `/freight/pricing/*`, `/maps/*` |
| `driver-trip-sheets` | `/driver-trip-sheets` |
| `freight-profitability` | `/freight-profitability` |
| `customers` | `/customers` |
| `warehouse` | `/warehouse/locations`, `/warehouse/stock`, `/warehouse/managers`, `/warehouse/movements` |
| `parts` | `/parts` |
| `purchase-orders` | `/purchase-orders`, `/purchase-requests` |
| `suppliers` | `/suppliers` |
| `incidents` | `/incidents` |
| `communications` | `/communications/*` |
| `notifications` | `/notifications`, `/notifications/subscriptions` |
| `reports` | `/reports/*` |
| `permissions` | `/permissions/roles`, `/permissions/user-roles`, alias `/permissions` |
| `settings` | `/settings/shortcuts` |

## UX operacional documentada

- `diagnostics`: estacion de trabajo tecnica con contexto de caso, stepper, formulario compacto, checklist y acciones persistentes.
- `incidents`: creacion de incidencia como centro operacional con tipo dominante, severidad visual, contexto detectado, impacto y sticky footer.
- `customers`: detalle de cliente como torre de control logistica/comercial con KPIs, fletes activos, rentabilidad, documentos y actividad.
- `warehouse`: modulo de compras y abastecimiento con decision de compra, reposicion sugerida, solicitudes, OC, recepcion, auditoria, documentos, calendario y reportes.
- `freight-profitability`: lectura de margen, costo/km, revenue/km y decision operacional.
- `Sidebar`: barra compacta, submenus expandibles, busqueda plana y usuario fijo.
- `Headers`: `PageHeader` y `ContextBar` derivan breadcrumbs/contexto desde la navegacion global.

## Reglas para nuevas features

1. Crear tipos en `features/<modulo>/types`.
2. Crear servicio si existe escritura o flujo especializado.
3. Usar hooks compartidos para lectura CRUD simple.
4. Usar mocks solo como fallback local.
5. Crear componentes locales para UI de negocio.
6. Agregar page en `pages`.
7. Registrar ruta en `routes.ts` y `router.tsx`.
8. Registrar acceso en `app.config.ts` si corresponde.
9. Mantener acciones primarias visibles y filtros compactos.
10. Validar con `npm run check` y `npm run build`.
