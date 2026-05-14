# Frontend

Actualizado: 2026-05-14

Documentacion de la aplicacion React/Electron ubicada en `frontend/`.

## Documentos

| Documento | Para que sirve |
|---|---|
| [Documentacion integral](../project-architecture.md) | Vision completa del monorepo, frontend, backend, contratos, rutas, recursos y checklists. |
| [Arquitectura](overview.md) | Stack, estructura real, entrypoints, configuracion y flujo de render. |
| [Rutas](routes.md) | Mapa completo de rutas por area operacional. |
| [Datos, layout y UI compartida](data-layout.md) | HTTP, hooks, shell, sidebar, topbar, componentes, RUT, atajos y estilos. |
| [Mapa de modulos](modules.md) | Modulos por area, rutas, APIs, sidebar y responsabilidades. |
| [Inventario de features](features.md) | Modulos frontend, paginas, servicios y relacion frontend/backend. |
| [Demo y mantenimiento](maintenance.md) | Mocks, modo demo, pasos para agregar pantallas y reglas de mantenimiento. |

## Resumen rapido

- La app usa `RouterProvider` y rutas lazy.
- `/login` no usa shell; el resto corre dentro de `MainLayout`.
- El menu lateral organiza la plataforma por Inicio, Operacion taller, Flota y logistica, Clientes y comercial, Abastecimiento, Finanzas y control, y Administracion.
- `PageHeader` y `ContextBar` derivan breadcrumbs/contexto desde `shared/navigation/navigationContext.ts`.
- La busqueda del menu lateral permite encontrar modulos, submodulos y secciones visibles.
- El usuario queda fijo abajo del sidebar.
- El topbar mantiene busqueda global, atajos, notificaciones y acceso a ayuda de teclado.
- Los datos se consumen con Axios desde `shared/services/httpClient.ts`.
- `resourceApi.ts` y hooks compartidos cubren CRUD simple; servicios de feature cubren flujos de negocio.
- `RutInput` y `shared/utils/rut.ts` normalizan RUT como `20.007.759-8`.

## Primeros archivos a revisar

| Archivo | Rol |
|---|---|
| `frontend/src/main.tsx` | Montaje de React. |
| `frontend/src/App.tsx` | `RouterProvider`. |
| `frontend/src/router.tsx` | Lazy routes y shell principal. |
| `frontend/src/config/routes.ts` | Fuente de verdad de paths. |
| `frontend/src/config/app.config.ts` | Taxonomia de navegacion. |
| `frontend/src/shared/layout/MainLayout/MainLayout.tsx` | Shell general. |
| `frontend/src/shared/layout/Sidebar/Sidebar.tsx` | Barra compacta, arbol expandible, busqueda y usuario fijo. |
| `frontend/src/shared/layout/Topbar/Topbar.tsx` | Busqueda global y atajos. |
| `frontend/src/shared/services/httpClient.ts` | Cliente Axios. |
