# Auditoria UX operacional

Actualizado: 2026-05-14

## Objetivo

La plataforma debe sentirse como una herramienta operacional moderna para taller, flota, logistica, compras y finanzas. El usuario debe entender rapido donde esta, que entidad esta operando, que estado tiene y cual es el siguiente paso.

El foco no es decorar pantallas. El foco es reducir carga cognitiva, separar navegacion de acciones, sostener contexto y hacer que cada vista tenga una tarea dominante.

## Inventario revisado

Se revisaron las rutas, layouts, navegacion, componentes compartidos, stores/hooks de recursos y paginas ruteadas del frontend. El proyecto tiene 78 vistas principales bajo `frontend/src/features`, con estos patrones transversales:

- `PageHeader` aparece en casi todas las vistas y define la jerarquia inicial.
- `Table` y `FilterBar` sostienen la mayoria de listados operativos.
- Hay workflows explicitos en taller, fletes y neumaticos.
- Inventario y neumaticos usan navegaciones internas tipo tabs que deben leerse como subnavegacion de modulo, no como etapas.
- Taller ya debe operar desde el caso y su workflow, no desde submodulos redundantes.
- Varias pantallas de creacion siguen usando formularios largos con panel lateral de guia.
- Algunas bandejas globales siguen siendo necesarias, pero no deben competir con el flujo principal.

## Principios aplicados

- Sidebar: navegacion macro y entrada a areas principales.
- Header: contexto de la pantalla o entidad, con accion primaria clara.
- Workflow: solo para procesos con etapas reales.
- Tabs internos: solo herramientas contextuales de una etapa o vista.
- Acciones: botones, footer sticky o menu contextual, nunca tabs.
- Tablas: primera columna como entidad + contexto, estados claros y densidad escaneable.
- Formularios: bloques logicos, accion persistente y ayuda solo donde evita errores.
- Dashboards: foco operacional y siguiente accion, no coleccion de metricas decorativas.

## Cambios aplicados en esta iteracion

- Se agrego `showInSidebar` a la configuracion de navegacion para conservar rutas, busqueda y contexto sin mostrar acciones/subflujos en el arbol lateral.
- El sidebar ahora puede ocultar rutas como "Nuevo camion", "Ingreso neumaticos", "Nueva OC", "Checklist salida" o "Nuevo incidente" sin romper accesos directos ni rutas existentes.
- Los contadores del sidebar muestran solo los accesos visibles para que el menu no parezca un ERP infinito.
- La accion primaria del caso de taller ya no saca al usuario del caso para diagnosticar; activa la etapa `Diagnostico` dentro del workflow del caso.
- `PageHeader` separa mejor contexto y acciones principales en todas las vistas que usan el primitivo.
- Las subnavegaciones internas tipo `module-tabs`/inventario se redujeron visualmente para no competir con workflows ni botones.
- Inventario mantiene una fila contextual (`Centro inventario`, `SKUs`, `Stock fisico`, `Ubicaciones`, `Encargados`, `Compras`, `Proveedores`, `Reporte`) y el sidebar expone los accesos principales dentro del submenu `Compras`.
- Las capturas de neumaticos (`Ingreso`, `Instalar`, `Retirar`) dejaron de ser tabs; quedan como acciones desde el header/flujo y las tabs se reservan para vistas de consulta.

## Hallazgos transversales

### Navegacion

Diagnostico: el sidebar tenia demasiadas entradas que eran acciones o subflujos. Eso mezclaba navegacion global con herramientas contextuales.

Objetivo: que el sidebar responda "a que area voy" y que cada modulo resuelva sus subflujos dentro de su propia pantalla.

Reorganizacion: mantener visibles solo hubs y bandejas principales; dejar creaciones, subacciones y pantallas de captura como acciones desde headers, workflows o cards de siguiente paso.

Componentes: `WorkshopSidebar`, `ContextHeader`, `ModuleSubnav`, `QuickActions`.

Validacion: el menu lateral debe escanearse como areas de trabajo, no como arbol de configuracion.

