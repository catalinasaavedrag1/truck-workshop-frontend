# Backend - configuracion y comandos

Actualizado: 2026-05-14

El backend carga variables desde `.env` de la raiz y desde `backend/.env`. La forma recomendada es copiar `backend/.env.example` a `backend/.env`.

## Variables principales

```env
NODE_ENV=development
PORT=4000
API_PREFIX=/api
CORS_ORIGIN=http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:5181,http://localhost:5181,http://127.0.0.1:5183,http://localhost:5183
DATA_DRIVER=sqlserver

SQL_SERVER=.\CATA
SQL_PORT=
SQL_DATABASE=TruckWorkshop
SQL_AUTH_TYPE=trusted
SQL_USER=
SQL_PASSWORD=
SQL_ENCRYPT=false
SQL_TRUST_SERVER_CERTIFICATE=true

GOOGLE_MAPS_API_KEY=
GOOGLE_MAPS_COUNTRY=cl
GOOGLE_MAPS_LANGUAGE=es-419
GOOGLE_MAPS_REGION_CODE=CL
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
OSRM_BASE_URL=https://router.project-osrm.org
MAPS_USER_AGENT=truck-workshop-api/1.0

CNE_API_BASE_URL=https://api.cne.cl
CNE_FUEL_PRICES_PATH=/api/ea/precio/combustibleliquido
CNE_API_TOKEN=
CNE_DEFAULT_REGION_CODE=13
CNE_DEFAULT_FUEL_TYPE=DIESEL
CNE_SYNC_INTERVAL_MINUTES=15
CNE_REQUEST_TIMEOUT_MS=12000
CNE_FALLBACK_DIESEL_PRICE_PER_LITER=1050

JWT_SECRET=replace-with-a-long-secret
JWT_EXPIRES_IN=8h
AUTH_REQUIRED=false
AUTH_ENFORCE_PERMISSIONS=false
AUTH_ALLOW_DEVELOPMENT_LOGIN=true
DEV_LOGIN_EMAIL=admin@truckworkshop.cl
DEV_LOGIN_PASSWORD_HASH=123
```

## DATA_DRIVER

| Valor | Uso |
|---|---|
| `memory` | Repositorio en memoria. Ideal para demo local y `npm run dev:all`. |
| `sqlserver` | Persistencia real en SQL Server. Requiere variables SQL validas. |

El frontend consume los mismos endpoints en ambos modos.

## SQL Server

Con Docker desde la raiz:

```bash
npm run db:up
```

El `docker-compose.yml` levanta SQL Server 2022 Developer en el puerto `1433`.

Para usarlo con usuario SQL:

```env
SQL_AUTH_TYPE=sql
SQL_SERVER=localhost
SQL_PORT=1433
SQL_DATABASE=TruckWorkshop
SQL_USER=sa
SQL_PASSWORD=YourStrong!Passw0rd
SQL_ENCRYPT=false
SQL_TRUST_SERVER_CERTIFICATE=true
```

Para autenticacion Windows:

```env
SQL_AUTH_TYPE=trusted
SQL_SERVER=.\CATA
SQL_DATABASE=TruckWorkshop
SQL_TRUST_SERVER_CERTIFICATE=true
```

Para NTLM:

```env
SQL_AUTH_TYPE=ntlm
SQL_DOMAIN=MI_DOMINIO
SQL_USER=mi.usuario
SQL_PASSWORD=mi-password-windows
```

## Comandos desde la raiz

```bash
npm run backend:dev
npm run backend:start
npm run backend:migrate
npm run backend:seed
npm run backend:seed:generate
npm run backend:db:reset
npm run backend:db:audit
npm run backend:check
```

## Comandos desde `backend/`

```bash
npm run dev
npm run start
npm run migrate
npm run seed
npm run seed:generate
npm run seed:from-mocks
npm run db:reset
npm run db:audit
npm run check
```

## Flujo recomendado SQL

```bash
npm run db:up
npm run backend:db:reset
npm run backend:db:audit
npm run dev:all
```

## Flujo recomendado demo sin SQL

```bash
npm run dev:all
```

`dev:all` fuerza backend en modo memoria para que la plataforma sea navegable sin preparar SQL Server.

## Autenticacion y permisos

Credenciales demo:

```txt
admin@truckworkshop.cl
truckworkshop
```

El servicio de auth resuelve usuario/rol desde `user-role-assignments` y `roles`. Las contrasenas se guardan como hash PBKDF2, el login emite JWT con expiracion y el middleware puede exigir permisos por modulo.

Variables relevantes:

- `JWT_SECRET`: obligatorio en produccion.
- `JWT_EXPIRES_IN`: duracion de sesion, por ejemplo `8h`.
- `AUTH_REQUIRED=true`: exige token en rutas API no publicas.
- `AUTH_ENFORCE_PERMISSIONS=true`: valida permisos como `cases.view`, `fleet.manage` o `permissions.manage`.
- `AUTH_ALLOW_DEVELOPMENT_LOGIN=false`: desactiva el usuario demo.
- `DEV_LOGIN_PASSWORD_HASH`: hash opcional para cambiar la contrasena demo sin dejar texto plano.

## Integraciones opcionales

| Integracion | Variables | Fallback |
|---|---|---|
| Google Maps | `GOOGLE_MAPS_API_KEY`, `GOOGLE_MAPS_COUNTRY`, `GOOGLE_MAPS_LANGUAGE`, `GOOGLE_MAPS_REGION_CODE` | OpenStreetMap/Nominatim y OSRM. |
| CNE combustible | `CNE_API_TOKEN`, `CNE_*` | `CNE_FALLBACK_DIESEL_PRICE_PER_LITER`. |
| WhatsApp Cloud | Configuracion en `/communications/provider-configs` | Modo simulado si no hay credenciales activas. |
| Microsoft Graph | Configuracion en `/communications/provider-configs` | Modo simulado si no hay credenciales activas. |
