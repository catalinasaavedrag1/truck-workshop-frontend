# Revision integral frontend/backend

Actualizado: 2026-05-08

## Objetivo

Este documento deja una lectura tecnica de la plataforma completa y fija reglas de trabajo para mantener el frontend y backend con buenas practicas de desarrollo web, sin romper contratos API ni la logica operacional ya creada.

La plataforma es un sistema operacional para taller, flota, fletes, inventario, compras, comunicaciones, reporteria y administracion. Por eso la prioridad tecnica es:

- Lectura rapida de datos.
- Formularios conectados a entidades reales.
- Modulos conectados por IDs, no por texto libre.
- APIs estables.
- Componentes reutilizables.
- Trazabilidad de errores.
- Escalabilidad por modulo.

## Mejoras aplicadas en esta revision

- Se agrego trazabilidad por request en backend con `X-Request-Id`.
- El backend ahora devuelve `meta.requestId` en respuestas exitosas estandarizadas.
- El backend devuelve `error.requestId` en errores controlados y no controlados.
- El frontend envia `X-Request-Id` en cada request Axios.
- Se tiparon `meta.requestId` y campos extendidos de error API en `src/shared/types/api.types.ts`.
- Se agrego script raiz `npm run check` para ejecutar lint, typecheck y chequeo backend en una sola orden.
- Se agrego script raiz `npm run backend:db:audit` para exponer la auditoria SQL Server desde el monorepo.
- Se mantuvo compatibilidad con los contratos actuales: `data`, `meta`, paginacion y errores existentes.

## Arquitectura frontend

### Estructura principal

- `src/router.tsx`: define rutas lazy por pagina. Buena practica: reduce bundle inicial y mantiene rutas centralizadas.
- `src/config/routes.ts`: concentra rutas publicas y helpers para rutas con parametros.
- `src/features/*`: separacion por dominio funcional.
- `src/shared/components/*`: componentes UI reutilizables.
- `src/shared/layout/*`: layout global, sidebar, topbar y contenedores.
- `src/shared/hooks/*`: hooks genericos de datos y UI.
- `src/shared/services/*`: cliente HTTP y helpers API.
- `src/shared/shortcuts/*`: preferencias y acciones rapidas.

### Patrones correctos ya existentes

- Rutas con lazy loading.
- Componentes compartidos para tabla, filtros, cards, estados vacios, loading y errores.
- Servicios por feature cuando hay flujos especificos.
- Hooks genericos `useResourceList` y `useResourceItem`.
- Fallback de mocks para continuidad local cuando backend no responde.
- Tipos por feature.
- Componentes visuales para badges de estado.

### Riesgos frontend detectados

- Muchos modulos aun importan mocks directamente para resolver nombres relacionados. Ejemplo: chofer/camion/proveedor se resuelve desde mocks en varias vistas. Esto funciona localmente, pero puede ocultar inconsistencias si SQL Server ya tiene datos reales distintos.
- `listResource` hace fallback silencioso a mocks. Es util en desarrollo, pero en produccion deberia existir un indicador visible de "datos de respaldo" o una politica por entorno.
- Algunas vistas mezclan logica de consulta, calculos y render en el mismo archivo. Conviene extraer selectores y helpers cuando una pagina pase de 250-300 lineas.
- Algunos submodulos frontend existen como experiencia visual y consumen recursos CRUD genericos, no servicios dedicados. Esta bien para CRUD simple, pero flujos criticos necesitan servicio propio.
- Aun no hay pruebas unitarias ni E2E para flujos criticos como crear caso, asignar responsable, escalar, cotizar flete, asignar flete y crear orden de compra.

### Reglas frontend recomendadas

- Cada vista de datos debe usar `Table`, `FilterBar`, `PageHeader`, `LoadingState`, `EmptyState` y `ErrorState` antes de crear variantes nuevas.
- Cada formulario que dependa de entidades debe usar selects alimentados por API, no campos libres, salvo observaciones o notas.
- Cada modulo debe exponer un `services/*.service.ts` cuando tenga operaciones de escritura o flujos no triviales.
- Los mocks deben quedar como fallback de desarrollo, no como fuente principal en componentes operacionales.
- Las tablas deben activar busqueda, ordenamiento y paginacion cuando superen 20 registros.
- Las acciones destructivas deben usar confirmacion visual.
- Las rutas nuevas deben agregarse en `src/config/routes.ts` y `src/router.tsx`.
- Los componentes compartidos deben vivir en `src/shared/components`; componentes de negocio deben quedarse dentro del feature.

