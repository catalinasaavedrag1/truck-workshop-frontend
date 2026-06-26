# Despliegue Fullstack (Frontend en Vercel + Backend en Render)

Esta guia despliega la app completa con login real: el frontend en Vercel y el
backend en Render en modo memoria (sin SQL Server, datos sembrados de mocks).

Arquitectura: el navegador llama a `/api` (mismo origen) -> funcion serverless
de Vercel (`frontend/api/[...path].js`) -> reenvia a `BACKEND_URL` (Render). No
hay problemas de CORS porque el proxy llama al backend desde el servidor.

## 1. Backend en Render

1. Entra a https://render.com e inicia sesion con GitHub.
2. **New -> Blueprint** y selecciona el repo `mimbral1/truck-workshop-frontend`.
   Render lee `render.yaml` y crea el servicio `truck-workshop-backend`.
3. Confirma y despliega. Render instala, arranca `npm start` y expone una URL
   tipo `https://truck-workshop-backend.onrender.com`.
4. Verifica el backend abriendo en el navegador:
   `https://TU-BACKEND.onrender.com/api/health` (debe responder OK).

Notas:
- El plan free se duerme tras inactividad; la primera llamada puede tardar ~50s.
- Los datos viven en memoria: se reinician cada vez que el servicio reinicia.
- Credenciales de login por defecto: `admin@truckworkshop.cl` / `admin123`.
  Para cambiarlas, genera un hash nuevo y ponlo en `DEV_LOGIN_PASSWORD_HASH`:
  `node -e "import('./backend/src/shared/security/password.js').then(m=>console.log(m.hashPassword('TU_PASSWORD')))"`

## 2. Frontend en Vercel

1. Entra a https://vercel.com e inicia sesion con GitHub.
2. **Add New -> Project** e importa `mimbral1/truck-workshop-frontend`.
3. En la configuracion de import:
   - **Root Directory**: `frontend`
   - El resto lo toma de `frontend/vercel.json`.
4. Agrega la variable de entorno del proxy (Settings -> Environment Variables):
   - `BACKEND_URL` = `https://TU-BACKEND.onrender.com`
   (sin `/api` al final; el proxy lo agrega solo)
5. **Deploy**. Obtendras una URL tipo
   `https://truck-workshop-frontend.vercel.app` con login real.

## 3. Verificacion

1. Abre la URL de Vercel: debe mostrar la pantalla de login (ya no entra solo).
2. Antes de loguear, esta URL debe responder:
   `https://truck-workshop-frontend.vercel.app/api/health`
   - Si dice `BACKEND_URL no configurado`, falta el paso 2.4.
   - Si dice `No se pudo conectar con el backend publico`, revisa que Render
     este arriba (paso 1.4) y que la URL sea correcta.
3. Ingresa con `admin@truckworkshop.cl` / `admin123`.

## Variables de entorno (resumen)

Render (backend) -- ya definidas en `render.yaml`:

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `DATA_DRIVER` | `memory` |
| `JWT_SECRET` | generado por Render |
| `AUTH_REQUIRED` | `true` |
| `AUTH_ALLOW_DEVELOPMENT_LOGIN` | `true` |
| `DEV_LOGIN_EMAIL` | `admin@truckworkshop.cl` |
| `DEV_LOGIN_PASSWORD_HASH` | hash de `admin123` |

Vercel (frontend):

| Variable | Valor |
|---|---|
| `BACKEND_URL` | URL publica de Render |

`frontend/vercel.json` ya fija `VITE_ALLOW_MOCK_FALLBACK=false` (usa backend real,
sin fallback silencioso a mocks) y omite `VITE_API_BASE_URL` para usar el proxy `/api`.

## Migrar a SQL Server real (opcional)

Cambia en Render `DATA_DRIVER=sqlserver` y agrega `SQL_SERVER`, `SQL_DATABASE`,
`SQL_USER`, `SQL_PASSWORD`, `SQL_PORT`, `SQL_ENCRYPT=true`. Corre las migraciones
y el seed con `npm run migrate` y `npm run seed:from-mocks`. Ver
`docs/deployment-vercel.md` para el detalle del backend con base de datos.
