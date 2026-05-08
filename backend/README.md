# Truck Workshop Backend

Backend monolitico en JavaScript para el frontend de Truck Workshop, construido con Express y SQL Server.

## Stack

- Node.js con ES Modules
- Express
- SQL Server con `mssql`
- Arquitectura por capas: rutas, controladores, servicios, repositorios y recursos
- Migracion propia desde metadata de recursos
- Seeds operativos para desarrollo

## Estructura

```text
backend/
  scripts/
    migrate.js
    seed.js
    seed-data.js
    check-syntax.js
  src/
    app.js
    server.js
    config/
    db/
    modules/
    routes/
    shared/
```

## Configuracion

1. Instalar dependencias:

```bash
npm --prefix backend install
```

2. Crear `.env` desde `.env.example` y ajustar SQL Server:

```bash
cp backend/.env.example backend/.env
```

Variables principales:

```env
PORT=4000
API_PREFIX=/api
CORS_ORIGIN=http://127.0.0.1:5181,http://localhost:5173
DATA_DRIVER=sqlserver
SQL_SERVER=localhost
SQL_PORT=1433
SQL_DATABASE=TruckWorkshop
SQL_USER=sa
SQL_PASSWORD=YourStrong!Passw0rd
SQL_ENCRYPT=false
SQL_TRUST_SERVER_CERTIFICATE=true
```

Para desarrollo sin SQL Server listo, puedes usar `DATA_DRIVER=memory`. Ese modo mantiene los mismos endpoints y carga datos iniciales en memoria desde los seeds.

## Comandos

Desde la raiz del proyecto:

```bash
npm run db:up
npm run backend:check
npm run backend:migrate
npm run backend:seed
npm run backend:db:reset
npm run backend:dev
```

Si usas Docker, `npm run db:up` levanta SQL Server Developer con las mismas credenciales de `.env.example`.

Desde `backend/`:

```bash
npm run check
npm run migrate
npm run seed
npm run db:reset
npm run dev
```

## Endpoints base

La API queda bajo `/api`.

```text
GET    /api/health
POST   /api/auth/login
GET    /api/dashboard/summary
GET    /api/reports
GET    /api/reports/workshop
GET    /api/reports/fleet
GET    /api/reports/finance
GET    /api/reports/inventory
GET    /api/reports/tires
GET    /api/workshop-cases
POST   /api/workshop-cases
GET    /api/workshop-cases/:id
PATCH  /api/workshop-cases/:id
DELETE /api/workshop-cases/:id
GET    /api/workshop-cases/:id/escalations
POST   /api/workshop-cases/:id/escalations
POST   /api/workshop-cases/:id/assignments
GET    /api/assignments
POST   /api/assignments
```

Tambien existen aliases para mantener cercania con la navegacion del frontend:

```text
/api/cases                  -> /api/workshop-cases
/api/checklists             -> /api/diagnostic-checklists
/api/fuel                   -> /api/fuel/records
/api/labor                  -> /api/labor/tasks
/api/permissions            -> /api/permissions/roles
/api/preventive-maintenance -> /api/preventive-maintenance/plans
/api/sla                    -> /api/sla/configs
/api/tire-performance       -> /api/tire-performance/tires
/api/fleet/health-score     -> /api/fleet/health-scores
```

Los recursos operativos del sistema usan el mismo patron CRUD:

```text
GET    /api/<recurso>?page=1&limit=25&search=&sort=createdAt&order=desc
POST   /api/<recurso>
GET    /api/<recurso>/:id
PATCH  /api/<recurso>/:id
DELETE /api/<recurso>/:id
```

## Filtros, busqueda y orden

Los listados soportan:

- `search` o `query` para busqueda textual en campos definidos por recurso
- `page` y `limit` para paginacion
- `sort` y `order` para ordenamiento seguro
- filtros directos por campos permitidos en cada recurso

Ejemplo:

```text
GET /api/workshop-cases?search=freno&status=escalated&page=1&limit=25&sort=priority&order=desc
```

## Autenticacion de desarrollo

El login actual entrega una sesion de desarrollo para conectar el frontend sin bloquear la integracion inicial.

```json
{
  "email": "admin@truckworkshop.cl",
  "password": "truckworkshop"
}
```

En produccion se debe reemplazar por usuarios persistidos, hash de password y JWT firmado con expiracion.

## Notas de diseno

- No se cambian contratos del frontend ni payloads esperados.
- Las tablas se generan desde `src/config/resources.js`.
- Los campos JSON se guardan como `NVARCHAR(MAX)` y se serializan/deserializan en el repositorio.
- El borrado es logico mediante `deleted_at`.
- Los modulos con reglas propias, como asignaciones y escalamiento de casos, tienen servicios dedicados.
