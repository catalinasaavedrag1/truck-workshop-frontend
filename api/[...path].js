// Serverless entry para Vercel: corre el backend Express (createApp) como
// funcion. Asi el frontend estatico y la API viven en el mismo dominio y
// /api/* responde con el backend real, sin necesidad de un host externo.
//
// Defaults seguros para una demo publica (solo si NO vienen ya definidos como
// env vars en Vercel, de modo que el dashboard siempre puede sobrescribirlos):
//   - DATA_DRIVER=memory          -> repositorio en memoria (sin SQL Server)
//   - ALLOW_INSECURE_JWT=true     -> secreto JWT estable por despliegue
//   - AUTH_* permisivo            -> demo navegable + login admin/1234
// Los tokens DS-TMS (GPS en vivo) se configuran como env vars en el dashboard.
const SERVERLESS_DEFAULTS = {
  ALLOW_INSECURE_JWT: 'true',
  AUTH_ALLOW_DEVELOPMENT_LOGIN: 'true',
  AUTH_ENFORCE_PERMISSIONS: 'false',
  AUTH_REQUIRED: 'false',
  DATA_DRIVER: 'memory',
}

function applyServerlessDefaults() {
  for (const [key, value] of Object.entries(SERVERLESS_DEFAULTS)) {
    if (process.env[key] === undefined || process.env[key] === '') {
      process.env[key] = value
    }
  }
}

// La app se crea una sola vez y se reutiliza entre invocaciones (warm starts).
// Se usa import dinamico para poder fijar los defaults ANTES de que el modulo
// de configuracion del backend lea process.env.
let cachedApp

async function getApp() {
  if (!cachedApp) {
    applyServerlessDefaults()
    const { createApp } = await import('../backend/src/app.js')
    cachedApp = createApp()
  }

  return cachedApp
}

export default async function handler(request, response) {
  // Express maneja el ciclo request/response; las rutas estan montadas bajo
  // /api, que es exactamente el path con el que Vercel invoca esta funcion.
  const app = await getApp()
  return app(request, response)
}
