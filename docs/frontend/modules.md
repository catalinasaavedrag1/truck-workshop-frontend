# Frontend - mapa de modulos

Actualizado: 2026-05-14

Este documento describe la aplicacion React por modulos funcionales. Complementa [rutas](routes.md), [datos/layout](data-layout.md) e [inventario de features](features.md).

## Shell, rutas y navegacion

| Pieza | Archivo | Responsabilidad |
|---|---|---|
| Montaje React | `frontend/src/main.tsx` | Renderiza `App` y estilos globales. |
| Router provider | `frontend/src/App.tsx` | Entrega `router` a React Router. |
| Lazy routing | `frontend/src/router.tsx` | Declara paginas lazy, rutas publicas, rutas privadas y fallback de carga. |
| Paths | `frontend/src/config/routes.ts` | Fuente unica de paths y helpers con parametros. |
| Navegacion | `frontend/src/config/app.config.ts` | Grupos padre, children, iconos, secciones y visibilidad en sidebar. |
| Contexto de navegacion | `frontend/src/shared/navigation/navigationContext.ts` | Match de ruta activa, breadcrumbs automaticos y accesos relacionados. |
| Layout | `frontend/src/shared/layout/MainLayout` | Sidebar, topbar, context bar, contenido y ayuda de atajos. |

Rutas publicas:

| Ruta | Pagina | Uso |
|---|---|---|
| `/login` | `LoginPage` | Login de desarrollo/JWT. |
| `/portal/freight/request` | `ClientFreightRequestPage` | Portal publico para solicitud de flete. |
| `/portal/freight/requests` | `ClientFreightRequestsPage` | Consulta publica de solicitudes. |
| `/portal/freight/history` | `ClientFreightHistoryPage` | Historial publico de fletes. |
| `/portal/freight/tracking/:trackingNumber` | `ClientFreightTrackingPage` | Tracking publico. |

Rutas privadas:

- Estan bajo `RequireAuth` y `MainLayout`.
- Usan `createBrowserRouter` en web.
- Usan `createHashRouter` cuando se ejecuta desde `file:` para Electron.
- La ruta raiz redirige a `/dashboard`.

## Sidebar actual

El sidebar no es una lista plana simple. La navegacion se declara como arbol en `app.config.ts` y se comporta asi:

| Estado | Comportamiento |
|---|---|
| Desktop colapsado/fijo | Muestra una barra de iconos con los padres: Dashboard, Taller, Flota, Compras, Logistica, Finanzas y Configuracion. |
| Panel abierto | Muestra grupos y submenus expandibles por item padre. |
| Busqueda activa | Aplana los hijos visibles y permite buscar por etiqueta, padre o seccion. |
| Ruta activa | Expande automaticamente el padre activo y marca el hijo mas especifico. |
| `showInSidebar=false` | Oculta flujos secundarios como formularios de creacion, pero las rutas siguen existiendo. |

Grupos y submenus visibles principales:

| Grupo | Padre | Hijos visibles |
|---|---|---|
| Inicio | Dashboard operativo | Dashboard operativo. |
| Operacion taller | Taller | Casos, Agenda taller, Mecanicos, Estaciones taller, Reportes. |
| Flota y logistica | Flota | Centro de flota, Disponibilidad, Health Score, Ficha camiones, Documentos, Choferes, Mantenimiento preventivo, Rendimiento neumaticos, Checklists viaje, Telemetria/GPS. |
| Flota y logistica | Logistica | Solicitudes, Portal cliente, Cotizaciones flete, Asignacion flete, Planillas choferes, Rentabilidad fletes. |
| Clientes y comercial | Clientes | Panel clientes, Cartera, Credito y riesgo, Tarifas, Operaciones, Comunicaciones, Rentabilidad. |
| Abastecimiento | Compras y abastecimiento | Panel de control, Reposicion sugerida, Solicitudes de compra, Ordenes de compra, Recepcion, Control documentos, Repuestos/SKUs, Stock fisico, Ubicaciones, Compradores/responsables, Proveedores, Auditoria, Calendario y Reportes. |
| Finanzas y control | Finanzas | Costos por camion, Combustible, Reportes operativos, Rendimiento choferes. |
| Administracion | Configuracion | Permisos, Atajos y teclado, Comunicaciones, Notificaciones, Incidentes. |

