import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { ChecklistStatus } from '../types/tripChecklists.types'

export const checklistStatusLabels: Record<ChecklistStatus, string> = {
  DRAFT: 'Borrador',
  COMPLETED: 'Completado',
  WITH_OBSERVATIONS: 'Con observaciones',
  BLOCKED: 'Bloqueado',
}

export const checklistStatusTones: Record<ChecklistStatus, BadgeTone> = {
  DRAFT: 'neutral',
  COMPLETED: 'success',
  WITH_OBSERVATIONS: 'warning',
  BLOCKED: 'danger',
}

export type DepartureChecklistItemKey =
  | 'tiresOk'
  | 'lightsOk'
  | 'brakesOk'
  | 'oilOk'
  | 'waterOk'
  | 'documentsOk'
  | 'cargoSecured'

export const departureChecklistItems: {
  category: 'Seguridad' | 'Fluidos' | 'Documental' | 'Carga'
  critical: boolean
  helper: string
  key: DepartureChecklistItemKey
  label: string
}[] = [
  {
    category: 'Seguridad',
    critical: false,
    helper: 'Profundidad, presion y desgaste visible.',
    key: 'tiresOk',
    label: 'Neumaticos',
  },
  {
    category: 'Seguridad',
    critical: false,
    helper: 'Luces frontales, traseras y laterales.',
    key: 'lightsOk',
    label: 'Luces',
  },
  {
    category: 'Seguridad',
    critical: true,
    helper: 'Si falla, la salida queda bloqueada.',
    key: 'brakesOk',
    label: 'Frenos',
  },
  {
    category: 'Fluidos',
    critical: false,
    helper: 'Nivel y fugas visibles antes de ruta.',
    key: 'oilOk',
    label: 'Aceite',
  },
  {
    category: 'Fluidos',
    critical: false,
    helper: 'Nivel operativo y fugas visibles.',
    key: 'waterOk',
    label: 'Agua',
  },
  {
    category: 'Documental',
    critical: true,
    helper: 'Permiso, revision tecnica y seguros.',
    key: 'documentsOk',
    label: 'Documentos',
  },
  {
    category: 'Carga',
    critical: false,
    helper: 'Amarras, sellos y estabilidad de carga.',
    key: 'cargoSecured',
    label: 'Carga asegurada',
  },
]

export const arrivalOutcomeOptions = [
  { label: 'Entregada conforme', value: 'ok' },
  { label: 'Con observaciones', value: 'observed' },
  { label: 'Dano reportado', value: 'damaged' },
]