## Arquitectura backend

### Estructura principal

- `backend/src/app.js`: configura Express, seguridad, CORS, body parser, logging y middleware.
- `backend/src/routes/index.js`: monta routers especializados y routers CRUD genericos.
- `backend/src/config/resources.js`: registry central de recursos CRUD, tablas SQL Server, campos, filtros, busqueda y ordenamiento.
- `backend/src/shared/data/resource-repository.js`: repositorio SQL Server generico.
- `backend/src/shared/data/resource-service.js`: capa de servicio CRUD.
- `backend/src/shared/http/crud-router.js`: router CRUD generico.
- `backend/src/modules/*`: modulos con flujos especificos.
- `backend/src/db/*`: conexion SQL Server y migraciones/seed.

### Patrones correctos ya existentes

- Backend monolitico modular.
- Registry declarativo para recursos CRUD.
- SQL parametrizado para busqueda, filtros y paginacion.
- Soft delete por `deleted_at`.
- Rutas especializadas para flujos de negocio.
- Capa de errores con `AppError`.
- Configuracion por `.env`.
- Migracion y seed desde mocks.
- Integracion mapas con Google opcional y fallback OpenStreetMap/OSRM.

### Riesgos backend detectados

- El CRUD generico no valida payloads por esquema. SQL parametrizado protege de inyeccion, pero no evita datos incompletos o campos semanticamente incorrectos.
- Algunas reglas de negocio viven en frontend y backend a la vez. Ejemplo: calculos de flete tienen constantes frontend y servicio backend. La fuente de verdad debe ser backend.
- Algunos modulos backend son CRUD por configuracion y no tienen servicio propio. Esta bien para catalogos, pero no para estados operacionales complejos.
- El fallback mock en frontend puede hacer parecer que una API funciona aunque SQL Server este vacio o una tabla falte.
- No hay suite automatizada de tests de API.

### Reglas backend recomendadas

- Todo modulo nuevo debe agregarse primero a `resources.js` si es CRUD simple.
- Si el modulo tiene transiciones de estado, debe tener router, controller y service propios.
- Los endpoints no deben aceptar nombres escritos a mano si existe una entidad relacionada; deben recibir `id` y guardar snapshot legible si hace falta.
- Los servicios deben mantener transacciones cuando actualicen mas de una tabla.
- Los errores deben usar `AppError` con status y detalles.
- Cada respuesta estandarizada debe mantener `data` y, si aplica, `meta`.
- Cada request debe poder rastrearse con `X-Request-Id`.
- Los secretos de integraciones deben ir en `.env`, nunca en codigo ni seed visible.

## Matriz de modulos y conectividad