Regla aplicada: no debe existir mas de una fila de tabs para el mismo nivel de navegacion. Si cambia vista, puede ser tab. Si crea, guarda, aprueba, exporta, modifica o ejecuta una operacion, debe ser accion.

### Headers

Diagnostico: muchas vistas usan `PageHeader` para titulo y descripcion, pero el header no siempre separa contexto, accion primaria y herramientas secundarias.

Objetivo: que el usuario entienda la tarea de la vista en menos de 5 segundos.

Reorganizacion: headers de listados deben mostrar tarea + accion primaria; headers de detalle deben mostrar entidad + estado + responsable + siguiente paso.

Componentes: `ContextHeader`, `EntityHeader`, `CaseContextHeader`, `ActionBar`.

Validacion: no debe haber badges, botones y tabs compitiendo en el mismo nivel.

### Workflows

Diagnostico: taller, fletes y neumaticos tienen workflows, pero con estilos y ubicacion distintos. Diagnostico tecnico tenia un stepper propio que duplicaba el flujo del caso.

Objetivo: que cada proceso tenga una sola representacion dominante de avance.

Reorganizacion: taller vive dentro del caso; flete puede evolucionar a layout de caso logistico; neumaticos debe separar flujo de lifecycle de accesos de captura.

Componentes: `WorkflowStepper`, `StageTabs`, `StageActionBar`, `StickyActions`.

Validacion: una etapa no debe aparecer como sidebar, tab global y boton a la vez.

### Tablas y filtros

Diagnostico: las tablas son funcionales, pero algunas pantallas muestran metricas, filtros, cards y tabla sin una prioridad clara.

Objetivo: que el listado sea una cola de trabajo, no un reporte plano.

Reorganizacion: filtros compactos arriba, chips activos visibles, tabla con entidad/contexto/estado/accion, y resumen solo cuando ayuda a priorizar.

Componentes: `SmartTable`, `FilterBar`, `StatusBadge`, `PriorityBadge`, `EmptyState`.

Validacion: el usuario debe saber que fila atender primero.

### Formularios

Diagnostico: formularios de altas y registros son correctos, pero algunos siguen sintiendose como carga administrativa.

Objetivo: formularios orientados a completar una tarea real con menor error.

Reorganizacion: datos criticos primero, bloques plegables si hay informacion secundaria, accion sticky y panel lateral con criterios de decision.

Componentes: `FormSection`, `StickyActions`, `SummaryPanel`, `ValidationHint`.

Validacion: el usuario debe poder guardar sin volver al inicio de la pantalla.

## Auditoria por vista

