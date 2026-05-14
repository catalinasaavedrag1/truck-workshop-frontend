# Frontend - rutas

Actualizado: 2026-05-13

Las rutas publicas viven en `frontend/src/config/routes.ts` y se montan en `frontend/src/router.tsx`. `/login` queda fuera de `MainLayout`; el resto de vistas usa sidebar, topbar y barra de contexto.

## Reglas de rutas

- `ROUTES` es la fuente unica de paths.
- Las rutas con parametros se exponen como helpers: `caseDetail(caseId)`, `truckDetail(truckId)`, etc.
- Toda pagina nueva debe agregarse en `routes.ts` y `router.tsx`.
- Si la pagina debe aparecer en navegacion, tambien debe agregarse a `app.config.ts`.
- El sidebar muestra submenus desde `app.config.ts` y aplana los accesos visibles solo durante la busqueda.

## Mapa por area

| Area | Rutas frontend |
|---|---|
| Auth | `/login` |
| Portal publico fletes | `/portal/freight/request`, `/portal/freight/requests`, `/portal/freight/history`, `/portal/freight/tracking/:trackingNumber` |
| Inicio | `/`, `/dashboard` |
| Casos taller | `/cases`, `/cases/new`, `/cases/:caseId`, `/cases/:caseId/assign`, `/cases/:caseId/escalate`, `/cases/:caseId/close` |
| Agenda taller | `/schedule`, `/bays` |
| Diagnostico y reparacion | `/diagnostics`, `/diagnostics/:caseId`, `/repair-solutions/:caseId`, `/checklists`, `/labor`, `/approvals` |
| Equipo taller | `/assignments`, `/mechanics`, `/mechanics/specialties`, `/mechanics/:mechanicId` |
| Camiones legacy/taller | `/trucks`, `/trucks/new`, `/trucks/:truckId` |
| Flota operacional | `/fleet`, `/fleet/trucks`, `/fleet/trucks/:truckId`, `/fleet/availability`, `/fleet/health-score` |
| Choferes | `/drivers`, `/drivers/new`, `/drivers/:driverId` |
| Documentos y costos | `/truck-documents`, `/truck-documents/:documentId`, `/truck-costs`, `/truck-costs/:truckId` |
| Combustible | `/fuel`, `/fuel/new`, `/fuel/report` |
| Neumaticos | `/tire-performance`, `/tire-performance/intake`, `/tire-performance/install`, `/tire-performance/remove`, `/tire-performance/comparison` |
| Checklists viaje | `/trip-checklists`, `/trip-checklists/departure`, `/trip-checklists/arrival` |
| Telematica | `/telematics` |
| Inventario | `/warehouse`, `/warehouse/report`, `/warehouse/locations`, `/warehouse/managers`, `/warehouse/stock`, `/parts`, `/parts/:partId` |
| Compras | `/purchase-orders`, `/purchase-orders/new`, `/purchase-orders/:purchaseOrderId`, `/suppliers`, `/suppliers/new`, `/suppliers/:supplierId` |
| Fletes clientes | `/customers`, `/customers/:customerId` |
| Fletes operacion | `/freight/requests`, `/freight/requests/new`, `/freight/requests/:requestId`, `/freight/client-portal`, `/freight/client-portal/requests`, `/freight/client-portal/history`, `/freight/client-portal/tracking/:trackingNumber`, `/freight/quotes`, `/freight/quotes/:quoteId`, `/freight/assignments`, `/freight/driver-trip-sheets`, `/freight-profitability` |
| Incidencias y control | `/incidents`, `/incidents/new`, `/incidents/:incidentId`, `/communications`, `/notifications` |
| Reportes | `/reports`, `/reports/driver-performance` |
| Administracion | `/permissions`, `/settings/shortcuts` |
| Preventivo | `/preventive-maintenance`, `/preventive-maintenance/new`, `/preventive-maintenance/:planId` |

## Relacion con el menu lateral

El menu lateral usa los items de `app.config.ts`, no lee automaticamente todas las rutas. Esto permite separar:

- Rutas enrutables: todo lo que React Router puede renderizar.
- Accesos de navegacion: solo lo que debe aparecer como entrada operacional.
- Accesos secundarios: botones, tablas o acciones dentro de una vista.

Ejemplo: `/cases/:caseId/close` existe como ruta, pero normalmente se alcanza desde la ficha del caso, no como item principal de menu.

## Rutas con fallback desktop

`router.tsx` usa `createHashRouter` cuando `window.location.protocol === 'file:'`. Esto permite que la app empaquetada con Electron funcione sin servidor web.
