# Auditoria de integracion frontend-backend

Fecha: 2026-05-13

## Alcance

Se reviso la conexion tecnica entre `frontend` y `backend`: rutas React, cliente HTTP, servicios, hooks compartidos, auth, env vars, CORS, rutas Express, recursos CRUD, servicios con reglas de negocio, mocks y pruebas de humo end-to-end.

## Diagnostico

La arquitectura general esta bien encaminada:

- Frontend React/Vite usa `VITE_API_URL` o fallback `http://localhost:4000/api`.
- Backend Express monta `API_PREFIX=/api` y expone recursos CRUD mas rutas de negocio.
- El backend tiene driver `sqlserver` para local real y driver `memory` para validacion rapida.
- Las rutas principales del frontend tienen endpoint backend equivalente.

Problemas encontrados:

- El cliente HTTP no propagaba token ni actor de sesion hacia backend.
- El login frontend ocultaba errores reales devolviendo una sesion falsa.
- Los hooks compartidos podian mostrar mocks ante fallos del backend.
- El handler de errores backend convertia algunos errores con `statusCode` explicito, como CORS 403, en 500.
- Todavia existen mocks de desarrollo en multiples modulos; ahora no se usan como reemplazo silencioso en los hooks compartidos, pero siguen disponibles como datos de soporte.

## Correcciones aplicadas

- `frontend/src/shared/services/httpClient.ts`
  - Agrega `Authorization: Bearer <token>` cuando existe sesion.
  - Agrega `X-Request-Id`, `X-User-Id` y `X-User-Name` a cada request.

- `frontend/src/features/auth/services/auth.service.ts`
  - Elimina login falso.
  - Usa `POST /auth/login` y devuelve `response.data.data`.
  - Deja que los errores 401/500 suban al formulario.

- `frontend/src/features/auth/components/LoginForm.tsx`
  - Maneja loading, error y `finally`.
  - Muestra mensaje real del backend con `ErrorState`.

- `frontend/src/shared/services/resourceApi.ts`
  - Agrega `fetchResourceList` y `fetchResourceById` estrictos con soporte `AbortSignal`.
  - Mantiene `listResource/getResourceById` legacy con warning en desarrollo para no romper llamadas existentes.

- `frontend/src/shared/hooks/useResourceList.ts`
  - Usa request estricta contra backend.
  - Expone `error` e `isFallback`.
  - Cancela requests al desmontar/cambiar parametros.
  - Ya no rellena tablas con mocks cuando falla el backend.

- `frontend/src/shared/hooks/useResourceItem.ts`
  - Mismo patron para detalles por ID.
  - Ya no rellena detalles con mocks cuando falla el backend.

- `backend/src/shared/middleware/error-handler.js`
  - Respeta errores no `AppError` con `statusCode/status` 4xx.
  - Mantiene 500 solo para errores realmente inesperados.

## Mapa frontend a backend

