import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type {
  FleetAvailabilityColumn,
  OperationalTruckStatus,
  OwnerType,
  TruckHealthStatus,
  TruckTimelineEventType,
} from '../types/fleet.types'

export const operationalStatusLabels: Record<OperationalTruckStatus, string> = {
  AVAILABLE: 'Disponible',
  ASSIGNED_TO_FREIGHT: 'Asignado a flete',
  ON_ROUTE: 'En ruta',
  IN_WORKSHOP: 'En taller',
  WAITING_PARTS: 'Esperando repuestos',
  BLOCKED: 'Bloqueado',
  OUT_OF_SERVICE: 'Fuera de servicio',
  SOLD: 'Vendido',
}

export const operationalStatusTones: Record<OperationalTruckStatus, BadgeTone> = {
  AVAILABLE: 'success',
  ASSIGNED_TO_FREIGHT: 'info',
  ON_ROUTE: 'info',
  IN_WORKSHOP: 'warning',
  WAITING_PARTS: 'warning',
  BLOCKED: 'danger',
  OUT_OF_SERVICE: 'danger',
  SOLD: 'neutral',
}

export const ownerTypeLabels: Record<OwnerType, string> = {
  LEASED: 'Leasing',
  OWNED: 'Propio',
  RENTED: 'Arriendo',
}

export const availabilityColumnLabels: Record<FleetAvailabilityColumn, string> = {
  AVAILABLE: 'Disponible',
  ON_ROUTE: 'En ruta',
  IN_WORKSHOP: 'En taller',
  WAITING_PARTS: 'Esperando repuesto',
  NO_DRIVER: 'Sin chofer',
  EXPIRED_DOCUMENTS: 'Documentos vencidos',
  MAINTENANCE_BLOCKED: 'Bloqueado mantencion',
  OUT_OF_SERVICE: 'Fuera de servicio',
}

export const availabilityColumns: FleetAvailabilityColumn[] = [
  'AVAILABLE',
  'ON_ROUTE',
  'IN_WORKSHOP',
  'WAITING_PARTS',
  'NO_DRIVER',
  'EXPIRED_DOCUMENTS',
  'MAINTENANCE_BLOCKED',
  'OUT_OF_SERVICE',
]

export const healthStatusLabels: Record<TruckHealthStatus, string> = {
  HEALTHY: 'Operativo sano',
  WARNING: 'Atencion',
  RISK: 'Riesgo operativo',
  CRITICAL: 'Critico',
}

export const healthStatusTones: Record<TruckHealthStatus, BadgeTone> = {
  HEALTHY: 'success',
  WARNING: 'warning',
  RISK: 'danger',
  CRITICAL: 'danger',
}

export const timelineEventLabels: Record<TruckTimelineEventType, string> = {
  PURCHASE: 'Compra',
  PREVENTIVE_MAINTENANCE: 'Mantencion preventiva',
  BREAKDOWN: 'Pana',
  REPAIR: 'Reparacion',
  TIRE_CHANGE: 'Cambio neumaticos',
  FREIGHT_DONE: 'Flete realizado',
  DRIVER_ASSIGNED: 'Chofer asignado',
  ACCIDENT: 'Accidente',
  FINE: 'Multa',
  COST: 'Gasto',
  DOCUMENT: 'Documento',
  STATUS_CHANGE: 'Cambio estado',
  DEPARTURE_CHECKLIST: 'Checklist salida',
  ARRIVAL_CHECKLIST: 'Checklist llegada',
}
