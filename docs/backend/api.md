# Backend - API y recursos

Actualizado: 2026-05-14

La API vive bajo el prefijo configurado en `API_PREFIX`, por defecto `/api`. Este documento se basa en `backend/src/routes/index.js` y `backend/src/config/resources.js`. Para una lectura por dominio, tablas y proposito de cada entidad, ver [catalogo de recursos y modulos](resources.md).

## Contrato HTTP

Respuesta simple:

```json
{
  "data": {},
  "meta": {
    "requestId": "uuid"
  }
}
```

Respuesta paginada:

```json
{
  "data": [],
  "meta": {
    "limit": 25,
    "page": 1,
    "requestId": "uuid",
    "total": 0,
    "totalPages": 1
  }
}
```

Error:

```json
{
  "error": {
    "details": {},
    "message": "Descripcion del error",
    "path": "/api/recurso",
    "requestId": "uuid",
    "statusCode": 400
  }
}
```

## CRUD generico

`src/config/resources.js` define nombre, ruta, tabla, campos, campos JSON, filtros, busqueda y ordenamiento. Cada recurso generico recibe:

```text
GET    /api/<ruta>?page=1&limit=25&search=&sort=createdAt&order=desc
GET    /api/<ruta>/:id
POST   /api/<ruta>
PATCH  /api/<ruta>/:id
DELETE /api/<ruta>/:id
```

Los listados aceptan:

- `page`: pagina desde 1.
- `limit`: maximo 100.
- `search` o `query`: busqueda textual en `searchableFields`.
- `sort`: campo permitido por `sortFields` o por `fields`.
- `order`: `asc` o `desc`.
- filtros directos por campos definidos en `filterFields`.

El repositorio SQL usa soft delete con `deleted_at`; el repositorio en memoria elimina el registro del store local.

## Recursos CRUD registrados