| Area | Pantallas frontend | Servicios/hooks | Endpoints backend | Estado |
| --- | --- | --- | --- | --- |
| Auth | `/login` | `auth.service.login` | `POST /api/auth/login` | Validado |
| Dashboard | `/dashboard` | `dashboard.service` | `GET /api/dashboard` | Revisado |
| Taller/casos | `/cases`, `/cases/:id`, `/cases/new` | `workshopCases.service`, `useWorkshopCases`, `useWorkshopCaseDetail` | `/api/workshop-cases`, `/api/cases/:id/assignments`, `/api/cases/:id/close`, `/api/cases/:id/escalations` | Validado lista |
| Diagnostico/taller | `/diagnostics`, `/checklists`, `/quotes`, `/approvals`, `/labor` | `diagnostics`, `quotes`, `approvals`, hooks CRUD | `/api/diagnostics`, `/api/diagnostic-checklists`, `/api/quotes`, `/api/approvals`, `/api/labor` | Revisado |
| Flota | `/trucks`, `/fleet`, `/fleet/trucks`, `/fleet/availability`, `/fleet/health-score` | `trucks.service`, `fleetHealthScore.service` | `/api/trucks`, `/api/fleet/trucks`, `/api/fleet/availability`, `/api/fleet/health-scores/*` | Validado lista |
| Choferes | `/drivers`, `/drivers/:id`, `/freight/driver-trip-sheets` | `drivers.service`, `driverTripSheets.service` | `/api/drivers`, `/api/driver-trip-sheets`, `/api/driver-documents`, `/api/driver-fines` | Validado lista |
| Fletes | `/freight/requests`, `/freight/requests/:id`, `/freight/quotes`, `/freight/assignments` | `freightPricing`, `freightAssignments`, hooks CRUD | `/api/freight/requests`, `/api/freight/quotes`, `/api/freight/assignments`, `/api/freight/pricing/*`, `/api/maps/*` | Validado E2E parcial |
| Inventario | `/warehouse`, `/warehouse/stock`, `/warehouse/locations`, `/warehouse/managers`, `/warehouse/report` | `warehouseLocations`, `warehouseInsights`, hooks CRUD | `/api/warehouse/stock`, `/api/warehouse/locations`, `/api/warehouse/managers`, `/api/warehouse/movements`, `/api/reports/inventory` | Validado lista |
| Compras/proveedores | `/purchase-orders`, `/suppliers`, `/parts` | `purchaseOrders`, `suppliers`, `parts` | `/api/purchase-orders`, `/api/suppliers`, `/api/parts` | Revisado |
| Operacion diaria | `/schedule`, `/bays`, `/incidents`, `/trip-checklists` | `schedule`, hooks CRUD | `/api/schedule/events`, `/api/schedule/waiting-queue`, `/api/bays`, `/api/incidents`, `/api/trip-checklists/*` | Revisado |
| Finanzas/reportes | `/truck-costs`, `/fuel`, `/reports` | `truckCostAnalytics`, `fuelPrices`, `reports` | `/api/truck-costs`, `/api/truck-costs/analytics`, `/api/fuel`, `/api/fuel/prices/*`, `/api/reports/*` | Revisado |
| Comunicaciones | `/communications`, `/notifications` | `communications`, `notifications` | `/api/communications/*`, `/api/notifications`, `/api/notifications/subscriptions` | Validado lista notificaciones |
| Configuracion | `/permissions`, `/settings/shortcuts` | `permissions`, hooks CRUD | `/api/permissions/roles`, `/api/permissions/user-roles`, `/api/settings/shortcuts` | Revisado |

## Endpoints revisados

Rutas explicitas revisadas:

- `POST /api/auth/login`
- `/api/dashboard`
- `/api/cases/:id/assignments`
- `/api/cases/:id/close`
- `/api/cases/:id/escalations`
- `/api/freight/pricing/settings/active`
- `/api/freight/pricing/calculate`
- `/api/freight/assignments`
- `/api/fleet/health-scores/overview`
- `/api/fleet/health-scores/recalculate`
- `/api/fuel/prices/current`
- `/api/fuel/prices/sync`
- `/api/maps/places`
- `/api/maps/route`
- `/api/maps/static-route`
- `/api/reports/*`
- `/api/truck-costs/analytics`
- `/api/tire-performance/tires/*`
- `/api/communications/*`

Recursos CRUD revisados en `backend/src/config/resources.js`:

- `approvals`, `diagnostics`, `diagnostic-checklists`, `sla/configs`
- `drivers`, `driver-documents`, `driver-fines`, `mechanics`, `mechanic-specialties`
- `customers`, `trucks`, `fleet/trucks`, `fleet/availability`, `fleet/health-scores`
- `freight/requests`, `freight/quotes`, `freight/assignments`, `driver-trip-sheets`
- `fuel/records`, `incidents`, `labor/tasks`, `parts`
- `purchase-orders`, `purchase-requests`, `quotes`, `repair-solutions`
- `schedule/events`, `schedule/waiting-queue`, `suppliers`
- `telematics`, `tire-performance/tires`, `trip-checklists/*`
- `truck-costs`, `truck-documents`, `warehouse/*`, `bays`, `settings/shortcuts`

