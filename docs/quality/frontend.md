# Calidad frontend

Actualizado: 2026-05-13

## Patrones correctos

- Rutas lazy en `router.tsx`.
- Paths centralizados en `routes.ts`.
- Navegacion centralizada en `app.config.ts`.
- Features separadas por dominio.
- Componentes compartidos para tabla, filtros, botones, badges, inputs, modales, estados de carga/error/vacio y RUT.
- Cliente Axios centralizado con `X-Request-Id`.
- Hooks genericos para CRUD simple.
- Servicios de feature para flujos especificos.
- CSS Modules para estilos locales.
- Tokens globales en `styles/variables.css`.
- Menu lateral con barra compacta, submenus expandibles, busqueda y usuario fijo.
- Topbar con busqueda global, atajos y notificaciones.

## Riesgos

- Varios modulos aun usan mocks directos para enriquecer datos relacionados. Sirve en demo, pero puede desalinearse con SQL real.
- `resourceApi` puede caer a mocks sin que el usuario final lo note.
- Algunas paginas concentran consulta, transformacion y render; cuando crecen conviene extraer `utils`.
- No hay cobertura E2E suficiente para flujos de alto valor.
- Algunas rutas legacy conviven con rutas maestras nuevas, por ejemplo `trucks` y `fleet/trucks`.

## Reglas recomendadas

- Usar `PageHeader`, `FilterBar`, `Table`, `LoadingState`, `EmptyState` y `ErrorState` antes de crear variantes nuevas.
- Mantener filtros compactos y con busqueda principal dominante.
- Usar botones icon-only para acciones repetitivas de bajo texto, como limpiar filtros, si hay poco espacio.
- Usar `RutInput` para cualquier campo RUT.
- Mantener acciones primarias visibles arriba o en sticky footer.
- Dejar acciones poco frecuentes en botones secundarios, paneles contraibles o modales.
- No crear submenus por fuera del sidebar compartido; agregar padres/children a `app.config.ts`.
- Si un modulo tiene escritura o reglas, crear `features/<modulo>/services`.
- Mantener mocks como fallback, no como fuente principal de negocio.
- Ejecutar `npm run check` y `npm run build`.

## Checklist visual operativo

- La vista explica que se hace en menos de 5 segundos.
- El primer bloque muestra contexto o accion principal.
- Los filtros no parecen formulario administrativo.
- La tabla/listado permite escaneo rapido.
- Las severidades/estados tienen jerarquia visual.
- Las acciones destructivas estan protegidas.
- La vista responde bien en desktop, tablet y mobile.
- No hay espacios vacios dominantes sin informacion util.

## Componentes compartidos que se deben preferir

- `Button`
- `Badge`
- `Input`
- `RutInput`
- `Select`
- `FilterBar`
- `Table`
- `PageHeader`
- `SectionHeader`
- `MetricCard`
- `LoadingState`
- `EmptyState`
- `ErrorState`
- `Modal`
