# Frontend - datos, layout y UI compartida

Actualizado: 2026-05-14

Este documento explica como se conectan datos, shell visual y componentes compartidos en el frontend.

## Flujo de datos

La capa HTTP vive en `frontend/src/shared/services`.

| Archivo | Rol |
|---|---|
| `httpClient.ts` | Instancia Axios con `baseURL` desde `VITE_API_BASE_URL`, timeout de 12 segundos y header `X-Request-Id`. |
| `resourceApi.ts` | CRUD generico: `listResource`, `getResourceById`, `createResource`, `updateResource`, `deleteResource`. |
| `apiErrorHandler.ts` | Normaliza errores Axios y errores JavaScript. |
| `sessionUser.ts` | Recupera usuario de sesion/fallback para auditoria y UI. |

Hooks genericos:

| Hook | Uso |
|---|---|
| `useResourceList(path, fallback, params)` | Lista desde API y usa fallback local si falla. |
| `useResourceItem(path, id, fallback)` | Obtiene detalle desde API y usa fallback local si falla. |
| `usePagination` | Estado de paginacion local. |
| `useModal` | Estado de apertura/cierre. |
| `useDebounce` | Retardo para filtros o busqueda. |

## Patron de feature

```text
pages/*.tsx
  coordina carga, filtros, acciones y composicion visual

components/*.tsx
  renderiza UI especifica del dominio

services/*.service.ts
  encapsula endpoints especializados o escrituras

mocks/*.mock.ts
  datos de respaldo para demo/local

types/*.types.ts
  contratos TypeScript del dominio

constants/*.constants.ts
  labels, estados, opciones, tonos

utils/*.ts
  calculos, normalizadores y selectores locales
```