## Capa compartida de datos

| Archivo | Uso |
|---|---|
| `shared/services/httpClient.ts` | Axios con `VITE_API_BASE_URL`, JWT, `X-Request-Id`, actor y manejo de 401. |
| `shared/services/resourceApi.ts` | CRUD generico tipado para recursos simples. |
| `shared/hooks/useResourceList.ts` | Listado con fallback mock opcional. |
| `shared/hooks/useResourceItem.ts` | Detalle con fallback mock opcional. |
| `shared/services/apiErrorHandler.ts` | Normalizacion de errores Axios/JS. |
| `shared/services/sessionUser.ts` | Usuario actual para UI y auditoria. |

Regla practica:

- Usar `useResourceList` y `useResourceItem` para lectura CRUD.
- Usar `features/<modulo>/services` cuando hay escritura, endpoint especializado o transformacion de payload.
- Mantener mocks como respaldo demo y no como fuente canonica.

## Modulos de taller

| Feature | Rutas | API principal | Que contiene |
|---|---|---|---|
| `workshop-cases` | `/cases`, `/cases/new`, `/cases/:caseId`, `/cases/:caseId/assign`, `/cases/:caseId/escalate`, `/cases/:caseId/close` | `/cases`, `/workshop-cases`, `/escalations` | Listado, creacion, detalle, SLA, asignacion, escalamiento, cierre, repuestos y contexto de caso. |
| `diagnostics` | `/diagnostics`, `/diagnostics/:caseId` | `/diagnostics` | Diagnostico tecnico por caso, sintomas, causa raiz, severidad y avance de flujo. |
| `diagnostic-checklists` | `/checklists` | `/diagnostic-checklists`, `/checklists` | Checklists tecnicos reutilizables. |
| `repair-solutions` | `/repair-solutions/:caseId` | `/repair-solutions` | Solucion propuesta, partes requeridas, horas, costo y aprobacion requerida. |
| `assignments` | `/assignments` | `/assignments`, `/cases/:id/assignments` | Asignacion de mecanicos a casos y estado de trabajo. |
| `schedule` | `/schedule` | `/schedule/events`, `/schedule/waiting-queue` | Agenda por fecha, bahia, mecanico, cola y conflictos. |
| `workshop-bays` | `/bays` | `/bays` | Estado de estaciones de taller. |
| `mechanics` | `/mechanics`, `/mechanics/specialties`, `/mechanics/:mechanicId` | `/mechanics`, `/mechanic-specialties` | Equipo, disponibilidad, especialidades y detalle operacional. |
| `quotes` | `/quotes`, `/quotes/:quoteId` | `/quotes` | Cotizaciones de taller, items, aprobacion y estado. |
| `approvals` | `/approvals` | `/approvals` | Bandeja de aprobaciones y acciones aprobar/rechazar. |
| `labor` | `/labor` | `/labor/tasks`, `/labor` | Mano de obra estimada/real por caso. |
| `sla` | Sin ruta directa | `/sla/configs`, `/sla` | Componentes y datos para SLAs de caso. |
| `escalation` | Se usa dentro de casos | `/escalations` | Componentes de historial y razones de escalamiento. |

## Clientes, logistica y fletes

| Feature | Rutas | API principal | Que contiene |
|---|---|---|---|
| `customers` | `/customers`, `/customers/:customerId` | `/customers`, `/customers/:id/credit` | Modulo de clientes y vista 360 logistica/comercial: cartera, credito, riesgo, actividad, fletes, casos, cotizaciones, operaciones, tarifas y rentabilidad. |
| `freight` | `/freight/requests`, `/freight/requests/new`, `/freight/requests/:requestId`, `/freight/quotes`, `/freight/quotes/:quoteId`, `/freight/assignments`, `/freight/client-portal/*` | `/freight/requests`, `/freight/quotes`, `/freight/assignments`, `/freight/pricing`, `/maps` | Solicitudes, portal cliente, cotizacion, pricing, ruta, tracking y asignacion. |
| `driver-trip-sheets` | `/freight/driver-trip-sheets` | `/driver-trip-sheets` | Planillas de chofer, gastos, margen y performance. |
| `freight-profitability` | `/freight-profitability` | `/freight-profitability` | Lectura de rentabilidad por flete, chofer y camion. |
| `maps` | Componentes embebidos | `/maps/places`, `/maps/route`, `/maps/static-route` | Busqueda de direcciones, rutas y mapa estatico. |