| Modulo frontend | Ruta/vista principal | Backend/API relacionado | Estado tecnico | Observacion clean code |
|---|---|---|---|---|
| Auth | `/login` | `/auth/login` | Conectado | Mantener token/usuario en un store formal si crece autenticacion. |
| Dashboard | `/dashboard` | `/dashboard/summary` y recursos CRUD | Conectado mixto | Usa datos cruzados; debe evitar depender de mocks cuando backend este estable. |
| Casos taller | `/cases`, `/cases/new`, `/cases/:id` | `/cases`, `/workshop-cases` | Conectado especializado | Flujo correcto para crear, asignar, escalar y cerrar; necesita tests E2E. |
| Diagnosticos | `/diagnostics/:caseId` | `/diagnostics` | Conectado | Correcto como recurso relacionado a caso. |
| Checklists diagnostico | `/checklists` | `/diagnostic-checklists`, alias `/checklists` | CRUD conectado | Buen candidato para editor versionado de plantillas. |
| Soluciones reparacion | `/repair-solutions/:caseId` | `/repair-solutions` | Conectado | Mantener relacion por `caseId`. |
| Asignaciones taller | `/assignments` | `/assignments`, `/cases/:id/assignments` | Conectado especializado | Debe seguir mostrando contexto completo del caso, no solo mecanico. |
| Escalaciones | Integrado en caso | `/cases/:id/escalations`, `/escalations` | Conectado por caso | Mantener historial visible y razones normalizadas. |
| Agenda taller | `/schedule` | `/schedule/events`, `/schedule/waiting-queue` | Conectado | Buen patron de filtros en header y tablero operativo. |
| Bahias taller | `/bays` | `/bays` | CRUD conectado | Catalogo simple correcto. |
| Mecanicos | `/mechanics`, `/mechanics/:id` | `/mechanics` | Conectado especializado | Correcto para crear/editar; mantener especialidad por id. |
| Especialidades mecanico | `/mechanics/specialties` | `/mechanic-specialties` | CRUD conectado | Buen catalogo para usuarios perfil mecanico. |
| Camiones legacy | `/trucks` | `/trucks` | Conectado | Conviene converger con flota para evitar duplicidad. |
| Flota | `/fleet`, `/fleet/trucks`, `/fleet/availability`, `/fleet/health-score` | `/fleet/trucks`, `/fleet/availability`, `/fleet/health-scores`, `/fleet/timeline-events` | Conectado | Es el modulo maestro para camiones operacionales. |
| Choferes | `/drivers`, `/drivers/:id` | `/drivers`, `/driver-documents`, `/driver-fines` | Conectado | Buena relacion con documentacion/multas; evitar mocks en resumen superior. |
| Documentos camion | `/truck-documents` | `/truck-documents` | Conectado | Reporteria de vencimientos usa este recurso. |
| Mantenimiento preventivo | `/preventive-maintenance` | `/preventive-maintenance/plans` | Conectado | Correcto como subdominio de flota/taller. |
| Costos camion | `/truck-costs` | `/truck-costs`, `/truck-costs/analytics`, `/truck-costs/summaries` | Conectado | Mantener detalle mensual/anual en backend. |
| Combustible | `/fuel`, `/fuel/new`, `/fuel/report` | `/fuel/records`, alias `/fuel` | Conectado | Requiere relacion por camion/chofer desde API, no mocks directos en filtros. |
| Telemetria/GPS | `/telematics` | `/telematics` | CRUD conectado | La visualizacion debe priorizar flota en mapa y alertas accionables. |
| Neumaticos | `/tire-performance` | `/tire-performance/tires` | CRUD conectado | Correcto como costo operacional de camion. |
| Checklists viaje | `/trip-checklists` | `/trip-checklists/departures`, `/trip-checklists/arrivals` | Conectado | Separacion entrada/salida correcta. |
| Fletes solicitudes | `/freight/requests` | `/freight/requests` | Conectado | Usa clientes y mapas; debe recibir origen/destino normalizados. |
| Fletes cotizaciones | `/freight/quotes` | `/freight/quotes`, `/freight/pricing/*`, `/maps/*` | Conectado especializado | Backend debe seguir siendo fuente de verdad de costos. |
| Fletes asignaciones | `/freight/assignments` | `/freight/assignments` | Conectado especializado | Debe validar disponibilidad de camion/chofer en backend. |
| Planillas chofer | `/freight/driver-trip-sheets` | `/driver-trip-sheets` | Conectado | Buen modulo para rendimiento viaje y reporteria. |
| Rentabilidad flete | `/freight-profitability` | `/freight-profitability` | CRUD conectado | Debe consolidar costos de combustible, peajes, mantencion y chofer. |
| Clientes | `/customers` | `/customers` | Conectado | Correcto para listas de precio, credito y tipos de flete. |
| Mapas/rutas | componente `RoutePlanner` | `/maps/places`, `/maps/route` | Conectado especializado | Google opcional; fallback OpenStreetMap/OSRM funcional. |
| Proveedores | `/suppliers` | `/suppliers` | Conectado especializado | Auditoria createdBy/updatedBy presente en recurso. |
| Partes/SKU | `/parts` | `/parts` | Conectado especializado | Correcto para inventario; mantener SKU unico en backend. |
| Bodega | `/warehouse`, `/warehouse/locations`, `/warehouse/stock`, `/warehouse/managers` | `/warehouse/locations`, `/warehouse/stock`, `/warehouse/managers`, `/warehouse/movements` | Conectado | Consolidado como gestion de inventario. |
| Ordenes compra | `/purchase-orders` | `/purchase-orders`, `/purchase-requests` | Conectado especializado | Flujo correcto; compras desde casos debe dejar trazabilidad. |
| Cotizaciones taller | `/quotes` | `/quotes` | Conectado especializado | Relaciona caso, diagnostico, items y aprobaciones. |
| Aprobaciones | `/approvals` | `/approvals` | Conectado especializado | Debe mantenerse como bandeja transversal. |
| Mano obra | `/labor` | `/labor/tasks`, alias `/labor` | Conectado | Debe relacionarse siempre con caso y mecanico. |
| Comunicaciones | `/communications` | `/communications/*` | Conectado especializado | WhatsApp/Outlook configurable; credenciales solo backend/env. |
| Notificaciones | `/notifications` | `/notifications`, `/notifications/subscriptions` | Conectado | Buen lugar para suscripciones y alertas operacionales. |
| Reportes | `/reports` | `/reports/*` | Conectado especializado | Correcto para vencimientos tecnica y planillas chofer. |
| Incidencias | `/incidents` | `/incidents` | Conectado | Relaciona camion, chofer, flete y caso taller. |
| Permisos/usuarios | `/permissions` | `/permissions/roles`, `/permissions/user-roles` | Conectado | Falta enforcement real de permisos en rutas backend. |
| Configuracion atajos | `/settings/shortcuts` | `/settings/shortcuts` | CRUD conectado | Preferencias persistentes por usuario/perfil. |
| SLA | Integrado en casos | `/sla/configs` | CRUD conectado | Sin pagina dedicada; se consume en componentes de caso. |

