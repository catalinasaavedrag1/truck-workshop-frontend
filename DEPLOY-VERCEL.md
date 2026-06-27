# Desplegar en Vercel (frontend + backend real)

A diferencia de GitHub Pages (estatico, sin backend), Vercel sirve el frontend
estatico **y** corre el backend Express como funcion serverless en el mismo
dominio. Asi `/api/*` responde con el backend real (login, GPS, clientes, etc.).

## Como funciona

- `frontend/` se compila a estatico (`frontend/dist`).
- `api/[...path].js` ejecuta `createApp()` del backend Express. Vercel enruta
  cualquier `/api/...` a esa funcion.
- `vercel.json` ya deja configurado el build, el output y el router por hash.
- La funcion aplica defaults seguros para una demo publica (ver `api/[...path].js`):
  repositorio en memoria (`DATA_DRIVER=memory`, sin SQL Server), auth permisiva
  para navegar y login `admin / 1234` (Fernando Gonzalez), y un secreto JWT
  estable por despliegue. No hay que configurar nada para que arranque.

## Pasos para publicarlo

1. Entra a https://vercel.com/new e importa el repo
   `catalinasaavedrag1/truck-workshop-frontend`.
2. Vercel detecta `vercel.json`. Deja todo por defecto y pulsa **Deploy**.
3. Listo: el sitio queda en `https://<tu-proyecto>.vercel.app` con backend real.

## Variables opcionales (Settings -> Environment Variables)

Solo si quieres mejorar la demo; nada es obligatorio:

- `DSTMS_LAST_POSITION_TOKEN` y `DSTMS_HISTORY_TOKEN`: tokens de DS-TMS para el
  **GPS en vivo** real. Sin ellos, el GPS muestra datos demo etiquetados.
- `JWT_SECRET` (>= 16 caracteres): si prefieres un secreto propio en vez del
  secreto demo derivado del despliegue.
- `DATA_DRIVER=sqlserver` + variables `SQL_*`: solo si conectas una base SQL
  Server real en vez del repositorio en memoria.

Tras cambiar variables, vuelve a desplegar (Deployments -> Redeploy).
