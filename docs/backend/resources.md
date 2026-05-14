# Backend - catalogo de recursos y modulos

Actualizado: 2026-05-13

Este documento complementa [API y recursos](api.md). Aca se explica el catalogo por dominio: que entidad representa cada recurso, que ruta expone, que tabla usa y cuando existe logica especializada por encima del CRUD generico.

## Como se define un recurso

La fuente canonica es `backend/src/config/resources.js`.

| Propiedad | Significado |
|---|---|
| `name` | Nombre logico usado por scripts, repositorios y logs. |
| `route` | Ruta relativa montada bajo `/api`. |
| `table` | Tabla SQL Server esperada. |
| `fields` | Campos publicos camelCase aceptados por API. |
| `jsonFields` | Campos serializados/deserializados como JSON. |
| `searchableFields` | Campos usados por `search` o `query`. |
| `filterFields` | Campos que aceptan filtros directos por query string. |
| `sortFields` | Campos recomendados para ordenar listados. |

El CRUD generico acepta:

```text
GET    /api/<ruta>?page=1&limit=25&search=&sort=createdAt&order=desc
GET    /api/<ruta>/:id
POST   /api/<ruta>
PATCH  /api/<ruta>/:id
DELETE /api/<ruta>/:id
```

## Taller

| Recurso | Ruta | Tabla | JSON | Uso |
|---|---|---|---|---|
| `workshop-cases` | `/workshop-cases` | `workshop_cases` | `requiredParts`, `purchaseRequestIds`, `symptoms` | Caso principal de taller: ingreso, diagnostico, asignacion, escalamiento, repuestos, SLA y cierre. |
| `assignments` | `/assignments` | `assignments` | - | Relacion caso-mecanico y estado de asignacion. |
| `escalation-events` | `/escalations` | `escalation_events` | - | Historial de escalamiento por caso. |
| `approvals` | `/approvals` | `approvals` | - | Aprobaciones transversales para cotizaciones, repuestos u otros flujos. |
| `diagnostic-checklists` | `/diagnostic-checklists` | `diagnostic_checklists` | `items` | Plantillas de checklist tecnico. |
| `diagnostics` | `/diagnostics` | `diagnostics` | `symptoms` | Diagnosticos asociados a caso y causa raiz. |
| `sla-configs` | `/sla/configs` | `sla_configs` | - | Reglas de SLA por prioridad/escalamiento. |
| `labor-tasks` | `/labor/tasks` | `labor_tasks` | - | Mano de obra estimada/real por caso y mecanico. |
| `repair-solutions` | `/repair-solutions` | `repair_solutions` | `requiredParts` | Solucion tecnica, horas, costo y aprobacion requerida. |
| `schedule-events` | `/schedule/events` | `schedule_events` | - | Agenda de caso en bahia/mecanico. |
| `waiting-queue` | `/schedule/waiting-queue` | `waiting_queue` | - | Cola de espera operacional. |
| `workshop-bays` | `/bays` | `workshop_bays` | - | Estaciones/bahias de taller. |
| `quotes` | `/quotes` | `quotes` | `items` | Cotizaciones de taller por caso. |
| `mechanics` | `/mechanics` | `mechanics` | - | Equipo tecnico, usuario asociado, especialidad y carga. |
| `mechanic-specialties` | `/mechanic-specialties` | `mechanic_specialties` | - | Catalogo de especialidades tecnicas. |

## Clientes, fletes y rutas

