# Transformacion UX Operacional

## Objetivo

La plataforma debe dejar de comportarse como un conjunto de pantallas ERP y pasar a funcionar como un sistema operacional conectado: entidades navegables, decisiones visibles, prioridades globales, workflows persistentes y acciones rapidas.

## Auditoria UX Completa

### Problemas criticos detectados

1. **Contexto operacional fragmentado**
   - Las vistas muestran datos correctos, pero cada pantalla compite por explicar su propio contexto.
   - El usuario debe reconstruir mentalmente relaciones entre caso, camion, chofer, OC, SKU, proveedor, documento, flete e incidente.

2. **Velocidad limitada por navegacion tradicional**
   - El sidebar y los listados ayudan a entrar a modulos, pero no bastan para multitasking operacional.
   - Acciones de alta frecuencia dependen demasiado de busqueda manual o navegacion lateral.

3. **Dashboards parcialmente accionables**
   - Varias metricas ya tienen valor operacional, pero no todas aterrizan directamente en una accion o listado filtrado.
   - La prioridad del turno no estaba siempre visible fuera del dashboard.

4. **Workflows fuertes en Taller, pero menos consistentes fuera de Taller**
   - Taller ya esta orientado a caso y etapas.
   - Flota, documentos, compras, clientes, fletes e incidentes necesitaban mas continuidad contextual.

5. **Sistema visual disperso**
   - Hay buenos componentes base, pero faltaban tokens explicitos para interaccion, foco, superficies y estados suaves.
   - Faltaba un patron comun para links operacionales y navegacion relacional.

## Mapa De Fricciones

| Area | Friccion | Impacto | Refactor aplicado |
| --- | --- | --- | --- |
| Navegacion global | Buscar entidades depende de topbar/sidebar | Demora al cambiar de contexto | Paleta de comandos global |
| Prioridad diaria | El foco vive en dashboard, no en toda la app | El usuario pierde alertas al navegar | OperationalFocusBar persistente |
| Entidades relacionadas | Texto muerto en tablas y paneles | Investigacion lenta | EntityLink centralizado |
| KPIs | Algunas metricas decorativas | Baja accionabilidad | MetricCard navegable |
| Tablas | Listados no aterrizan desde URL | Drill-down incompleto | Busqueda por query params |
| Diseño | Tokens limitados | Interacciones inconsistentes | Tokens de estado, foco y motion |

## Arquitectura UX Recomendada

### 1. Navegacion global

- Sidebar: solo macro areas.
- Topbar: busqueda ligera, notificaciones, quick actions.
- CommandPalette: busqueda profunda, acciones rapidas, prioridades y entidades.
- OperationalFocusBar: estado del turno visible en toda la plataforma.

### 2. Contexto de entidad

Cada detalle relevante debe mostrar:

- entidad principal,
- estado,
- prioridad,
- responsable,
- bloqueo,
- relacion con otras entidades,
- siguiente accion,
- historial o timeline.

### 3. Workflow por dominio

- Taller: workflow de caso.
- Fletes: solicitud -> cotizacion -> aprobacion -> asignacion -> transito -> cierre.
- Inventario/compras: demanda -> solicitud -> OC -> recepcion -> entrega.
- Flota/documentos: disponibilidad -> bloqueo -> regularizacion -> liberacion.
- Incidentes: evento -> impacto -> derivacion -> costo -> cierre.

### 4. Acciones separadas de navegacion

- Navegacion: tabs, links, breadcrumbs, command palette.
- Acciones: botones, action bars, bulk actions, quick actions.
- Estado: badges, progress, blockers, SLA.

## Componentes Introducidos O Refactorizados

### `EntityLink`

Patron unico para toda entidad navegable.

- No parece boton pesado.
- Usa hover/focus sutil.
- Mantiene accesibilidad.
- Centraliza rutas por tipo en `entityRoutes`.

### `CommandPalette`

Paleta de comandos global para:

- abrir entidades,
- ejecutar acciones frecuentes,
- saltar entre modulos,
- atender prioridades operacionales.

Atajos:

- `Ctrl/Cmd + Shift + K`
- `/`
- flechas para navegar,
- `Enter` para abrir.

### `OperationalFocusBar`

Barra global de foco que prioriza:

- SLA vencido,
- casos bloqueados por repuestos,
- documentos vencidos/faltantes,
- camiones bloqueados,
- OC pendientes.

### `MetricCard` navegable

Las metricas pueden tener destino (`to`) y funcionar como drill-down.

### `operationalSearch`

Fuente central para:

- busqueda global,
- command palette,
- prioridades,
- entidades operacionales.

## Sistema De Diseño

Tokens agregados:

- estados suaves: danger/warning/success/info soft,
- shadow-lg,
- spacing scale,
- durations,
- easing,
- focus ring.

Reglas:

- focus visible siempre claro,
- hover sutil en entidades,
- componentes densos pero legibles,
- radios maximos controlados,
- acciones principales visibles,
- badges como estado, no como botones.

## Refactor Aplicado En Vistas Criticas

### Taller

- Caso, camion, chofer, mecanico, cliente, SKU y OC conectados.
- El detalle mantiene contexto de caso y relaciones.
- Repuestos y compras navegan directo a su entidad.

### Inventario y compras

- SKU, ubicacion, OC, solicitud y caso conectados.
- KPIs de inventario navegan a vistas accionables.
- Detalle SKU muestra demanda y OC relacionadas como red operacional.

### Flota

- Camion, chofer, documentos, costos, incidentes y fletes conectados.
- Timeline de camion abre entidades relacionadas cuando existe ruta.
- Health Score permite saltar desde tarjetas y tabla.

### Choferes

- Chofer y unidad asignada conectados.
- KPIs principales navegan a vistas relacionadas.

### Fletes y clientes

- Solicitud, cotizacion y cliente conectados.
- Detalle cliente muestra solicitudes y cotizaciones navegables.

### Incidentes

- Incidente, camion, chofer, flete, caso taller, documentos y costos conectados.
- Panel de detalle evita texto muerto en contexto critico.

### Reportes

- Camiones, documentos, fletes y choferes en reportes son navegables.
- Los reportes pasan de lectura estatica a investigacion operacional.

## Validacion UX

- El usuario ve el foco operacional sin entrar al dashboard.
- Puede abrir una entidad o accion desde cualquier vista.
- Las relaciones clave ya no quedan como texto plano.
- Los KPIs principales permiten drill-down.
- Hay una sola fuente de busqueda operacional.
- La navegacion mantiene orientacion y reduce retorno manual.

## Siguientes Iteraciones Recomendadas

1. Quick preview drawer para `EntityLink`.
2. Bulk actions en tablas de casos, OC, documentos e incidentes.
3. Inline edit para prioridad, responsable, estado y fechas.
4. Filtros persistentes por modulo.
5. Activity feed global por usuario/turno.
6. Dependency map para caso -> SKU -> OC -> proveedor -> recepcion.
7. Autosave/drafts en formularios largos.
8. Split view en listados grandes: tabla izquierda, detalle derecho.
