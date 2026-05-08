import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { MaintenanceRiskStatus, MaintenanceType } from '../types/preventiveMaintenance.types'

export const maintenanceTypeLabels: Record<MaintenanceType, string> = {
  OIL_CHANGE: 'Cambio aceite',
  FILTERS: 'Filtros',
  BRAKES: 'Frenos',
  TIRES: 'Neumaticos',
  ALIGNMENT: 'Alineacion',
  BATTERY: 'Bateria',
  SUSPENSION: 'Suspension',
  TECHNICAL_INSPECTION: 'Revision tecnica',
  KM_SERVICE: 'Servicio por km',
}

export const maintenanceRiskLabels: Record<MaintenanceRiskStatus, string> = {
  OK: 'OK',
  WARNING: 'Riesgo medio',
  CRITICAL: 'Critico',
  OVERDUE: 'Vencido',
}

export const maintenanceRiskTones: Record<MaintenanceRiskStatus, BadgeTone> = {
  OK: 'success',
  WARNING: 'warning',
  CRITICAL: 'danger',
  OVERDUE: 'danger',
}
