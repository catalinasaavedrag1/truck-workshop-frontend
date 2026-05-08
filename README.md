# Truck Workshop Frontend

Frontend React + TypeScript para gestion operativa de un taller de camiones.

## Stack

- React
- TypeScript
- Vite
- React Router
- Axios
- CSS Modules
- Lucide React

## Scripts

```bash
npm install
npm run dev
npm run dev:all
npm run db:up
npm run backend:db:reset
npm run backend:db:audit
npm run check
npm run build
npm run lint
```

- `dev`: levanta solo el frontend.
- `dev:all`: levanta backend en `http://localhost:4000/api` y frontend en `http://127.0.0.1:5181`. Por defecto usa `DATA_DRIVER=memory` para que la demo funcione aunque SQL Server aun no tenga credenciales.
- `db:up`: levanta SQL Server Developer con Docker.
- `backend:db:reset`: crea tablas y carga datos iniciales en SQL Server.
- `backend:db:audit`: audita estructura y datos principales de SQL Server.
- `check`: ejecuta lint, typecheck y chequeo de sintaxis backend.

## Documentacion tecnica

- [Revision integral frontend/backend](docs/frontend-backend-quality-review.md)
- [Revision UX plataforma](docs/ux-platform-review.md)

## Aplicacion de escritorio

La app tambien se puede empaquetar como aplicacion de escritorio con Electron.

```bash
npm run desktop:preview
npm run desktop:pack
npm run desktop:dist
```

- `desktop:preview`: compila el frontend y abre la app en Electron.
- `desktop:pack`: genera una carpeta portable en `release/win-unpacked`.
- `desktop:dist`: genera el instalador Windows en `release/Truck Workshop Setup 0.0.0.exe`.

## Variables de entorno

Copia `.env.example` a `.env` cuando conectes un backend real.

```txt
VITE_APP_NAME=Truck Workshop
VITE_API_BASE_URL=http://localhost:4000/api
```

## Arranque fullstack local

```bash
npm install
npm --prefix backend install
npm run db:up
npm run backend:db:reset
npm run dev:all
```

Si ya tienes SQL Server configurado, ejecuta el backend con `DATA_DRIVER=sqlserver` y las credenciales de `backend/.env`.

Credenciales de desarrollo:

```txt
admin@truckworkshop.cl
truckworkshop
```

## Rutas principales

- `/login`
- `/dashboard`
- `/cases`
- `/cases/new`
- `/cases/:caseId`
- `/trucks`
- `/trucks/new`
- `/trucks/:truckId`
- `/diagnostics/:caseId`
- `/repair-solutions/:caseId`
- `/assignments`
- `/mechanics`
- `/mechanics/:mechanicId`
- `/parts`
- `/reports`

## Estructura

El codigo esta organizado por `features/` para que cada modulo concentre sus paginas, componentes, servicios, hooks y tipos. Los elementos reutilizables viven en `src/shared/`, la configuracion global en `src/config/` y los datos temporales en `src/mocks/`.