| Recurso | Ruta | Tabla | JSON | Uso |
|---|---|---|---|---|
| `customers` | `/customers` | `customers` | `preferredOrigins`, `preferredDestinations`, `freightTypes`, `priceList` | Maestro de clientes: contacto, RUT, credito, riesgo, preferencias y tarifas. |
| `freight-requests` | `/freight/requests` | `freight_requests` | - | Solicitudes de flete, tracking, origen/destino, carga y estado. |
| `freight-quotes` | `/freight/quotes` | `freight_quotes` | `pricingSnapshot`, `routePricingSnapshot` | Cotizaciones de flete, costos, margen, impuestos y vencimiento. |
| `freight-pricing-settings` | `/freight/pricing-settings` | `freight_pricing_settings` | `cargoSurcharges` | Configuracion activa de pricing: base, km, combustible, peajes, margen e impuestos. |
| `freight-assignments` | `/freight/assignments` | `freight_assignments` | - | Asignacion de camion y chofer a solicitud/cotizacion. |
| `driver-trip-sheets` | `/driver-trip-sheets` | `driver_trip_sheets` | `expenseItems` | Planilla de viaje, gastos, margen real, costo/km y performance. |
| `freight-profitability` | `/freight-profitability` | `freight_profitability` | - | Resultado economico por flete/camion/chofer. |

`maps` no es un recurso CRUD. Es un modulo especializado que expone busqueda de lugares, detalle, rutas y mapa estatico usando Google Maps o fallback OpenStreetMap/OSRM.

## Flota, choferes y disponibilidad

| Recurso | Ruta | Tabla | JSON | Uso |
|---|---|---|---|---|
| `drivers` | `/drivers` | `drivers` | `caseIds` | Choferes, documento, licencia, telefono, compania y estado. |
| `driver-documents` | `/driver-documents` | `driver_documents` | - | Documentos del chofer, vencimiento y adjuntos. |
| `driver-fines` | `/driver-fines` | `driver_fines` | - | Multas/incidentes de chofer vinculadas a camion o flete. |
| `trucks` | `/trucks` | `trucks` | - | Camiones del modulo taller historico/simple. |
| `fleet-trucks` | `/fleet/trucks` | `fleet_trucks` | - | Maestro operacional de flota con VIN, odometro, estado, bloqueo y chofer asignado. |
| `fleet-availability` | `/fleet/availability` | `fleet_availability` | - | Columnas de disponibilidad y razon de bloqueo. |
| `truck-health-scores` | `/fleet/health-scores` | `truck_health_scores` | `deductions` | Score de salud por camion y deducciones. |
| `truck-timeline-events` | `/fleet/timeline-events` | `truck_timeline_events` | - | Timeline de eventos de flota. |
| `preventive-maintenance-plans` | `/preventive-maintenance/plans` | `preventive_maintenance_plans` | - | Planes por km/dias, vencimiento y riesgo. |
| `truck-documents` | `/truck-documents` | `truck_documents` | - | Documentos del camion y vencimientos. |
| `telematics` | `/telematics` | `truck_telemetry` | `alerts` | Ultima ubicacion, velocidad, combustible, motor y alertas. |
| `departure-checklists` | `/trip-checklists/departures` | `trip_departure_checklists` | `photos` | Checklist de salida de viaje. |
| `arrival-checklists` | `/trip-checklists/arrivals` | `trip_arrival_checklists` | `photos` | Checklist de llegada y recepcion. |
| `tire-lifecycles` | `/tire-performance/tires` | `tire_lifecycles` | - | Ingreso, instalacion, retiro, km usados y costo/km por neumatico. |

## Compras, inventario y proveedores

| Recurso | Ruta | Tabla | JSON | Uso |
|---|---|---|---|---|
| `parts` | `/parts` | `parts` | - | SKUs, categoria, stock minimo y costo unitario. |
| `warehouse-locations` | `/warehouse/locations` | `warehouse_locations` | - | Ubicaciones fisicas, zona, pasillo, nivel y capacidad. |
| `warehouse-stock` | `/warehouse/stock` | `warehouse_stock` | - | Stock fisico por SKU y ubicacion. |
| `warehouse-managers` | `/warehouse/managers` | `warehouse_managers` | `assignedLocationIds` | Encargados de bodega y ubicaciones asignadas. |
| `warehouse-movements` | `/warehouse/movements` | `warehouse_movements` | - | Movimientos de inventario por SKU, cantidad y caso relacionado. |
| `purchase-orders` | `/purchase-orders` | `purchase_orders` | `items` | Ordenes de compra, proveedor, items, total y entrega esperada. |
| `purchase-requests` | `/purchase-requests` | `purchase_requests` | - | Solicitudes de compra desde casos/repuestos. |
| `suppliers` | `/suppliers` | `suppliers` | `categories`, `activePurchaseOrderIds` | Proveedores, RUT, categorias, rating y OC activas. |