| Vista | Tarea real | Friccion detectada | Reorganizacion recomendada |
|---|---|---|---|
| Login | Entrar rapido al sistema | Correcta; debe mantener bajo ruido visual | Mantener formulario centrado, errores claros y acceso directo al dashboard operativo |
| Dashboard operativo | Saber que atender primero | Puede competir entre foco, acciones y metricas | Mantener una prioridad principal, 3 accesos operativos y metricas solo accionables |
| Casos de taller | Gestionar cola de casos | Listado correcto; depende de filtros y prioridad | Reforzar como bandeja operacional con accion `Nuevo caso` y filas priorizadas por SLA |
| Crear caso taller | Capturar ingreso sin errores | Formulario largo si se usa bajo presion | Agrupar origen, camion, falla, prioridad y evidencia; sticky submit |
| Detalle caso taller | Avanzar por workflow del caso | Resuelto en gran parte; evitar salidas a submodulos | Mantener contexto, workflow unico, tabs por etapa y accion de siguiente paso |
| Diagnostico standalone | Registrar diagnostico tecnico | Duplicaba stepper del caso | Usarlo como deep-link tecnico; ruta principal debe ser etapa Diagnostico del caso |
| Solucion reparacion | Definir repuestos, horas y aprobacion | Es una etapa, no modulo principal | Integrarla como herramienta de Cotizacion/Reparacion dentro del caso |
| Asignaciones taller | Asignar mecanicos y balancear carga | Correcta como tablero, pero debe sentirse recurso operativo | Mantener board, capacidad visible y modal solo para asignar |
| Mecanicos | Gestionar equipo taller | Mezcla listado y creacion modal | Mantener listado como capacidad; creacion secundaria |
| Especialidades mecanicos | Mantener skills del equipo | Es configuracion secundaria | Acceso desde mecanicos, no sidebar principal |
| Detalle mecanico | Ver disponibilidad, casos y rendimiento | Correcta como ficha operacional | Header con mecanico, disponibilidad, carga y proxima asignacion |
| Agenda taller | Planificar estaciones y cola | Alto valor operacional | Mantener timeline dominante, filtros compactos y planificacion por modal |
| Estaciones taller | Ver capacidad fisica del taller | Puede parecer catalogo | Enfocarla en ocupacion, bloqueo y proxima liberacion |
| Aprobaciones | Resolver decisiones pendientes | Bandeja global util pero no etapa principal | Mantener como inbox global, con prioridad y SLA de decision |
| Cotizaciones taller | Revisar cotizaciones | No debe competir con etapa Cotizacion del caso | Usarla como bandeja global; detalle debe enlazar claramente al caso |
| Detalle cotizacion taller | Aprobar/enviar/rechazar cotizacion | Acciones viven en tarjeta lateral, no header | ContextHeader con caso, total, estado y accion primaria |
| Mano de obra | Revisar horas/tareas | Es herramienta de reparacion mas que modulo | Mantener como bandeja global de horas, enlazada desde caso |
| Checklists diagnostico | Administrar/checklist tecnico | Puede confundirse con diagnostico | Enfocar como biblioteca + ejecucion contextual desde caso |
| Centro de flota | Estado de flota completa | Buen hub; riesgo de exceso de metricas | Priorizar disponibilidad, bloqueos y proximos eventos |
| Ficha camiones flota | Maestro de unidades | Correcto como inventario operativo | Tabla con estado, responsable, disponibilidad y links a documentos/costos |
| Detalle camion flota | Entender salud de una unidad | Debe conectar taller, costos, documentos y rutas | Header con patente, estado, health score y proxima accion |
| Disponibilidad flota | Saber que camion puede operar | Pantalla de alta utilidad | Mantener board y causa de no disponibilidad |
| Health Score | Priorizar riesgo mecanico/operacional | Puede parecer reporte | Convertirlo en cola de riesgo con accion por camion |
| Taller camiones | Seguimiento de unidades en taller | Duplica parcialmente flota/taller | Mantener como vista filtrada de unidades con accion a caso taller |
| Crear camion | Alta de unidad | Panel guia ayuda; accion debe quedar persistente | Sticky submit y validaciones de patente/VIN visibles |
| Detalle camion taller | Historial y mantenimiento de unidad | Puede duplicar detalle flota | Definir si es ficha tecnica taller o redirigir a ficha flota |
| Choferes | Gestionar choferes | Correcta, pero compliance debe destacarse | Tabla con licencia, disponibilidad y alertas |
| Crear chofer | Alta de conductor | Formulario administrativo | Bloques: identidad, licencia, contacto, compliance |
| Detalle chofer | Ver compliance y casos | Correcta como ficha | Header con estado, licencia, vencimientos y proximo bloqueo |
| Compras y abastecimiento | Decidir que comprar y destrabar operaciones por repuestos | Buen hub; debe mantener subnav como flujo operativo de decision, ejecucion y auditoria | Mantener bloqueos, reposicion sugerida, OC atrasadas, recepcion y stock critico como protagonistas |
| SKUs/repuestos | Buscar y mantener repuestos | Editor inline reduce modalidad | Priorizar busqueda, stock, demanda activa y accion secundaria de editar |
| Detalle repuesto | Ver stock, demanda y compras | Debe conectar casos bloqueados | Header con SKU, stock disponible, minimo y siguiente compra |
| Stock fisico | Validar existencias | Correcto como inventario operativo | Tabla por ubicacion, estado y accion de ajuste |
| Ubicaciones bodega | Mantener ubicaciones | Configuracion secundaria | Acceso desde submenu Compras y abastecimiento |
| Compradores / responsables | Ver responsables | Equipo/compras secundaria | Acceso desde submenu Compras y abastecimiento |
| Compras inventario | Gestionar OCs | Correcta como cola de compras | Mostrar estado, proveedor, entrega esperada y casos desbloqueados |
| Crear OC | Emitir compra | Debe originarse desde demanda o stock | Formulario con resumen de repuestos y proveedor sugerido |
| Detalle OC | Seguir compra/recepcion | Debe dejar claro si desbloquea casos | Header con proveedor, estado, entrega, monto y recepcion |
| Proveedores | Gestionar red de compra | Correcta, pero debe priorizar confiabilidad | Tabla con rating, lead time y categorias |
| Crear proveedor | Alta proveedor | Secundaria | Wizard corto o formulario por bloques |
| Detalle proveedor | Evaluar proveedor | Debe conectar OCs, tiempos y categorias | Header con rating, estado, lead time y compras abiertas |
| Solicitudes de flete | Ingresar/cotizar solicitudes | Buena bandeja | Reforzar como cola TMS con estado, retiro y cliente |
| Nueva solicitud flete | Crear solicitud | Flujo tiene stepper de inicio | Mantener contexto de cliente/ruta/carga y accion sticky |
| Detalle solicitud flete | Avanzar solicitud a cotizacion/asignacion | Tiene workflow propio, pero header podria ser mas contextual | Evolucionar a layout tipo caso logistico con resumen lateral |
| Cotizaciones flete | Revisar propuestas | Bandeja global | Mantener como inbox comercial, no duplicar flujo |
| Detalle cotizacion flete | Enviar/aprobar cotizacion | Debe mostrar cliente, total, validez y proximo paso | Header contextual y accion primaria arriba |
| Asignacion flete | Despachar camion/chofer | Alta utilidad operacional | Mantener panel de capacidad, conflictos y asignacion |
| Planillas choferes | Gestionar liquidacion/viaje | Puede parecer administrativo | Enfocar por viaje, estado de entrega y pendientes |
| Rentabilidad fletes | Decidir margen y tarifa | Buen reporte operativo | Mantener foco en margen, costo/km y rutas con decision |
| Costos por camion | Control financiero de unidades | Reporte util | Priorizar desvio, costo/km y unidades fuera de umbral |
| Detalle costo camion | Analizar costos de una unidad | Debe conectar taller, combustible e incidentes | Header con patente, periodo, costo/km y desvio |
| Combustible | Registrar/controlar cargas | Correcta, pero metricas antes de tabla pueden saturar | Mantener alerta de precio, eficiencia y tabla reciente |
| Nueva carga combustible | Capturar carga | Formulario operacional | Sticky submit, lectura de odometro y evidencia |
| Reporte combustible | Analizar rendimiento | Puede ser reporte denso | Filtros por periodo/camion y ranking de desviaciones |
| Reporte inventario | Analizar inventario | Es financiero/operativo | Enlazar desde inventario y finanzas, no como accion primaria de sidebar |
| Reportes operativos | Acceder a analitica | Puede transformarse en catalogo | Agrupar por decision: taller, flota, compras, finanzas |
| Rendimiento choferes | Evaluar performance | Denso si no se orienta a accion | Ranking con causa y accion de coaching/documentacion |
| Documentos camion | Control vencimientos | Alta utilidad | Mantener cola por vencimiento, entidad y responsable |
| Detalle documento | Resolver documento | Debe mostrar vencimiento y bloqueo | Header con estado, entidad, vencimiento y accion |
| Checklists viaje | Ver control salida/llegada | Correcto como hub | Mostrar viajes pendientes y excepciones |
| Checklist salida | Registrar salida | Es captura, no menu principal | Formulario de patio con accion sticky y evidencia |
| Checklist llegada | Registrar retorno | Es captura, no menu principal | Formulario con incidencias, km y evidencia |
| Rendimiento neumaticos | Medir ciclo de vida | Tiene muchas acciones visibles | Separar flujo, tablero de lifecycle y acciones como shortcuts secundarios |
| Ingreso neumaticos | Crear stock de neumaticos | Accion de flujo | Debe abrirse desde rendimiento/compra recibida |
| Instalacion neumaticos | Asociar neumatico a camion | Accion de flujo | Contexto: stock disponible, camion, posicion, km inicial |
| Retiro neumaticos | Cerrar ciclo | Accion critica | Contexto: km final, motivo, estado resultante |
| Comparacion neumaticos | Decidir proveedor/tipo | Reporte de decision | Mostrar solo ciclos completos y brechas de datos |
| Telematria/GPS | Ver ubicacion y alertas | Operacional | Mantener mapa + tabla, con alertas no decorativas |
| Incidentes | Gestionar eventos operacionales | Buena bandeja | Priorizar severidad, camion, chofer y derivacion |
| Crear incidente | Registrar evento bajo presion | Debe ser rapido | Tipo, severidad, entidad, impacto y derivacion a taller |
| Detalle incidente | Resolver impacto y trazabilidad | Bien conectado a modulos | Mantener proxima accion y links a taller/flota/documentos/costos |
| Comunicaciones | Gestionar conversaciones | Muy potente pero densa | Dividir mentalmente inbox, conversacion y configuracion; modales secundarios |
| Notificaciones | Priorizar alertas del sistema | Puede convertirse en lista ruidosa | Agrupar por urgencia y entidad; acciones de resolver/silenciar |
| Permisos | Administrar roles | Administrativo inevitable | Mantener matriz clara, busqueda y cambios seguros |
| Atajos teclado | Configurar productividad | Correcta como preferencia | Mantener opciones simples y ejemplos compactos |

