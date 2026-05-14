# Matriz frontend/backend

Actualizado: 2026-05-13

## Matriz de modulos y conectividad

| Modulo frontend | Ruta/vista principal | Backend/API relacionado | Estado tecnico | Observacion clean code |
|---|---|---|---|---|
| Auth | `/login` | `/auth/login` | Conectado | Mantener token/usuario en un store formal si crece autenticacion. |
| Dashboard | `/dashboard` | `/dashboard/summary` y recursos CRUD | Conectado mixto | Usa datos cruzados; debe evitar depender de mocks cuando backend este estable. |
| Casos taller | `/cases`, `/cases/new`, `/cases/:id` | `/cases`, `/workshop-cases` | Conectado especializado | Flujo correcto para crear, asignar, escalar y cerrar; necesita tests E2E. |
| Diagnosticos | `/diagnostics/:caseId` | `/diagnostics` | Conectado | Correcto como recurso relacionado a caso. |
| Checklists diagnostico | `/checklists` | `/diagnostic-checklists`, alias `/checklists` | CRUD conectado | Buen candidato para editor versionado de plantillas. |
| Soluciones reparacion | `/repair-solutions/:caseId` | `/repair-solutions` | Conectado | Mantener relacion por `caseId`. |
| Asignaciones taller | `/assignments` | `/assignments`, `/cases/:id/assignments` | Conectado especializado | Debe seguir mostrando contexto completo del caso, no solo mecanico. |
| Escalaciones | Integrado en caso | `/cases/:id/escalations`, `/escalations` | Conectado por caso | Mantener historial visible y razones normalizadas. |
| Agenda taller | `/schedule` | `/schedule/events`, `/schedule/waiting-queue` | Conectado | Buen patron de filtros en header y tablero operativo. |
| Bahias taller | `/bays` | `/bays` | CRUD conectado | Catalogo simple correcto. |
| Mecanicos | `/mechanics`, `/mechanics/:id` | `/mechanics` | Conectado especializado | Correcto para crear/editar; mantener especialidad por id. |
| Especialidades mecanico | `/mechanics/specialties` | `/mechanic-specialties` | CRUD conectado | Buen catalogo para usuarios perfil mecanico. |
| Camiones legacy | `/trucks` | `/trucks` | Conectado | Conviene converger con flota para evitar duplicidad. |
| Flota | `/fleet`, `/fleet/trucks`, `/fleet/availability`, `/fleet/health-score` | `/fleet/trucks`, `/fleet/availability`, `/fleet/health-scores`, `/fleet/timeline-events` | Conectado | Es el modulo maestro para camiones operacionales. |
| Choferes | `/drivers`, `/drivers/:id` | `/drivers`, `/driver-documents`, `/driver-fines` | Conectado | Buena relacion con documentacion/multas; evitar mocks en resumen superior. |
| Documentos camion | `/truck-documents` | `/truck-documents` | Conectado | Reporteria de vencimientos usa este recurso. |
| Mantenimiento preventivo | `/preventive-maintenance` | `/preventive-maintenance/plans` | Conectado | Correcto como subdominio de flota/taller. |
| Costos camion | `/truck-costs` | `/truck-costs`, `/truck-costs/analytics`, `/truck-costs/summaries` | Conectado | Mantener detalle mensual/anual en backend. |
| Combustible | `/fuel`, `/fuel/new`, `/fuel/report` | `/fuel/records`, alias `/fuel` | Conectado | Requiere relacion por camion/chofer desde API, no mocks directos en filtros. |
| Telemetria/GPS | `/telematics` | `/telematics` | CRUD conectado | La visualizacion debe priorizar flota en mapa y alertas accionables. |
| Neumaticos | `/tire-performance` | `/tire-performance/tires` | CRUD conectado | Correcto como costo operacional de camion. |
| Checklists viaje | `/trip-checklists` | `/trip-checklists/departures`, `/trip-checklists/arrivals` | Conectado | Separacion entrada/salida correcta. |
| Fletes solicitudes | `/freight/requests` | `/freight/requests` | Conectado | Usa clientes y mapas; debe recibir origen/destino normalizados. |
| Fletes cotizaciones | `/freight/quotes` | `/freight/quotes`, `/freight/pricing/*`, `/maps/*` | Conectado especializado | Backend debe seguir siendo fuente de verdad de costos. |
| Fletes asignaciones | `/freight/assignments` | `/freight/assignments` | Conectado especializado | Debe validar disponibilidad de camion/chofer en backend. |
| Planillas chofer | `/freight/driver-trip-sheets` | `/driver-trip-sheets` | Conectado | Buen modulo para rendimiento viaje y reporteria. |
| Rentabilidad flete | `/freight-profitability` | `/freight-profitability` | CRUD conectado | Debe consolidar costos de combustible, peajes, mantencion y chofer. |
| Clientes | `/customers` | `/customers` | Conectado | Correcto para listas de precio, credito y tipos de flete. |
| Mapas/rutas | componente `RoutePlanner` | `/maps/places`, `/maps/route` | Conectado especializado | Google opcional; fallback OpenStreetMap/OSRM funcional. |
| Proveedores | `/suppliers` | `/suppliers` | Conectado especializado | Auditoria createdBy/updatedBy presente en recurso. |
| Partes/SKU | `/parts` | `/parts` | Conectado especializado | Correcto para inventario; mantener SKU unico en backend. |
| Bodega | `/warehouse`, `/warehouse/locations`, `/warehouse/stock`, `/warehouse/managers` | `/warehouse/locations`, `/warehouse/stock`, `/warehouse/managers`, `/warehouse/movements` | Conectado | Consolidado como gestion de inventario. |
| Ordenes compra | `/purchase-orders` | `/purchase-orders`, `/purchase-requests` | Conectado especializado | Flujo correcto; compras desde casos debe dejar trazabilidad. |
| Cotizaciones taller | `/quotes` | `/quotes` | Conectado especializado | Relaciona caso, diagnostico, items y aprobaciones. |
| Aprobaciones | `/approvals` | `/approvals` | Conectado especializado | Debe mantenerse como bandeja transversal. |
| Mano obra | `/labor` | `/labor/tasks`, alias `/labor` | Conectado | Debe relacionarse siempre con caso y mecanico. |
| Comunicaciones | `/communications` | `/communications/*` | Conectado especializado | WhatsApp/Outlook configurable; credenciales solo backend/env. |
| Notificaciones | `/notifications` | `/notifications`, `/notifications/subscriptions` | Conectado | Buen lugar para suscripciones y alertas operacionales. |
| Reportes | `/reports` | `/reports/*` | Conectado especializado | Correcto para vencimientos tecnica y planillas chofer. |
| Incidencias | `/incidents` | `/incidents` | Conectado | Relaciona camion, chofer, flete y caso taller. |
| Permisos/usuarios | `/permissions` | `/permissions/roles`, `/permissions/user-roles` | Conectado | Falta enforcement real de permisos en rutas backend. |
| Configuracion atajos | `/settings/shortcuts` | `/settings/shortcuts` | CRUD conectado | Preferencias persistentes por usuario/perfil. |
| SLA | Integrado en casos | `/sla/configs` | CRUD conectado | Sin pagina dedicada; se consume en componentes de caso. |
