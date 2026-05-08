# Auditoria UX Operacional

Fecha: 2026-05-07

## Diagnostico integral

La plataforma cubre una operacion de transporte y taller con usuarios de alta frecuencia: operadores, taller, bodega, compras, administracion, supervision y gerencia. La arquitectura frontend esta separada por features, con componentes compartidos para headers, tablas, filtros, badges, estados, layout, sidebar y topbar. Ese punto de partida es bueno, pero la experiencia quedaba muy dependiente de cada modulo y eso generaba saltos entre vistas.

Problemas detectados:

- Navegacion: el sidebar agrupaba modulos, pero varias rutas hijas reales no estaban expuestas como contexto operativo. El usuario podia entrar a crear o revisar subflujos sin ver claramente donde estaba.
- Jerarquia visual: habia headers compactados recientemente, pero faltaba una capa persistente de contexto entre topbar y contenido para no repetir breadcrumbs por pagina.
- Filtros y datos: la tabla compartida ya soporta busqueda, ordenamiento, paginacion, estados de carga y scroll horizontal. La oportunidad principal era volver esos patrones mas visibles y consistentes por navegacion, no reimplementar tablas por modulo.
- Acciones: el topbar ya expone atajos globales, pero algunos botones icon-only podian renderizar un span vacio y sumar ruido invisible de layout.
- Escalabilidad: appConfig era el eje correcto de navegacion, pero no modelaba todos los subflujos operativos principales.

## Decisiones UX aplicadas

- Se agrego una barra de contexto operacional reutilizable debajo del topbar.
- Se amplio la taxonomia de navegacion en appConfig con rutas hijas para flujos frecuentes: crear caso, nueva solicitud de flete, nuevo camion, nuevo chofer, bodega, combustible, ordenes de compra, proveedores, incidentes y mantenimiento preventivo.
- Se ajusto el sidebar para que solo el subitem mas especifico quede activo. Esto evita que "Listado" y "Nuevo" aparezcan activos al mismo tiempo.
- Se dejo la scrollbar invisible del menu lateral sin romper scroll, con `overflow-y: auto`, `scrollbar-width: none`, `-ms-overflow-style: none` y `::-webkit-scrollbar`.
- Se corrigio el boton base para que los botones de solo icono no generen texto vacio ni ancho innecesario.

## Patron resultante

La lectura superior queda organizada asi:

1. Topbar: busqueda global, usuario, atajos principales y acciones secundarias agrupadas.
2. ContextBar: modulo actual, grupo operacional y vistas hermanas.
3. PageHeader: objetivo de la vista y acciones especificas.
4. FilterBar o tabla: operacion directa sobre datos.

Este patron reduce perdida de contexto, acelera saltos entre subflujos y mantiene cada modulo dentro del mismo ecosistema visual sin tocar backend.

## Plan progresivo recomendado

- Normalizar todas las vistas de datos para que usen `Table` con busqueda, sort y paginacion cuando el volumen lo amerite.
- Usar `FilterBar` como unico patron de filtros visibles y filtros avanzados.
- Evitar cards para listados operativos; preferir tabla, lista densa, timeline o kanban segun la tarea.
- Mantener acciones primarias en `PageHeader` y acciones secundarias en menus o tabs contextuales.
- Crear formularios por secciones cortas con feedback inmediato y estados de error claros.