## Finanzas, combustible y control operacional

| Recurso | Ruta | Tabla | JSON | Uso |
|---|---|---|---|---|
| `truck-costs` | `/truck-costs` | `truck_costs` | - | Costos por camion y entidad relacionada. |
| `truck-cost-summaries` | `/truck-costs/summaries` | `truck_cost_summaries` | - | Resumen mensual, costo/km y rentabilidad por camion. |
| `fuel-records` | `/fuel/records` | `fuel_records` | - | Cargas de combustible, litros, precio, odometro y desviacion. |
| `fuel-price-snapshots` | `/fuel/prices/cache` | `fuel_price_snapshots` | `raw` | Cache de precio combustible desde CNE o fallback. |
| `incidents` | `/incidents` | `incidents` | `documents`, `photos` | Incidencias de flota/taller/flete, severidad, costo y evidencia. |
| `notifications` | `/notifications` | `notifications` | - | Alertas operacionales para usuarios/modulos. |
| `alert-subscriptions` | `/notifications/subscriptions` | `alert_subscriptions` | - | Preferencias de suscripcion a alertas. |
| `communication-profiles` | `/communications/profiles` | `communication_profiles` | - | Perfiles/cuentas de comunicacion. |
| `communication-provider-configs` | `/communications/provider-configs` | `communication_provider_configs` | - | Credenciales y parametros para WhatsApp/Outlook. |
| `communication-conversations` | `/communications/conversations` | `communication_conversations` | `tags` | Conversaciones por cliente/entidad. |
| `communication-messages` | `/communications/messages` | `communication_messages` | `attachments` | Mensajes enviados/recibidos, estado proveedor y adjuntos. |
| `communication-quote-links` | `/communications/quote-links` | `communication_quote_links` | - | Vinculos entre conversaciones y cotizaciones. |
| `roles` | `/permissions/roles` | `roles` | `permissions` | Roles y lista de permisos. |
| `user-role-assignments` | `/permissions/user-roles` | `user_role_assignments` | - | Usuarios, email, rol, hash de password y estado activo. |
| `shortcut-preferences` | `/settings/shortcuts` | `shortcut_preferences` | - | Preferencias de atajos por usuario. |

## Alias de compatibilidad

| Alias | Recurso real | Motivo |
|---|---|---|
| `/api/cases` | `/api/workshop-cases` | Frontend historico de casos. |
| `/api/checklists` | `/api/diagnostic-checklists` | Ruta corta para checklists. |
| `/api/fuel` | `/api/fuel/records` | Navegacion de combustible. |
| `/api/labor` | `/api/labor/tasks` | Ruta corta para mano de obra. |
| `/api/permissions` | `/api/permissions/roles` | Pantalla principal de permisos. |
| `/api/preventive-maintenance` | `/api/preventive-maintenance/plans` | Pantalla principal de mantenimiento. |
| `/api/sla` | `/api/sla/configs` | Ruta corta para SLA. |
| `/api/tire-performance` | `/api/tire-performance/tires` | Pantalla principal de neumaticos. |
| `/api/fleet/health-score` | `/api/fleet/health-scores` | Compatibilidad singular/plural. |

## Modulos especializados

Estos routers se montan antes o junto al CRUD generico cuando hay reglas adicionales.