| Recurso | Ruta API | Tabla | Campos | JSON |
|---|---|---|---:|---|
| workshop-cases | `/workshop-cases` | `workshop_cases` | 47 | requiredParts, purchaseRequestIds, symptoms |
| assignments | `/assignments` | `assignments` | 9 |  |
| escalation-events | `/escalations` | `escalation_events` | 9 |  |
| approvals | `/approvals` | `approvals` | 11 |  |
| diagnostic-checklists | `/diagnostic-checklists` | `diagnostic_checklists` | 8 | items |
| diagnostics | `/diagnostics` | `diagnostics` | 11 | symptoms |
| sla-configs | `/sla/configs` | `sla_configs` | 9 |  |
| drivers | `/drivers` | `drivers` | 10 | caseIds |
| driver-documents | `/driver-documents` | `driver_documents` | 14 |  |
| driver-fines | `/driver-fines` | `driver_fines` | 21 |  |
| mechanics | `/mechanics` | `mechanics` | 14 |  |
| mechanic-specialties | `/mechanic-specialties` | `mechanic_specialties` | 11 |  |
| customers | `/customers` | `customers` | 23 | preferredOrigins, preferredDestinations, freightTypes, priceList |
| communication-profiles | `/communications/profiles` | `communication_profiles` | 15 |  |
| communication-provider-configs | `/communications/provider-configs` | `communication_provider_configs` | 28 |  |
| communication-conversations | `/communications/conversations` | `communication_conversations` | 22 | tags |
| communication-messages | `/communications/messages` | `communication_messages` | 27 | attachments |
| communication-quote-links | `/communications/quote-links` | `communication_quote_links` | 15 |  |
| notifications | `/notifications` | `notifications` | 19 |  |
| alert-subscriptions | `/notifications/subscriptions` | `alert_subscriptions` | 16 |  |
| trucks | `/trucks` | `trucks` | 11 |  |
| fleet-trucks | `/fleet/trucks` | `fleet_trucks` | 25 |  |
| fleet-availability | `/fleet/availability` | `fleet_availability` | 7 |  |
| truck-health-scores | `/fleet/health-scores` | `truck_health_scores` | 8 | deductions |
| truck-timeline-events | `/fleet/timeline-events` | `truck_timeline_events` | 10 |  |
| freight-requests | `/freight/requests` | `freight_requests` | 25 |  |
| freight-quotes | `/freight/quotes` | `freight_quotes` | 35 | pricingSnapshot, routePricingSnapshot |
| freight-pricing-settings | `/freight/pricing-settings` | `freight_pricing_settings` | 19 | cargoSurcharges |
| freight-assignments | `/freight/assignments` | `freight_assignments` | 15 |  |
| driver-trip-sheets | `/driver-trip-sheets` | `driver_trip_sheets` | 42 | expenseItems |
| freight-profitability | `/freight-profitability` | `freight_profitability` | 21 |  |
| fuel-records | `/fuel/records` | `fuel_records` | 16 |  |
| fuel-price-snapshots | `/fuel/prices/cache` | `fuel_price_snapshots` | 17 | raw |
| incidents | `/incidents` | `incidents` | 18 | documents, photos |
| labor-tasks | `/labor/tasks` | `labor_tasks` | 11 |  |
| parts | `/parts` | `parts` | 12 |  |
| roles | `/permissions/roles` | `roles` | 7 | permissions |
| user-role-assignments | `/permissions/user-roles` | `user_role_assignments` | 7 |  |
| shortcut-preferences | `/settings/shortcuts` | `shortcut_preferences` | 13 |  |
| preventive-maintenance-plans | `/preventive-maintenance/plans` | `preventive_maintenance_plans` | 16 |  |
| purchase-orders | `/purchase-orders` | `purchase_orders` | 15 | items |
| purchase-requests | `/purchase-requests` | `purchase_requests` | 11 |  |
| quotes | `/quotes` | `quotes` | 13 | items |
| repair-solutions | `/repair-solutions` | `repair_solutions` | 9 | requiredParts |
| schedule-events | `/schedule/events` | `schedule_events` | 20 |  |
| waiting-queue | `/schedule/waiting-queue` | `waiting_queue` | 13 |  |
| suppliers | `/suppliers` | `suppliers` | 16 | categories, activePurchaseOrderIds |
| telematics | `/telematics` | `truck_telemetry` | 13 | alerts |
| tire-lifecycles | `/tire-performance/tires` | `tire_lifecycles` | 32 |  |
| departure-checklists | `/trip-checklists/departures` | `trip_departure_checklists` | 19 | photos |
| arrival-checklists | `/trip-checklists/arrivals` | `trip_arrival_checklists` | 16 | photos |
| truck-costs | `/truck-costs` | `truck_costs` | 12 |  |
| truck-cost-summaries | `/truck-costs/summaries` | `truck_cost_summaries` | 9 |  |
| truck-documents | `/truck-documents` | `truck_documents` | 14 |  |
| warehouse-locations | `/warehouse/locations` | `warehouse_locations` | 13 |  |
| warehouse-stock | `/warehouse/stock` | `warehouse_stock` | 11 |  |
| warehouse-managers | `/warehouse/managers` | `warehouse_managers` | 8 | assignedLocationIds |
| warehouse-movements | `/warehouse/movements` | `warehouse_movements` | 10 |  |
| workshop-bays | `/bays` | `workshop_bays` | 8 |  |

## Alias de rutas

`routes/index.js` monta algunos alias para mantener compatibilidad con la navegacion frontend:

| Alias | Recurso real |
|---|---|
| `/api/cases` | `/api/workshop-cases` |
| `/api/checklists` | `/api/diagnostic-checklists` |
| `/api/fuel` | `/api/fuel/records` |
| `/api/labor` | `/api/labor/tasks` |
| `/api/permissions` | `/api/permissions/roles` |
| `/api/preventive-maintenance` | `/api/preventive-maintenance/plans` |
| `/api/sla` | `/api/sla/configs` |
| `/api/tire-performance` | `/api/tire-performance/tires` |
| `/api/fleet/health-score` | `/api/fleet/health-scores` |