## Flujos end-to-end validados

Con backend levantado en `DATA_DRIVER=memory`:

- `GET /api/health`: ok.
- `POST /api/auth/login`: ok, retorna `data.token` y `data.user`.
- `POST /api/auth/login` con password invalida: retorna 401.
- `GET /api/freight/requests`: ok.
- `GET /api/freight/quotes`: ok.
- `GET /api/freight/assignments`: ok.
- `GET /api/customers`: ok.
- `GET /api/trucks`: ok.
- `GET /api/drivers`: ok.
- `GET /api/workshop-cases`: ok.
- `GET /api/warehouse/stock`: ok.
- `GET /api/notifications`: ok.
- `POST /api/freight/requests`: crea registro.
- `GET /api/freight/requests/:id`: lee el registro creado por ID.
- `POST /api/freight/pricing/calculate`: calcula tarifa.
- CORS en `NODE_ENV=production` con origen bloqueado: retorna 403.

Con backend levantado con configuracion SQL Server local:

- `GET /api/health`: responde.
- `GET /api/trucks?limit=1`: ok, devuelve 1 registro.

Con servicios locales ya levantados:

- Frontend Vite en `http://127.0.0.1:5173`: responde 200.
- Backend en `http://127.0.0.1:4000/api/health`: responde.

## Variables de entorno

Frontend:

- No existe `frontend/.env`.
- `VITE_API_URL` es opcional.
- Fallback actual: `http://localhost:4000/api`.

Backend:

- `backend/.env` usa `PORT=4000`, `API_PREFIX=/api`.
- `DATA_DRIVER=sqlserver` para persistencia real.
- `DATA_DRIVER=memory` funciona para pruebas rapidas.
- `CORS_ORIGIN` incluye `http://localhost:5173` y `http://127.0.0.1:5173`.
- `SQL_SERVER=.\\CATA`, auth trusted.

## Mocks

Mocks utiles como fallback de desarrollo:

- `frontend/src/features/**/mocks`
- datos de respaldo pasados a `useResourceList`/`useResourceItem`

Cambios:

- Los hooks compartidos ya no usan esos mocks para tapar una caida del backend.
- Las funciones legacy de `resourceApi` mantienen fallback por compatibilidad, pero avisan en consola en desarrollo.

Pendiente recomendado:

- Hacer que cada vista muestre `ErrorState` cuando `error` exista en `useResourceList/useResourceItem`.
- Migrar usos legacy de `listResource/getResourceById` a `fetchResourceList/fetchResourceById` donde se quiera comportamiento estricto.

## Comandos de validacion

Ejecutados:

```powershell
npm --prefix backend run check
npm --prefix frontend run typecheck
npm --prefix frontend run lint
npm --prefix frontend run build
```

Comandos para levantar local:

```powershell
# Backend real con SQL Server configurado en backend/.env
npm --prefix backend run dev

# Frontend
npm --prefix frontend run dev
```

Prueba rapida sin SQL Server:

```powershell
$env:DATA_DRIVER='memory'
$env:PORT='4000'
npm --prefix backend run start
```

## Pendientes reales

- Varias vistas aun no renderizan explicitamente el nuevo `error` de los hooks compartidos.
- El proyecto conserva mocks para soporte de UI/demo; no se eliminaron masivamente para evitar romper pantallas que aun los importan como datos auxiliares.
- No se ejecutaron migraciones ni seed SQL Server reales desde esta auditoria; si la base cambia de esquema, correr `npm --prefix backend run migrate` y `npm --prefix backend run db:audit`.
- Auth existe como sesion local/dev y token simple; no hay guard fuerte de rutas protegidas ni refresh token.
- Los recursos CRUD genericos cubren muchos endpoints, pero sus validaciones son mas livianas que los servicios de negocio especificos. Conviene endurecer validaciones modulo a modulo.