| Modulo | Base API | Responsabilidad |
|---|---|---|
| `auth` | `/api/auth` | Login, JWT, usuario demo y roles persistidos. |
| `dashboard` | `/api/dashboard/summary` | KPIs del tablero principal. |
| `workshop-cases` | `/api/workshop-cases`, `/api/cases` | Crear casos, asignar, escalar, cerrar y sincronizar estado. |
| `assignments` | `/api/assignments` | Validar mecanico/caso y registrar asignacion. |
| `approvals` | `/api/approvals` | Aprobar/rechazar y actualizar entidad relacionada. |
| `diagnostics` | `/api/diagnostics` | Crear diagnostico y avanzar flujo del caso. |
| `customers` | `/api/customers` | CRUD de clientes y validacion de fletes activos antes de eliminar. |
| `freight/pricing` | `/api/freight/pricing` | Config activa y calculo de cotizacion. |
| `freight/assignments` | `/api/freight/assignments` | Asignacion de camion/chofer con validaciones. |
| `driver-trip-sheets` | `/api/driver-trip-sheets` | Planilla, preview y calculos de margen/performance. |
| `fuel-prices` | `/api/fuel/prices` | Precio actual, historico, sync y scheduler CNE. |
| `maps` | `/api/maps` | Places, detalle, ruta y mapa estatico. |
| `mechanics` | `/api/mechanics` | Mecanicos con usuario, especialidad y carga. |
| `parts` | `/api/parts` | Auditoria de actor en altas/cambios/bajas. |
| `permissions` | `/api/permissions/roles`, `/api/permissions/user-roles` | Roles y asignacion de usuarios. |
| `purchase-orders` | `/api/purchase-orders` | Numeracion, auditoria e items de OC. |
| `quotes` | `/api/quotes` | Cotizaciones de taller y sincronizacion con caso/aprobacion. |
| `reports` | `/api/reports` | Reportes agregados de taller, flota, finanzas, choferes, documentos, inventario y neumaticos. |
| `schedule` | `/api/schedule/events` | Agenda, conflictos y actualizacion de cola. |
| `suppliers` | `/api/suppliers` | Proveedores con auditoria. |
| `tire-performance` | `/api/tire-performance/tires` | Ingreso, instalacion, retiro y costos de neumaticos. |
| `truck-documents` | `/api/truck-documents` | Vencimientos, timeline, bloqueo y health score. |
| `warehouse` | `/api/warehouse/locations` | Ubicaciones con auditoria. |

## Seguridad y contexto de request

- `GET /api/health` queda publico.
- `/api/auth` queda publico para login.
- El resto pasa por `authenticateRequest` y `authorizeRequest`.
- `AUTH_REQUIRED=true` exige JWT en rutas privadas.
- `AUTH_ENFORCE_PERMISSIONS=true` valida permisos declarados en reglas.
- El frontend envia `Authorization: Bearer <token>` si existe sesion.
- Cada request propaga o crea `X-Request-Id`; el backend lo devuelve en `meta.requestId` o `error.requestId`.
- Para auditoria de actor se leen `x-user-id` y `x-user-name`.

## Migracion, seed y auditoria

| Script | Usa el registry | Rol |
|---|---|---|
| `scripts/migrate.js` | Si | Crea/actualiza tablas, columnas, tipos e indices. |
| `scripts/generate-seed-data.js` | Si, indirectamente | Compila mocks frontend a `seed-data.js`. |
| `scripts/seed.js` | Si | Hace upsert de datos iniciales por recurso. |
| `scripts/audit-database.js` | Si | Compara DB real con recursos esperados y detecta problemas. |

Cuando se agrega o cambia un recurso, el orden recomendado es:

1. Actualizar `resources.js`.
2. Actualizar mocks si el frontend requiere demo.
3. Ejecutar `npm run backend:seed:generate`.
4. Ejecutar `npm run backend:migrate`.
5. Ejecutar `npm run backend:db:audit`.
6. Actualizar esta documentacion si cambia la superficie API.

