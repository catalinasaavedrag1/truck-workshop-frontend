# Backend - operaciones y mantenimiento

Actualizado: 2026-05-13

## Modulos backend

| Modulo | Responsabilidad |
|---|---|
| `auth` | Login de desarrollo y resolucion de roles/asignaciones. |
| `approvals` | Resolucion transversal de aprobaciones. |
| `assignments` | Asignacion de mecanicos y sincronizacion de estado del caso. |
| `communications` | Perfiles, proveedores, mensajes, envio WhatsApp/Outlook y webhooks. |
| `customers` | Clientes, credito y bloqueo de borrado con fletes activos. |
| `dashboard` | Resumen operacional. |
| `diagnostics` | Diagnosticos de caso y avance del flujo. |
| `driver-trip-sheets` | Gastos reales, margenes, costo/km y performance score. |
| `fleet` | Health score de camiones. |
| `freight` | Pricing de fletes y asignacion camion/chofer. |
| `fuel-prices` | Precio diesel actual, historico, sync CNE y scheduler. |
| `maps` | Autocompletado, detalle, ruta y mapa estatico. |
| `mechanics` | Equipo de taller, especialidades y carga operacional. |
| `parts` | SKUs y auditoria. |
| `permissions` | Roles, permisos y asignaciones usuario-rol. |
| `purchase-orders` | Ordenes de compra, numeracion y auditoria. |
| `quotes` | Cotizaciones de taller, items, aprobaciones y sincronizacion de caso. |
| `reports` | Reportes operacionales y rendimiento de choferes. |
| `schedule` | Agenda, conflictos de bahia/mecanico y cola de espera. |
| `suppliers` | Proveedores y auditoria. |
| `tire-performance` | Ingreso, instalacion, retiro y ledger de neumaticos. |
| `truck-costs` | Analitica de costos. |
| `truck-documents` | Vencimientos, bloqueo de flota, timeline y score. |
| `warehouse` | Ubicaciones de bodega y auditoria. |
| `workshop-cases` | Ciclo principal de caso de taller. |

## CRUD generico vs modulo especializado

Usa CRUD generico cuando:

- La entidad es catalogo o lista simple.
- No hay transicion de estado compleja.
- No actualiza otras tablas.
- No necesita integracion externa.

Usa modulo especializado cuando:

- Cambia estados de negocio.
- Debe validar relaciones entre entidades.
- Debe escribir en mas de una tabla.
- Debe crear timeline, auditoria o efectos colaterales.
- Consume servicios externos.

## Migracion

`scripts/migrate.js`:

- Crea la base si no existe.
- Crea una tabla por recurso.
- Agrega columnas faltantes.
- Corrige tipos conocidos usando `column-type-inference.js`.
- Hace backfill de `created_by` y `updated_by` en tablas auditables.
- Crea indices para filtros, busquedas y ordenamientos relevantes.

Comando:

```bash
npm run backend:migrate
```

## Seed

`scripts/frontend-mock-seed.source.ts` importa mocks del frontend. Luego:

1. `generate-seed-data.js` usa `esbuild`.
2. Genera `scripts/seed-data.js`.
3. `seed.js` hace upsert por recurso usando `ResourceRepository`.

Comandos:

```bash
npm run backend:seed:generate
npm run backend:seed
```

Reset completo:

```bash
npm run backend:db:reset
```

## Auditoria de base de datos

`scripts/audit-database.js` revisa:

- Tablas esperadas.
- Columnas esperadas.
- Columna `deleted_at`.
- Tipos inferidos.
- Indices esperados.
- JSON invalido.
- Referencias huerfanas.
- Claves operacionales duplicadas.
- Conteos de filas por tabla.

Comando:

```bash
npm run backend:db:audit
```

## Integraciones externas

| Integracion | Modulo | Comportamiento |
|---|---|---|
| CNE/Energia Abierta | `fuel-prices` | Consulta precios, cachea snapshots y usa fallback si falla. |
| Google Maps | `maps` | Places, Routes y Static Maps si existe API key. |
| OpenStreetMap/OSRM | `maps` | Fallback para busqueda y rutas. |
| WhatsApp Cloud | `communications` | Envio y webhook bajo `/communications`. |
| Microsoft Graph | `communications` | Envio de correo Outlook si la config esta activa. |

## Actor y auditoria

Los servicios auditables reciben actor desde headers:

- `x-user-id`
- `x-user-name`

`shared/http/request-actor.js` centraliza la lectura. Cuando no hay actor, se usa fallback seguro para desarrollo.

## Convenciones para cambios

- Mantener respuestas con `data` y `meta`.
- Mantener errores con `error.message`, `error.statusCode`, `error.path` y `error.requestId`.
- Usar `AppError` para errores conocidos.
- Usar consultas parametrizadas.
- Guardar relaciones por ID.
- Guardar snapshot legible solo como ayuda de lectura.
- No exponer secretos en frontend ni seeds.
- Si una operacion toca varias tablas, preferir transaccion explicita.
- Ejecutar `npm run backend:check`.
- Si cambia SQL, ejecutar `npm run backend:db:audit`.

## Checklist para agregar un recurso CRUD

1. Agregar entrada en `src/config/resources.js`.
2. Definir `fields`, `searchableFields`, `filterFields` y `sortFields`.
3. Marcar `jsonFields` si aplica.
4. Ejecutar migracion.
5. Agregar seed si el frontend necesita demo.
6. Documentar endpoint si sera consumido por frontend.
7. Ejecutar auditoria.

## Checklist para agregar modulo especializado

1. Crear carpeta en `src/modules/<modulo>`.
2. Crear `*.routes.js`.
3. Crear `*.controller.js`.
4. Crear `*.service.js`.
5. Montar router en `src/routes/index.js`.
6. Reutilizar repositorios y recursos existentes.
7. Mantener contrato de respuesta estandar.
8. Agregar validaciones de relaciones.
9. Agregar trazabilidad de actor si hay auditoria.
