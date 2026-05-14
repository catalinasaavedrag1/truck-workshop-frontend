# Auditoria Clean Code y arquitectura mantenible

Fecha: 2026-05-13

## Resumen ejecutivo

El proyecto tiene una separacion razonable por `frontend/` y `backend/`, con modulos por dominio, servicios API y componentes compartidos. La base es mantenible, pero hay varios sintomas de crecimiento rapido: archivos grandes, pantallas con mucha logica local, mocks mezclados con servicios productivos, controladores con logica de agregacion y falta de tests automatizados.

Se aplicaron refactors conservadores en dos puntos de alto impacto:

- Backend reportes: el controlador quedo como capa HTTP fina y la logica se movio a `reports.service.js`.
- Frontend comunicaciones: opciones y helpers puros se movieron a `utils`, reduciendo responsabilidad de la pagina principal.

## Estructura revisada

Frontend:

- `frontend/src/features/*`: paginas, componentes, servicios, tipos, mocks y utilidades por dominio.
- `frontend/src/shared/*`: componentes base, hooks, layout, servicios HTTP, shortcuts, tipos y utilidades.
- `frontend/src/router.tsx`: lazy routes centralizadas.

Backend:

- `backend/src/modules/*`: controladores, rutas y servicios por modulo.
- `backend/src/shared/*`: repositorios genericos, middleware, HTTP helpers y errores.
- `backend/src/config/resources.js`: definicion central de recursos CRUD.
- `backend/src/routes/index.js`: registro de rutas explicitas y CRUD.

## Hallazgos principales

### Frontend

Archivos mas criticos por tamano/responsabilidad:

- `features/communications/pages/CommunicationsPage.tsx`: aun grande, mezcla UI, estado local, handlers y modales. Se extrajeron helpers/opciones, pero conviene dividir por paneles.
- `features/incidents/components/IncidentForm.tsx`: formulario demasiado grande; deberia dividirse en secciones y hook de view-model.
- `features/reports/services/reports.service.ts`: mezcla calculos mock, fallback y cliente HTTP; conviene separar `mockReportBuilders` de `reportsApi`.
- `features/freight/utils/freightOperations.ts`: mucha logica operacional en un unico archivo; dividir por stage, riesgo y acciones.
- `features/workshop-cases/pages/WorkshopCaseDetailPage.tsx`: pagina con demasiada composicion y workflow local.
- `shared/components/Table/Table.tsx`: componente base poderoso pero grande; revisar si contiene sorting/pagination/render demasiado acoplados.

Problemas detectados:

- Algunas paginas todavia tienen handlers async, transformaciones de payload y UI en el mismo archivo.
- Hay varios servicios que mantienen fallback a mocks; util para demo, riesgoso si oculta integracion real.
- No hay tests automatizados detectados en `frontend` ni `backend`.
- El router esta correcto, pero crece como archivo unico y puede separarse por grupos de modulo.
- CSS modules ayudan al aislamiento, pero faltan reglas documentadas de tokens/spacing por componente.

### Backend

Archivos mas criticos por tamano/responsabilidad:

- `config/resources.js`: 1000+ lineas; funciona como registry central, pero deberia partirse por dominio.
- `modules/maps/maps.service.js`: servicio amplio con providers, geocoding, route fallback y validaciones en un solo archivo.
- `modules/reports/driver-performance-report.service.js`: agregaciones densas; candidato a helpers de calculo.
- `modules/communications/communication-integration.routes.js`: rutas con demasiada logica de integracion; deberia tener controller/service por provider.
- `modules/fleet/fleet-health-score.service.js`: calculos de scoring mezclados con persistencia.

Problemas detectados:

- Algunos controladores historicamente contenian logica de negocio/agregacion. Se corrigio `reports.controller.js`.
- Recursos CRUD genericos reducen duplicacion, pero necesitan validaciones por modulo para datos sensibles.
- `resources.js` es una fuente unica util, pero dificil de revisar y propensa a conflictos.
- Falta suite de tests para servicios de negocio y endpoints criticos.
- Logs son simples y no hay logger central con niveles/contexto.