## Componentes reutilizables recomendados

- `ContextHeader`: entidad + estado + responsable + SLA/proximo paso.
- `WorkflowStepper`: etapas con estado completo/actual/pendiente/bloqueado.
- `StageTabs`: herramientas contextuales de una etapa.
- `StageActionBar`: accion primaria y secundarias del contexto.
- `StickyActions`: formularios largos y capturas de patio.
- `SummaryPanel`: panel lateral con datos que evitan navegar.
- `ActivityFeed`: historial unico por entidad.
- `SmartTable`: tabla con busqueda, orden, estado, fila accionable y empty state.
- `ModuleSubnav`: subnavegacion de modulo sin parecer workflow.
- `NextStepCard`: recomendacion explicita para el operador.

## Roadmap tecnico

1. Mantener `PageHeader` como primitivo comun, pero evolucionarlo para soportar `meta`, `status`, `primaryAction` y `secondaryActions`.
2. Unificar los steppers de taller, flete y neumaticos bajo un patron visual compartido.
3. Migrar detalles de flete a un layout tipo `FreightCaseLayout` con contexto, workflow y resumen lateral.
4. Convertir formularios largos a `FormSection` + `StickyActions`.
5. Estandarizar subnavs internas con `ModuleSubnav` para inventario y neumaticos.
6. Revisar pantallas con modales multiples, especialmente comunicaciones, para separar inbox operativo de configuracion.

