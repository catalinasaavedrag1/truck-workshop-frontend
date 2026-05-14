# Frontend - demo y mantenimiento

Actualizado: 2026-05-13

## Modo demo y mocks

El frontend mantiene datos mock para que la plataforma sea navegable aunque el backend no este disponible.

Ubicaciones:

- `frontend/src/mocks`: datos compartidos historicos, como casos, dashboard, mecanicos, partes y camiones.
- `frontend/src/features/*/mocks`: datos propios del dominio.

Patron actual:

1. La vista intenta consumir API.
2. Si el backend falla y `VITE_ALLOW_MOCK_FALLBACK=true`, se muestran mocks.
3. El usuario puede seguir revisando flujos locales.

Este comportamiento es util para desarrollo; en produccion debe quedar desactivado para no ocultar errores de API o SQL.

## Agregar una pantalla nueva

1. Definir el objetivo operacional de la vista.
2. Crear o actualizar tipos en `frontend/src/features/<modulo>/types`.
3. Crear mocks si la vista debe funcionar sin backend.
4. Crear servicio en `features/<modulo>/services` si hay escritura o endpoint especializado.
5. Usar `useResourceList` o `useResourceItem` para lecturas CRUD simples.
6. Crear componentes locales en `features/<modulo>/components`.
7. Crear pagina en `features/<modulo>/pages`.
8. Agregar path en `frontend/src/config/routes.ts`.
9. Agregar lazy import y route en `frontend/src/router.tsx`.
10. Agregar item en `frontend/src/config/app.config.ts` si debe aparecer en menu/contexto.
11. Reutilizar componentes compartidos.
12. Ejecutar `npm run check` y `npm run build`.

## Agregar o ajustar navegacion

La navegacion visual sale de `app.config.ts`.

Reglas:

- Usar `children` para agrupar logicamente accesos bajo un modulo padre.
- El sidebar muestra esos `children` como submenus expandibles.
- La busqueda del sidebar aplana los `children` visibles para saltos rapidos.
- Cada `child` debe tener `label`, `path`, `icon` y `section`.
- Usar `showInSidebar=false` para rutas secundarias que existen pero no deben verse como acceso directo.
- Evitar accesos duplicados al mismo path.
- No agregar rutas de detalle como item de menu salvo que el usuario deba entrar directamente.
- Acciones frecuentes pueden ir en `quickActions.config.ts`.

## Agregar un endpoint consumido por frontend

1. Confirmar si existe recurso CRUD en backend.
2. Si es CRUD simple, consumir con `resourceApi` o hooks compartidos.
3. Si tiene flujo, crear servicio de feature.
4. Mantener `VITE_API_BASE_URL` como unica base.
5. No hardcodear `/api` dentro de componentes.
6. Manejar loading, error y empty state.
7. Mantener `X-Request-Id` desde `httpClient`.

## Formularios

Reglas:

- Formularios grandes deben partirse en bloques logicos.
- Las acciones principales deben estar visibles arriba o en sticky footer.
- Selects deben usar entidades reales cuando exista relacion.
- RUT debe usar `RutInput`.
- Estados, severidades y prioridades deben usar tratamiento visual, no solo selects planos.
- Evitar que acciones poco frecuentes ocupen espacios dominantes.

## Listados y filtros

Reglas:

- Usar `Table` para listados con mas de unos pocos registros.
- Usar `FilterBar` para filtros visibles.
- La busqueda principal debe ser dominante.
- Filtros secundarios deben ser compactos.
- El boton de limpiar filtros debe ser icon-only cuando el espacio sea critico.
- Mostrar chips de filtros activos si el contexto lo permite.
- Mantener acciones mas importantes visibles y secundarias menos pesadas.

## Modulos operacionales

Patrones que ya existen y deben mantenerse:

- Inventario: acciones de creacion contraidas cuando no son tareas frecuentes.
- Incidencias: tipo de incidencia y severidad con jerarquia fuerte.
- Diagnostico: contexto del caso, stepper, checklist y acciones persistentes.
- Sidebar: barra compacta, submenus expandibles, busqueda plana y usuario fijo.
- Rentabilidad fletes: margen, costo/km y decision operacional por fila.
- RUT: formato progresivo en clientes, choferes y proveedores.

## Validacion local

```bash
npm run lint
npm run typecheck
npm run check
npm run build
```

Desde la raiz:

```bash
npm run check
npm run build
```

## Buenas practicas

- No duplicar componentes compartidos.
- No mezclar demasiada logica de calculo en la pagina si se puede mover a `utils`.
- No hacer imports directos de mocks cuando ya exista endpoint real, salvo fallback controlado.
- Mantener CSS local en `*.module.css`.
- Mantener tokens y patrones globales en `styles/variables.css` y `styles/layout.css`.
- Usar iconos Lucide para botones icon-only.
- Mantener copy de UI corto, operativo y orientado a accion.
