# Revision frontend/backend - resumen

Actualizado: 2026-05-14

## Objetivo

Mantener Truck Workshop como una plataforma operacional clara, rapida y escalable sin romper contratos entre frontend y backend. El foco tecnico es:

- APIs estables.
- Datos relacionados por ID.
- Componentes reutilizables.
- Navegacion consistente.
- Formularios operacionales, no CRUD administrativos pesados.
- Observabilidad por request.
- Modo demo confiable sin ocultar errores reales en produccion.

## Estado actual

| Capa | Estado |
|---|---|
| Frontend | Modular por feature, rutas lazy, shell compartido, sidebar compacto con submenus, topbar con busqueda global, componentes reutilizables y fallback de mocks. |
| Backend | Express modular, CRUD declarativo, SQL Server/memory, request ID, migracion, seed y auditoria. |
| Documentacion | Separada en `docs/backend`, `docs/frontend`, `docs/quality` y `docs/ux`. |
| Desktop | Electron configurado con preview, pack y dist. |

## Mejoras tecnicas relevantes

- Request ID enviado por frontend y devuelto por backend.
- Respuestas backend estandarizadas con `data`, `meta` y `error`.
- Scripts raiz para `check`, `build`, `backend:*` y `desktop:*`.
- Recursos CRUD centralizados en `resources.js`.
- Modo `DATA_DRIVER=memory` para demo local.
- Menu lateral actualizado con barra compacta, submenus expandibles, busqueda y usuario fijo.
- `RutInput` compartido para clientes, choferes y proveedores.
- Vistas operacionales clave mejoradas: inventario, incidencias, diagnostico tecnico y rentabilidad de fletes.

## Riesgos principales

- Fallback a mocks queda controlado por entorno; revisar que `VITE_ALLOW_MOCK_FALLBACK` no se active en produccion.
- No hay suite automatizada amplia de API/E2E.
- Algunos calculos existen en frontend y backend; la fuente de verdad debe ser backend para flujos criticos.
- Permisos estan modelados y el backend ya tiene middleware activable por `AUTH_ENFORCE_PERMISSIONS`.
- Camiones legacy `/trucks` y flota `/fleet/trucks` aun conviven.

## Prioridades recomendadas

1. Agregar indicador visible cuando una vista use fallback local.
2. Crear tests E2E para caso taller, flete, incidencia, inventario y compras.
3. Agregar validacion de payload por recurso critico.
4. Consolidar reglas duplicadas frontend/backend.
5. Ampliar matriz de permisos por accion especifica cuando aparezcan nuevos endpoints.
6. Revisar indices SQL para filtros y busquedas de alto uso.