## Validacion UX

- El sidebar expandido muestra areas y bandejas principales; la busqueda permite llegar a rutas especificas.
- Las etapas de taller viven dentro del caso y no como menu lateral.
- Las acciones de creacion salen de headers, cards de siguiente paso o flujos, no del arbol principal.
- Las vistas criticas tienen una tarea dominante: atender caso, asignar, comprar, despachar, registrar o resolver.
- Los reportes deben terminar en una decision, no solo en metricas.

## Iteracion transversal 2026-05-14

### Revision ejecutada

Se reviso nuevamente la plataforma completa a nivel de rutas, navegacion, layout global, busqueda operacional, componentes compartidos, tablas, hooks de datos y contratos frontend-backend.

Inventario tecnico observado:

- Mas de 600 archivos bajo `frontend/src`.
- Rutas centralizadas en `frontend/src/config/routes.ts` y lazy loading en `frontend/src/router.tsx`.
- Navegacion principal centralizada en `frontend/src/config/app.config.ts`.
- Modulos principales: Taller, Flota, Compras y abastecimiento, Clientes, Logistica, Finanzas, Configuracion, Comunicaciones, Notificaciones, Reportes, Incidentes y portal cliente.
- Componentes base ya consolidados: `PageHeader`, `Table`, `FilterBar`, `EntityLink`, `EmptyState`, `LoadingState`, `ErrorState`, `Badge`, `Button`.
- Capa de datos compartida mediante `useResourceList`, `useResourceItem`, `resourceApi` y `httpClient`.

