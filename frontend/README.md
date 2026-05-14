# Truck Workshop Frontend

Actualizado: 2026-05-13

Aplicacion web y desktop de Truck Workshop. Vive completa dentro de `frontend/` y consume la API configurada en `VITE_API_BASE_URL`.

## Stack

- React 19 y TypeScript.
- Vite.
- React Router 7.
- Axios.
- CSS Modules.
- Lucide React.
- Electron para escritorio Windows.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
npm run check
npm run desktop:preview
npm run desktop:pack
npm run desktop:dist
```

Desde la raiz tambien puedes usar `npm run dev`, `npm run dev:all`, `npm run build`, `npm run check` y los scripts `desktop:*`.

## Variables de entorno

Copia `.env.example` a `.env`.

```env
VITE_APP_NAME=Truck Workshop
VITE_API_BASE_URL=http://localhost:4000/api
VITE_ALLOW_MOCK_FALLBACK=true
```

`VITE_ALLOW_MOCK_FALLBACK` debe quedar en `false` o sin definir para builds productivos. En desarrollo puede quedar en `true` para navegar con datos demo si la API no esta disponible.

## Estructura

```text
frontend/
  electron/             Main y preload de Electron.
  public/               Logo, favicon e iconos publicos.
  scripts/              Arranque fullstack local.
  src/
    main.tsx            Entrada React.
    App.tsx             RouterProvider.
    router.tsx          Rutas lazy.
    config/             Rutas, navegacion y entorno.
    features/           Modulos de negocio.
    mocks/              Mocks compartidos.
    shared/             Componentes, layout, hooks, servicios, tipos y utils.
    styles/             Reset, tokens y layout global.
```

## Documentacion detallada

- [Indice frontend](../docs/frontend/README.md)
- [Arquitectura](../docs/frontend/overview.md)
- [Rutas](../docs/frontend/routes.md)
- [Datos, layout y UI compartida](../docs/frontend/data-layout.md)
- [Inventario de features](../docs/frontend/features.md)
- [Demo y mantenimiento](../docs/frontend/maintenance.md)

## Reglas rapidas

- Agrega paths en `src/config/routes.ts`.
- Monta paginas en `src/router.tsx`.
- Expone accesos en `src/config/app.config.ts` cuando deban aparecer en menu/contexto.
- Reutiliza `PageHeader`, `FilterBar`, `Table`, `Button`, `Badge`, `Input`, `Select`, `RutInput`, `LoadingState`, `EmptyState` y `ErrorState`.
- Mantiene llamadas HTTP en `shared/services` o `features/<modulo>/services`.
- Usa `features/<modulo>/mocks` solo como fallback de desarrollo controlado por `VITE_ALLOW_MOCK_FALLBACK`.