## Estado de buenas practicas por capa

### UI/UX operacional

Correcto:

- Tablas reutilizables con busqueda, ordenamiento y paginacion.
- Filtros reutilizables con chips activos.
- Sidebar y rutas centralizadas.
- Estados visuales para badges y prioridades.
- Formularios con selects donde ya hay entidades.

Por mejorar:

- Reducir imports directos de mocks en componentes de detalle.
- Mostrar cuando una vista esta usando fallback local.
- Agregar tests de flujos criticos con Playwright.
- Consolidar camiones legacy `/trucks` y flota `/fleet/trucks`.

### Manejo de datos frontend

Correcto:

- `httpClient` centralizado.
- `resourceApi` reutilizable.
- Hooks de lista/detalle.
- Tipos API compartidos.
- Request ID por llamada.

Por mejorar:

- Exponer `error` en `useResourceList` y `useResourceItem`.
- Permitir abort/cancelacion de requests en cambios rapidos de filtros.
- Separar fallback mocks por entorno: desarrollo si, produccion no.

### Backend/API

Correcto:

- Express modular.
- SQL Server parametrizado.
- CRUD registry escalable.
- Soft delete.
- Request ID.
- Errores estandarizados.

Por mejorar:

- Validacion por recurso antes de guardar.
- Tests de controllers/services.
- Transacciones explicitas para flujos multi-tabla.
- Enforcement de permisos por rol en middleware.
- Indices SQL revisados para `searchableFields`, `filterFields` y `sortFields`.

## Checklist para crear o modificar un modulo

1. Definir entidad principal y relaciones por ID.
2. Si es CRUD simple, agregar recurso a `backend/src/config/resources.js`.
3. Si tiene flujo, crear `routes`, `controller` y `service` en `backend/src/modules/<modulo>`.
4. Agregar migracion SQL y seed si corresponde.
5. Crear tipos en `src/features/<modulo>/types`.
6. Crear servicio frontend si hay escritura o flujo especifico.
7. Usar `useResourceList`/`useResourceItem` para lectura.
8. Usar `PageHeader`, `FilterBar`, `Table`, `LoadingState`, `EmptyState`, `ErrorState`.
9. Agregar ruta en `src/config/routes.ts` y `src/router.tsx`.
10. Validar con `npm run check` y, si toca base, `npm run backend:db:audit`.

## Comandos de validacion

```bash
npm run check
npm run build
npm run backend:db:audit
```

Para levantar en desarrollo:

```bash
npm run dev
npm run backend:dev
```

## Contrato API estandar

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
    "limit": 100,
    "page": 1,
    "total": 0,
    "totalPages": 1,
    "requestId": "uuid"
  }
}
```

Error:

```json
{
  "error": {
    "message": "Descripcion del error",
    "path": "/api/recurso",
    "requestId": "uuid",
    "statusCode": 400
  }
}
```

## Prioridad de proximas mejoras

1. Agregar validacion de payloads en backend por recurso critico: casos, fletes, compras, inventario, usuarios/perfiles.
2. Eliminar mocks directos desde componentes operacionales y reemplazarlos por hooks/servicios.
3. Agregar tests E2E para: crear caso, asignar, escalar, cerrar, crear flete, cotizar, asignar, crear orden de compra.
4. Agregar middleware de permisos backend.
5. Agregar indicador visual de fallback local cuando backend falle.
6. Auditar indices SQL Server por filtros y ordenamientos reales.
7. Consolidar duplicidad camion legacy vs flota.