## Refactors aplicados

### Backend reportes

Archivos:

- `backend/src/modules/reports/reports.controller.js`
- `backend/src/modules/reports/reports.service.js`

Antes:

- Controller tenia repositorios, queries, calculos, ordenamientos, fechas y respuesta HTTP.

Ahora:

- Controller solo parsea query minima y delega.
- `reports.service.js` contiene agregaciones y acceso a repositorios.
- Endpoints validados: `/reports`, `/reports/workshop`, `/reports/fleet`, `/reports/finance`, `/reports/inventory`, `/reports/tires`, `/reports/document-expirations`, `/reports/driver-trip-sheets`.

### Frontend comunicaciones

Archivos:

- `frontend/src/features/communications/pages/CommunicationsPage.tsx`
- `frontend/src/features/communications/utils/communicationOptions.ts`
- `frontend/src/features/communications/utils/communicationViewModel.ts`

Antes:

- La pagina contenia constantes de selects, tipos de filtro, helpers de merge, filtros, busqueda, proveedores, quote links y UI.

Ahora:

- `communicationOptions.ts` centraliza opciones de formularios.
- `communicationViewModel.ts` centraliza helpers puros de busqueda, merge, filtros, links y providers.
- La pagina queda mas orientada a composicion visual y handlers.

## Validaciones ejecutadas

```powershell
npm --prefix backend run check
npm --prefix frontend run typecheck
npm --prefix frontend run lint
npm --prefix frontend run build
```

Smoke test backend en `DATA_DRIVER=memory`:

- `GET /api/reports`
- `GET /api/reports/workshop`
- `GET /api/reports/fleet`
- `GET /api/reports/finance`
- `GET /api/reports/inventory`
- `GET /api/reports/tires`
- `GET /api/reports/document-expirations`
- `GET /api/reports/driver-trip-sheets`

Todos respondieron con `data`.

## Recomendaciones priorizadas

### Prioridad alta

- Dividir `CommunicationsPage.tsx` en paneles: `ConversationListPanel`, `ConversationDetailPanel`, `ConversationComposer`, `ProfileModal`, `IntegrationModal`, `QuoteLinkPanel`.
- Dividir `IncidentForm.tsx` y `DriverTripSheetForm.tsx` en secciones con hooks de payload/validacion.
- Separar `frontend/src/features/reports/services/reports.service.ts` en `reportsApi.ts` y `mockReportBuilders.ts`.
- Crear tests de humo para backend routes criticas: auth, freight, workshop cases, reports, assignments.

### Prioridad media

- Partir `backend/src/config/resources.js` por dominio: `fleet.resources.js`, `freight.resources.js`, `workshop.resources.js`, `inventory.resources.js`.
- Extraer providers de `communication-integration.routes.js` a servicios: `whatsappProvider.service.js`, `outlookProvider.service.js`.
- Crear logger compartido con niveles y requestId.
- Documentar convencion de servicios frontend: API real por defecto, mocks solo como fixture/demo explicito.

### Prioridad baja

- Reorganizar `router.tsx` por grupos de rutas importables.
- Estandarizar nombres de opciones/selects con sufijo `Options` y tipos `as const`.
- Agregar reglas de tamanos maximos recomendados: paginas < 350 lineas, componentes < 250, servicios < 300 salvo registries.

## Criterio de calidad futuro

Para mantener el proyecto escalable:

- Paginas: solo composicion, estado de pantalla y handlers del flujo.
- Componentes: UI reusable, props claras, sin llamadas HTTP directas.
- Hooks: side effects, loading/error, view-model cuando aplica.
- Servicios frontend: llamadas HTTP, transformaciones de payload y contratos.
- Controladores backend: request/query/body, delegacion y respuesta.
- Servicios backend: reglas de negocio, validaciones y efectos relacionados.
- Repositorios: persistencia y queries, sin decisiones de negocio.
