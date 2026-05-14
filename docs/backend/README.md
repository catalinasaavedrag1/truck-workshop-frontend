# Backend

Actualizado: 2026-05-14

Documentacion de la API ubicada en `backend/`.

## Documentos

| Documento | Para que sirve |
|---|---|
| [Documentacion integral](../project-architecture.md) | Vision completa del monorepo, frontend, backend, contratos, rutas, recursos y checklists. |
| [Arquitectura](overview.md) | Stack, arranque, estructura y piezas internas. |
| [Configuracion y comandos](setup.md) | Variables de entorno, SQL Server, modo memoria y scripts. |
| [API y recursos](api.md) | Contrato HTTP, CRUD generico, recursos, alias y rutas especializadas. |
| [Catalogo de recursos y modulos](resources.md) | Recursos agrupados por dominio, tablas, JSON fields, alias y modulos especializados. |
| [Operaciones y mantenimiento](operations.md) | Modulos, migracion, seed, auditoria, integraciones y convenciones. |

## Resumen rapido

- API Express bajo `/api`.
- `GET /api/health` valida estado basico.
- Puede usar `DATA_DRIVER=memory` o `DATA_DRIVER=sqlserver`.
- Los recursos CRUD se declaran en `src/config/resources.js`.
- Los flujos con reglas propias viven en `src/modules`.
- Las migraciones y auditorias se generan a partir del registry de recursos.
- Cada request propaga o crea `X-Request-Id`.
- Las respuestas estandarizadas devuelven `data` y `meta.requestId`.
- Los errores devuelven `error.requestId`.

## Archivos principales

| Archivo | Rol |
|---|---|
| `src/server.js` | Proceso HTTP, scheduler y shutdown. |
| `src/app.js` | Factory Express y middleware global. |
| `src/routes/index.js` | Health, routers especializados, CRUD y alias. |
| `src/config/env.js` | Configuracion por entorno. |
| `src/config/resources.js` | Registry de recursos CRUD. |
| `src/shared/data/resource-repository.js` | Repositorio SQL Server generico. |
| `src/shared/data/memory-resource-repository.js` | Repositorio en memoria. |
| `src/shared/http/crud-router.js` | Router CRUD generico. |
| `scripts/migrate.js` | Crea/actualiza tablas e indices. |
| `scripts/seed.js` | Carga datos iniciales. |
| `scripts/audit-database.js` | Audita tablas, columnas, indices, JSON y relaciones. |
