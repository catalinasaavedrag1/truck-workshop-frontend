import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { IncidentSeverity, IncidentStatus, IncidentType } from '../types/incidents.types'

export const incidentTypeLabels: Record<IncidentType, string> = {
  ACCIDENT: 'Accidente',
  DAMAGE: 'Dano',
  FINE: 'Multa',
  THEFT: 'Robo',
  DELAY: 'Retraso',
  CUSTOMER_ISSUE: 'Problema cliente',
  CARGO_ISSUE: 'Problema carga',
  ROAD_FAILURE: 'Falla en ruta',
  OTHER: 'Otro',
}

export const incidentSeverityLabels: Record<IncidentSeverity, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Critica',
}

export const incidentSeverityTones: Record<IncidentSeverity, BadgeTone> = {
  LOW: 'neutral',
  MEDIUM: 'warning',
  HIGH: 'danger',
  CRITICAL: 'danger',
}

export const incidentStatusLabels: Record<IncidentStatus, string> = {
  OPEN: 'Abierto',
  UNDER_REVIEW: 'En revision',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
}

export const incidentStatusTones: Record<IncidentStatus, BadgeTone> = {
  OPEN: 'danger',
  UNDER_REVIEW: 'warning',
  RESOLVED: 'success',
  CLOSED: 'neutral',
}

export const incidentSeverityOptions: Array<{ label: string; value: IncidentSeverity }> = Object.entries(incidentSeverityLabels)
  .map(([value, label]) => ({ label, value: value as IncidentSeverity }))

export const incidentStatusOptions: Array<{ label: string; value: IncidentStatus }> = Object.entries(incidentStatusLabels)
  .map(([value, label]) => ({ label, value: value as IncidentStatus }))