### Problemas corregidos

- La barra de contexto global no distinguia bien sub-vistas basadas en query params, por ejemplo `Clientes / Tarifas` o `Compras / Auditoria`, porque solo evaluaba `pathname`.
- La barra de contexto mostraba poco contexto operativo: modulo y vista, pero no seccion ni accesos relacionados.
- La busqueda operacional global no incluia entidades clave del sistema: SKUs/repuestos, proveedores, mecanicos y cotizaciones de taller.
- Las rutas inexistentes no tenian una experiencia clara de recuperacion dentro del layout autenticado.

### Cambios aplicados

- `ContextBar` ahora usa la misma logica de ruta activa del sidebar, incluyendo query params.
- `ContextBar` muestra la seccion operacional de la vista actual y hasta cuatro accesos relacionados del mismo modulo/seccion.
- Se prioriza mostrar el dominio operativo real en vez de un grupo raiz generico.
- La busqueda global ahora permite abrir SKUs, proveedores, mecanicos y cotizaciones, con estados y contexto operativo.
- Se agrego una vista `RouteNotFound` dentro del router autenticado con accion clara para volver al dashboard.

### Criterio UX aplicado

- La ubicacion debe responder modulo, vista y seccion sin obligar al usuario a leer el sidebar.
- La navegacion relacionada debe estar cerca del contexto, no escondida en otro menu.
- Toda entidad recurrente que aparece en procesos operativos debe poder encontrarse desde la busqueda global.
- Las rutas rotas deben recuperarse con una accion util y lenguaje no tecnico.

### Riesgos pendientes

- Muchas paginas ya usan `Table`, pero no todas pasan `error`, `isLoading` o `onRetry`; conviene una siguiente iteracion por modulo para normalizar feedback de carga/error.
- Algunos formularios largos aun necesitan `StickyActions` y prevencion de perdida de cambios.
- La auditoria de permisos debe conectarse a reglas reales de backend cuando el modelo de roles este completo.
- La busqueda global sigue alimentandose desde mocks controlados para entidades transversales; cuando existan endpoints de busqueda unificada, debe migrar a servicio backend.

## Iteracion sidebar operacional 2026-05-14

### Problemas encontrados

- El sidebar tenia todos los modulos bajo un unico grupo raiz, lo que lo hacia sentirse como una lista larga y no como arquitectura operacional.
- El grupo raiz generico no agregaba significado de negocio y aumentaba ruido cognitivo.
- Los modulos padres con rutas propias solo expandian/cerraban submenus; para entrar al panel del modulo habia que hacer un click adicional en un hijo.
- En pantallas pequenas, al navegar desde el sidebar el overlay podia quedar abierto sobre la vista destino.
- La densidad visual era baja: sidebar de 400px, textos grandes y filas altas para una herramienta que se usa todo el dia.
- La busqueda lateral encontraba rutas, pero no aprovechaba la nueva agrupacion por dominio para coincidir con terminos como comercial, trafico o abastecimiento.

### Cambios aplicados

- La navegacion se reorganizo en grupos de negocio:
  - `Inicio`
  - `Operacion taller`
  - `Flota y logistica`
  - `Clientes y comercial`
  - `Abastecimiento`
  - `Finanzas y control`
  - `Administracion`