Notas del modulo clientes:

- `CustomersPage` concentra alta/edicion/listado y resumen.
- `CustomerDetailPage` centraliza informacion dispersa en otros modulos.
- `Customer360Overview`, `CustomerOperationalPanels`, `CustomerActivityTimeline` y `CustomerPortfolioSignals` cruzan datos de casos, fletes, cotizaciones, comunicaciones y credito.
- `CustomerSelect` se reutiliza en flujos que necesitan asociar cliente.

## Flota, choferes y viajes

| Feature | Rutas | API principal | Que contiene |
|---|---|---|---|
| `fleet` | `/fleet`, `/fleet/trucks`, `/fleet/trucks/:truckId`, `/fleet/availability`, `/fleet/health-score` | `/fleet/trucks`, `/fleet/availability`, `/fleet/health-scores`, `/fleet/timeline-events` | Centro de flota, maestro de camiones, disponibilidad, detalle y health score. |
| `trucks` | `/trucks`, `/trucks/new`, `/trucks/:truckId` | `/trucks` | Camiones del taller historico/simple. |
| `drivers` | `/drivers`, `/drivers/new`, `/drivers/:driverId` | `/drivers`, `/driver-documents`, `/driver-fines` | Choferes, documentos, multas y detalle. |
| `truck-documents` | `/truck-documents`, `/truck-documents/:documentId` | `/truck-documents` | Documentacion de camiones y vencimientos. |
| `preventive-maintenance` | `/preventive-maintenance`, `/preventive-maintenance/new`, `/preventive-maintenance/:planId` | `/preventive-maintenance/plans`, `/preventive-maintenance` | Planes preventivos por km/dias y riesgo. |
| `tire-performance` | `/tire-performance`, `/tire-performance/intake`, `/tire-performance/install`, `/tire-performance/remove`, `/tire-performance/comparison` | `/tire-performance/tires` | Ciclo de vida de neumaticos, ingreso, instalacion, retiro, costo/km y comparacion. |
| `trip-checklists` | `/trip-checklists`, `/trip-checklists/departure`, `/trip-checklists/arrival` | `/trip-checklists/departures`, `/trip-checklists/arrivals` | Checklist de salida/llegada para viajes. |
| `telematics` | `/telematics` | `/telematics` | Ultima senal, velocidad, combustible, motor, alertas y ubicacion. |

## Compras, inventario y proveedores

| Feature | Rutas | API principal | Que contiene |
|---|---|---|---|
| `warehouse` | `/warehouse`, `/warehouse?view=suggestions`, `/warehouse?view=requests`, `/warehouse?view=receipts`, `/warehouse?view=documents`, `/warehouse?view=audit`, `/warehouse?view=calendar`, `/warehouse/report`, `/warehouse/locations`, `/warehouse/managers`, `/warehouse/stock` | `/warehouse/locations`, `/warehouse/stock`, `/warehouse/managers`, `/warehouse/movements` | Centro de compras y abastecimiento: decision de compra, solicitudes, recepcion, documentos, auditoria, calendario, reporte, ubicaciones, stock fisico y responsables. |
| `parts` | `/parts`, `/parts/:partId` | `/parts` | Catalogo de repuestos/SKUs, stock, costo y detalle. |
| `purchase-orders` | `/purchase-orders`, `/purchase-orders/new`, `/purchase-orders/:purchaseOrderId` | `/purchase-orders`, `/purchase-requests` | Ordenes de compra, items, proveedor, estado y entrega esperada. |
| `suppliers` | `/suppliers`, `/suppliers/new`, `/suppliers/:supplierId` | `/suppliers` | Proveedores, RUT, categorias, rating, OC activas y detalle. |

