# Frontend - arquitectura

Actualizado: 2026-05-14

El frontend de Truck Workshop vive completo en `frontend/`. Es una aplicacion React/TypeScript optimizada para operacion logistica y taller: muchas vistas de datos, flujos rapidos, contexto persistente, busqueda y componentes compartidos.

## Stack

- React 19.
- TypeScript.
- Vite.
- React Router 7.
- Axios.
- CSS Modules.
- Lucide React.
- Electron para empaquetado desktop.

## Estructura real

```text
frontend/
  .env.example
  electron/
    main.cjs
    preload.cjs
  public/
    favicon.svg
    icons.svg
    logo.svg
  scripts/
    dev-fullstack.js
  src/
    main.tsx
    App.tsx
    router.tsx
    config/
      app.config.ts
      env.ts
      routes.ts
    features/
      <modulo>/
        pages/
        components/
        services/
        hooks/
        types/
        mocks/
        constants/
        utils/
    mocks/
    shared/
      components/
      hooks/
      layout/
      navigation/
      services/
      shortcuts/
      types/
      utils/
    styles/
      globals.css
      layout.css
      reset.css
      variables.css
```

## Entrypoints

| Archivo | Responsabilidad |
|---|---|
| `src/main.tsx` | Renderiza `<App />` y carga estilos globales. |
| `src/App.tsx` | Expone `RouterProvider`. |
| `src/router.tsx` | Declara lazy imports, rutas y `MainLayout`. Usa `createHashRouter` si corre desde `file:` para Electron. |
| `src/config/routes.ts` | Fuente unica de paths publicos y helpers con parametros. |
| `src/config/app.config.ts` | Define taxonomia operacional de navegacion: grupos, modulos padre, accesos y secciones. |
| `src/config/env.ts` | Lee `VITE_APP_NAME` y `VITE_API_BASE_URL`. |

## Modelo de aplicacion

1. `main.tsx` monta React.
2. `App.tsx` carga el router.
3. `router.tsx` separa `/login` del resto de la app.
4. Las rutas privadas visualmente entran a `MainLayout`.
5. `MainLayout` renderiza `Sidebar`, `Topbar`, `ContextBar`, contenido y ayuda de atajos.
6. Cada pagina vive en `features/<modulo>/pages`.
7. Los datos llegan por servicios/hook compartidos o por servicios de feature.

## Organizacion por dominio

Cada feature intenta agrupar todo lo necesario para un modulo:

```text
features/incidents/
  pages/          Vistas enrutables.
  components/     Formulario, tabla, badges, timeline.
  constants/      Estados, severidades, labels.
  mocks/          Datos demo/fallback.
  types/          Tipos TypeScript del dominio.
```

Regla practica:

- Si se reutiliza en toda la app, va en `shared/`.
- Si pertenece a un modulo, va dentro de `features/<modulo>/`.
- Si toca backend, va en `services/`.
- Si calcula presentacion o negocio local, va en `utils/`.

## Navegacion

La navegacion se declara en `app.config.ts` como arbol operacional. Los grupos actuales son `Inicio`, `Operacion taller`, `Flota y logistica`, `Clientes y comercial`, `Abastecimiento`, `Finanzas y control` y `Administracion`.

Items padre actuales:

- `Dashboard operativo`.
- `Taller`.
- `Flota`.
- `Logistica`.
- `Clientes`.
- `Compras y abastecimiento`.
- `Finanzas`.
- `Configuracion`.

- En desktop fijo/colapsado: barra compacta con iconos de los padres y usuario fijo abajo.
- En panel abierto: arbol con submenus expandibles y children agrupados por `section`.
- En busqueda activa: resultados planos sobre los hijos visibles, buscando por etiqueta, padre y seccion.
- La ruta activa expande automaticamente el grupo correspondiente y marca el path mas especifico.
- `showInSidebar=false` oculta rutas secundarias como formularios de creacion sin eliminarlas del router.
- `shared/navigation/navigationContext.ts` centraliza breadcrumbs y vistas relacionadas para `PageHeader` y `ContextBar`.

Esto permite mantener submenus visibles para areas densas como Compras y, al mismo tiempo, saltar rapido mediante busqueda.

## Layout operacional

El shell se compone asi:

1. `Sidebar`: navegacion unica, busqueda de menu y usuario fijo.
2. `Topbar`: busqueda global, atajos rapidos, notificaciones y ayuda de teclado.
3. `ContextBar`: modulo actual, grupo operacional y accesos relacionados.
4. `PageHeader`: breadcrumbs, titulo, descripcion, estado, metadata, acciones y hints de atajos.
5. Contenido: tablas, filtros, paneles, formularios o dashboards del modulo.

## Desktop/Electron

Vite usa `base: './'` para que el build funcione empaquetado. Electron se controla con:

- `npm run desktop:preview`
- `npm run desktop:pack`
- `npm run desktop:dist`

El build web se genera en `frontend/dist` y los paquetes desktop en `frontend/release`.