- Cada grupo conserva las rutas existentes y no cambia contratos frontend-backend.
- El grupo activo se abre automaticamente y los grupos no activos quedan compactos para reducir carga visual.
- Los modulos padre ahora navegan directamente a su ruta principal, con un boton separado para expandir/cerrar secciones internas.
- El sidebar mobile se cierra despues de seleccionar una ruta.
- Se redujo el ancho expandido del sidebar y se compacto la tipografia, alto de filas, espaciados y rail colapsado.
- La busqueda del sidebar ahora considera grupo, descripcion, modulo padre y seccion operacional.
- Se agrego estado visual para el grupo activo sin depender solo del submenu abierto.

### Criterio UX aplicado

- Sidebar como mapa operativo: primero dominio, luego modulo, luego seccion.
- Menos clics para entrar a modulos principales.
- Submenus solo como exploracion contextual, no como requisito para navegar.
- Mayor densidad para notebooks operacionales y uso intensivo.
- Mobile sin overlay persistente despues de navegar.

### Riesgos pendientes

- La visibilidad por permisos aun no filtra el arbol de navegacion; hoy se conserva compatibilidad y se evita ocultar rutas hasta que backend entregue permisos completos por modulo.
- No se agregaron badges dinamicos de pendientes al sidebar para no hardcodear conteos operacionales; deberian venir de endpoints resumidos por modulo.
- Una siguiente iteracion puede persistir preferencias de expansion por usuario si el equipo operativo lo necesita.

## Iteracion headers operacionales 2026-05-14

### Problemas encontrados

- `PageHeader` era consistente visualmente, pero no derivaba contexto desde la navegacion global; muchas vistas dependian de breadcrumbs manuales o quedaban sin ubicacion operacional.
- Los breadcrumbs usaban anchors nativos, lo que podia provocar navegacion completa en vez de transicion SPA.
- Los headers no mostraban ayudas de productividad, aunque la plataforma ya tiene shortcuts globales.
- Las acciones del header no tenian una zona lateral clara para separar accion primaria, acciones secundarias y ayudas.
- `SectionHeader` era simple, pero no tenia soporte para eyebrow/meta y podia quebrar jerarquia cuando las acciones crecian.
- Los shortcuts globales navegaban correctamente, pero no dejaban feedback visual/aria-live al usuario.
- `Ctrl K` para menu lateral podia interceptar foco aun dentro de inputs editables.

### Cambios aplicados

- Se creo `shared/navigation/navigationContext.ts` para centralizar contexto de navegacion, breadcrumbs y vistas relacionadas.
- `ContextBar` reutiliza la misma fuente de contexto que `PageHeader`, reduciendo duplicacion.
- `PageHeader` ahora puede derivar breadcrumbs automaticos desde `appConfig` y la ruta actual.
- `PageHeader` usa `Link` de React Router para breadcrumbs internos.
- `PageHeader` soporta `eyebrow`, `status`, `meta`, `shortcuts`, `showContext` y `showShortcutHints` sin romper usos existentes.
- Los headers muestran chips contextuales como seccion y descripcion del dominio operativo.
- Se agregaron hints discretos de atajos globales en el header: menu, busqueda y ayuda.
- `SectionHeader` ahora soporta eyebrow y meta, con mejor responsive y limite de acciones.
- `useGlobalShortcuts` evita robar foco de inputs editables para el atajo de menu.
- `MainLayout` muestra feedback visual y accesible cuando un shortcut abre busqueda, ayuda, cambia modulo o ejecuta accion rapida.

### Criterio UX aplicado

- Cada vista debe responder donde estoy antes de obligar al usuario a leer el sidebar.
- Breadcrumbs y contexto deben venir desde la arquitectura de navegacion, no desde texto duplicado por pantalla.
- Los atajos deben sentirse visibles y confirmar que hicieron algo.
- Acciones del header deben quedar separadas de contexto y ayudas.
- Los headers deben reducir altura y mantener densidad operacional en notebooks.

### Riesgos pendientes

- Algunas vistas tienen headers especificos fuera de `PageHeader`; conviene migrarlas gradualmente si necesitan la misma estructura.
- La jerarquia primaria/secundaria de acciones todavia depende del orden que cada pagina pasa en `actions`.
- Cuando backend entregue permisos completos por modulo, los headers deben ocultar o explicar acciones bloqueadas segun rol.