## Contrato API esperado

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
    "message": "Descripcion del error",
    "path": "/api/recurso",
    "requestId": "uuid",
    "statusCode": 400
  }
}
```

## Layout compartido

`frontend/src/shared/layout/MainLayout/MainLayout.tsx` arma el shell operativo.

| Pieza | Responsabilidad |
|---|---|
| `Sidebar` | Barra compacta, arbol de submenus, busqueda plana de accesos y usuario fijo. |
| `Topbar` | Busqueda global de entidades frecuentes, atajos, notificaciones y ayuda de teclado. |
| `ContextBar` | Contexto del modulo actual y accesos relacionados desde `navigationContext.ts` y `app.config.ts`. |
| `PageContainer` | Contenedor base para el contenido de pagina. |
| `KeyboardShortcutsHelp` | Modal de ayuda de atajos. |

## Sidebar

El sidebar actual tiene tres comportamientos principales:

| Modo | Comportamiento |
|---|---|
| Desktop fijo colapsado | Barra compacta con iconos de padres, brand arriba y usuario fijo abajo. |
| Panel abierto | Arbol con padres y submenus expandibles; los hijos se agrupan por `section`. |
| Busqueda activa | Lista plana de accesos visibles, con metadata de padre y seccion. |

La navegacion sale de `app.config.ts`:

- Si un item tiene `children`, se muestra como grupo desplegable.
- Los children con `showInSidebar=false` quedan ocultos del menu pero siguen disponibles por ruta.
- La busqueda aplana los children visibles para saltos rapidos.
- Se evita duplicar paths en resultados de busqueda.
- La ruta activa usa el match mas especifico y expande el grupo activo.

Submenus visibles por grupo/padre:

| Grupo | Padre | Accesos visibles |
|---|---|---|
| Inicio | Dashboard operativo | Dashboard operativo. |
| Operacion taller | Taller | Casos, Agenda taller, Mecanicos, Estaciones taller, Reportes. |
| Flota y logistica | Flota | Centro de flota, Disponibilidad, Health Score, Ficha camiones, Documentos, Choferes, Mantenimiento preventivo, Rendimiento neumaticos, Checklists viaje, Telemetria/GPS. |
| Flota y logistica | Logistica | Solicitudes, Portal cliente, Cotizaciones flete, Asignacion flete, Planillas choferes, Rentabilidad fletes. |
| Clientes y comercial | Clientes | Panel clientes, Cartera, Credito y riesgo, Tarifas, Operaciones, Comunicaciones, Rentabilidad. |
| Abastecimiento | Compras y abastecimiento | Panel de control, Reposicion sugerida, Solicitudes de compra, Ordenes de compra, Recepcion, Control documentos, Repuestos/SKUs, Stock fisico, Ubicaciones, Compradores/responsables, Proveedores, Auditoria, Calendario y Reportes. |
| Finanzas y control | Finanzas | Costos por camion, Combustible, Reportes operativos, Rendimiento choferes. |
| Administracion | Configuracion | Permisos, Atajos y teclado, Comunicaciones, Notificaciones, Incidentes. |

## Topbar

El topbar ofrece:

- Busqueda global sobre casos, camiones, choferes, clientes, OC, fletes, neumaticos, documentos e incidencias.
- Atajos rapidos configurados en `shared/shortcuts/quickActions.config.ts`.
- Centro de notificaciones.
- Boton de ayuda de teclado.
- Boton de menu solo cuando el sidebar no esta fijo.

## Componentes compartidos

| Componente | Uso |
|---|---|
| `Badge` | Estados, prioridades, severidades y etiquetas compactas. |
| `Button` | Acciones primarias, secundarias, ghost, danger e icon-only. |
| `Card` | Bloques de contenido cuando realmente necesitan marco. |
| `EmptyState` | Estado sin datos. |
| `ErrorState` | Estado de error. |
| `FilterBar` | Filtros operacionales con busqueda, selects, chips y limpieza compacta. |
| `Input` | Campo base con label/helper. |
| `LoadingState` | Carga estandar. |
| `MetricCard` | KPI reutilizable. |
| `Modal` | Dialogo base. |
| `PageHeader` | Breadcrumbs automaticos, titulo, descripcion, estado, meta, acciones y hints de atajos. |
| `RutInput` | Campo RUT con formato progresivo `20.007.759-8`. |
| `SectionHeader` | Encabezado de secciones internas. |
| `Select` | Select visual reutilizable. |
| `Table` | Tabla con busqueda, ordenamiento, paginacion, loading, error, estado vacio y filas navegables. |

## RUT

El proyecto tiene soporte compartido para RUT chileno:

- `shared/components/RutInput/RutInput.tsx`: aplica formato mientras el usuario escribe.
- `shared/utils/rut.ts`: `formatRut` y `getRutSearchText`.
- Se usa en clientes, choferes y proveedores.
- El formato visible esperado es `20.007.759-8`, no `200077598`.

## Atajos

`frontend/src/shared/shortcuts` contiene:

- `quickActions.config.ts`: acciones rapidas del topbar.
- `shortcutPreferences.constants.ts`: perfiles, labels y defaults.
- `shortcutPreferences.service.ts`: persistencia via API `/settings/shortcuts` con fallback local.
- `shortcutUtils.ts`: parseo, labels y combinaciones.
- `useGlobalShortcuts.ts`: listener global.
- `KeyboardShortcutsHelp.tsx`: modal de ayuda.

El layout muestra feedback visual/accesible cuando un shortcut enfoca busqueda, abre la paleta, cambia modulo o ejecuta una accion rapida. Los atajos globales evitan robar foco cuando el usuario escribe en inputs editables.

## Estilos

| Archivo | Rol |
|---|---|
| `reset.css` | Reset minimo. |
| `variables.css` | Tokens de color, radio, sombras, dimensiones y fuente. |
| `layout.css` | Patrones globales: grillas, stacks, toolbars, tabs, timeline, panels y formularios. |
| `globals.css` | Importa reset, variables y layout; define `body` y `#root`. |
| `*.module.css` | Estilos locales por componente o feature. |

## Recomendacion de mantenimiento

- No duplicar tabla, filtros o estados si `shared/components` ya resuelve el patron.
- Mantener `FilterBar` y `Table` como base de listados.
- Mantener submenus en `app.config.ts`, contexto en `navigationContext.ts` y usar `showInSidebar=false` para flujos secundarios.
- Mostrar acciones frecuentes en header o sticky footer, y acciones poco frecuentes como botones secundarios o paneles colapsables.