## Rutas especializadas

| Modulo | Endpoints principales | Rol |
|---|---|---|
| health | `GET /api/health` | Estado de servicio. |
| auth | `POST /api/auth/login` | Login de desarrollo usando roles persistidos si existen. |
| dashboard | `GET /api/dashboard/summary` | Resumen de casos y asignaciones. |
| workshop-cases | CRUD, `GET/POST /:id/escalations`, `POST /:id/assignments`, `POST /:id/close` | Alta de caso, intake de flota, escalamiento, asignacion y cierre. |
| assignments | `GET /api/assignments`, `POST /api/assignments` | Asignacion de mecanicos a casos. |
| approvals | `PATCH /api/approvals/:id`, `POST /:id/approve`, `POST /:id/reject` | Resuelve aprobaciones y sincroniza entidad relacionada. |
| diagnostics | `POST/PATCH/DELETE /api/diagnostics` | Diagnosticos vinculados a caso. |
| customers | CRUD especializado, `GET /:id/credit` | Valida relaciones de fletes activos antes de borrar y expone resumen de credito. |
| communications | `provider-configs`, `send`, `webhooks/whatsapp` | Configuracion y envio simulado/live de WhatsApp Cloud y Microsoft Graph. |
| driver-trip-sheets | CRUD, `POST /preview` | Planillas de viaje, calculo de gastos y rendimiento. |
| fleet health | `GET /overview`, `POST /recalculate` | Health score de camiones desde documentos, costos, incidentes y telemetria. |
| freight assignment | `POST/PATCH/DELETE /freight/assignments` | Asigna camion/chofer a solicitud validando entidades. |
| freight pricing | `GET/PATCH /settings/active`, `POST /calculate` | Configuracion activa y calculo de cotizacion de flete. |
| fuel prices | `GET /current`, `GET /history`, `POST /sync` | Cache de precios CNE con fallback local. |
| maps | `GET /places`, `GET /places/:placeId`, `POST /route`, `GET /static-route` | Google Maps si hay API key, OpenStreetMap/OSRM como fallback. |
| mechanics | CRUD especializado | Relaciona usuario, especialidad y carga operacional activa. |
| parts | `POST/PATCH/DELETE /parts` | Auditoria de actor para SKUs. |
| permissions | CRUD roles y asignaciones usuario-rol | Gestion de permisos y usuarios operativos. |
| purchase-orders | `POST/PATCH/DELETE /purchase-orders` | Numeracion, auditoria y flujo de OC. |
| quotes | `POST/PATCH/DELETE /quotes` | Cotizacion de taller, aprobacion y sincronizacion de caso. |
| reports | `/summary`, `/workshop`, `/fleet`, `/finance`, `/driver-performance`, `/driver-trip-sheets`, `/document-expirations`, `/inventory`, `/tires` | Reporteria transversal. |
| schedule | `POST /api/schedule/events` | Planifica caso en bahia/mecanico y actualiza cola. |
| suppliers | `POST/PATCH/DELETE /suppliers` | Proveedores con auditoria. |
| tire-performance | `POST /tires`, `/tires/intake`, `/tires/:id/install`, `/tires/:id/remove`, `PATCH/DELETE /tires/:id` | Ciclo de vida de neumaticos, stock y costo por camion. |
| truck-costs | `GET /api/truck-costs/analytics` | Analitica de costos por camion. |
| truck-documents | `POST/PATCH/DELETE /truck-documents` | Vencimientos, bloqueo de flota, health score y timeline. |
| warehouse locations | `POST/PATCH/DELETE /warehouse/locations` | Ubicaciones de bodega con auditoria. |

## Verificacion de contrato frontend/backend

`backend/scripts/audit-frontend-contract.js` revisa endpoints usados por servicios frontend contra rutas backend montadas. La validacion se ejecuta dentro de:

```bash
npm run backend:check
npm run check
```

Ultima validacion conocida:

```text
Frontend/backend contract OK. 56 frontend endpoints covered by 77 backend routes.
```
