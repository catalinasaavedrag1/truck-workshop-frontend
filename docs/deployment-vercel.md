# Despliegue Frontend En Vercel

El frontend no debe llamar a `http://localhost:4000/api` en produccion. En Vercel, `localhost` es el navegador o la funcion serverless, no el backend local del desarrollador.

## Variables En Vercel

Configurar en el proyecto frontend de Vercel:

```env
BACKEND_URL=https://URL-PUBLICA-DEL-BACKEND/api
VITE_ALLOW_MOCK_FALLBACK=false
```

`VITE_API_BASE_URL` puede omitirse. Si se omite, el frontend usa `/api` y el proxy serverless de Vercel reenvia al backend definido por `BACKEND_URL`.

## Prueba Rapida

Antes de probar login, esta URL debe responder desde el navegador:

```txt
https://truck-workshop-frontend.vercel.app/api/health
```

Si responde `BACKEND_URL no configurado en Vercel`, falta la variable `BACKEND_URL`.

Si responde `No se pudo conectar con el backend publico`, la URL del backend no existe, no es publica o el backend esta caido.

## Backend

El backend debe estar desplegado en una URL publica HTTPS y debe tener acceso a una base de datos valida. `SQL_SERVER=.\CATA` solo funciona en el computador local.

Si el frontend llama directo al backend sin proxy, agregar los dominios Vercel al backend:

```env
CORS_ORIGIN=https://truck-workshop-frontend.vercel.app,https://truck-workshop-frontend-dgt6dvpg8-yoni1999s-projects-dd0bbbdd.vercel.app
```