El submenu `Compras y abastecimiento` debe mostrar el flujo operativo completo: decision, solicitudes, OC, recepcion, documentos, catalogo/stock, responsables, proveedores, auditoria, calendario y reportes. Las rutas de creacion `Nueva OC` y `Nuevo proveedor` quedan ocultas en sidebar por `showInSidebar=false`.

## Finanzas y reporteria

| Feature | Rutas | API principal | Que contiene |
|---|---|---|---|
| `truck-costs` | `/truck-costs`, `/truck-costs/:truckId` | `/truck-costs`, `/truck-costs/summaries`, `/truck-costs/analytics` | Costos por camion, resumen, analitica y detalle. |
| `fuel` | `/fuel`, `/fuel/new`, `/fuel/report` | `/fuel/records`, `/fuel`, `/fuel/prices/current`, `/fuel/prices/history` | Cargas de combustible, precios diesel, desviaciones y reporte. |
| `reports` | `/reports`, `/reports/driver-performance` | `/reports/*` | Reportes de taller, flota, finanzas, choferes, documentos, inventario y neumaticos. |

## Control, comunicaciones y administracion

| Feature | Rutas | API principal | Que contiene |
|---|---|---|---|
| `dashboard` | `/dashboard` | `/dashboard/summary` | KPIs y accesos operacionales. |
| `communications` | `/communications` | `/communications/profiles`, `/communications/provider-configs`, `/communications/conversations`, `/communications/messages`, `/communications/send` | Perfiles, proveedores, conversaciones, envio WhatsApp/Outlook y enlaces de cotizacion. |
| `notifications` | `/notifications` | `/notifications`, `/notifications/subscriptions` | Centro de notificaciones y preferencias de alerta. |
| `incidents` | `/incidents`, `/incidents/new`, `/incidents/:incidentId` | `/incidents` | Incidencias con severidad, evidencia, costo y relacion a flota/taller/flete. |
| `permissions` | `/permissions` | `/permissions/roles`, `/permissions/user-roles`, `/permissions` | Roles, permisos y usuarios operativos. |
| `settings` | `/settings/shortcuts` | `/settings/shortcuts` | Preferencias de atajos de teclado. |
| `auth` | `/login` | `/auth/login` | Login, almacenamiento de sesion y proteccion de rutas. |

## Componentes compartidos clave

| Carpeta/archivo | Uso |
|---|---|
| `shared/components/Table` | Tablas con loading, error, paginacion, ordenamiento y filas navegables. |
| `shared/components/FilterBar` | Filtros compactos con busqueda, selects y limpieza. |
| `shared/components/PageHeader` | Titulo, descripcion y acciones de pagina. |
| `shared/navigation/navigationContext.ts` | Breadcrumbs y contexto operacional derivados desde `app.config.ts`. |
| `shared/components/Modal` | Dialogos base. |
| `shared/components/RutInput` | Campo RUT con formato `20.007.759-8`. |
| `shared/layout/Topbar` | Busqueda global, atajos, notificaciones y ayuda de teclado. |
| `shared/layout/ContextBar` | Contexto del modulo actual y accesos relacionados. |
| `shared/shortcuts` | Configuracion, listener global y preferencias de atajos. |
| `shared/utils/rut.ts` | Formato y texto de busqueda para RUT. |

## Checklist para crear o mover un modulo frontend

1. Crear `features/<modulo>/types` con contratos TypeScript.
2. Crear `services` si hay escritura o endpoints especializados.
3. Crear `mocks` si el modulo debe funcionar en demo/fallback.
4. Crear `utils` solo para calculos o normalizaciones del dominio.
5. Crear `components` locales para UI del modulo.
6. Crear `pages` enrutables.
7. Registrar path en `config/routes.ts`.
8. Registrar lazy import y ruta en `router.tsx`.
9. Registrar acceso visible u oculto en `app.config.ts`.
10. Actualizar docs, ejecutar `npm run check` y `npm run build`.
