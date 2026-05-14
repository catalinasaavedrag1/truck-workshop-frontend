import type { EscalationLevel, EscalationReason } from '../types/escalation.types'

export const ESCALATION_LEVEL_LABELS: Record<EscalationLevel, string> = {
  LEVEL_0_NORMAL: 'Normal',
  LEVEL_1_SUPERVISOR: 'Supervisor',
  LEVEL_2_JEFE_TALLER: 'Jefe de taller',
  LEVEL_3_GERENCIA: 'Gerencia',
}

export const ESCALATION_LEVEL_ORDER: EscalationLevel[] = [
  'LEVEL_0_NORMAL',
  'LEVEL_1_SUPERVISOR',
  'LEVEL_2_JEFE_TALLER',
  'LEVEL_3_GERENCIA',
]

export const ESCALATION_REASON_LABELS: Record<EscalationReason, string> = {
  CRITICAL_PART_MISSING: 'Falta repuesto critico',
  CUSTOMER_COMPLAINT: 'Operacion reclamando',
  DIAGNOSIS_BLOCKED: 'Diagnostico bloqueado',
  MECHANIC_UNAVAILABLE: 'Mecanico sin disponibilidad',
  SLA_AT_RISK: 'SLA en riesgo',
  SLA_BREACHED: 'SLA vencido',
  SPECIAL_AUTHORIZATION: 'Autorizacion especial',
}

export const ESCALATION_REASON_OPTIONS: Array<{ label: string; value: EscalationReason }> = [
  { label: ESCALATION_REASON_LABELS.SLA_AT_RISK, value: 'SLA_AT_RISK' },
  { label: ESCALATION_REASON_LABELS.SLA_BREACHED, value: 'SLA_BREACHED' },
  { label: ESCALATION_REASON_LABELS.CRITICAL_PART_MISSING, value: 'CRITICAL_PART_MISSING' },
  { label: ESCALATION_REASON_LABELS.CUSTOMER_COMPLAINT, value: 'CUSTOMER_COMPLAINT' },
  { label: ESCALATION_REASON_LABELS.DIAGNOSIS_BLOCKED, value: 'DIAGNOSIS_BLOCKED' },
  { label: ESCALATION_REASON_LABELS.MECHANIC_UNAVAILABLE, value: 'MECHANIC_UNAVAILABLE' },
  { label: ESCALATION_REASON_LABELS.SPECIAL_AUTHORIZATION, value: 'SPECIAL_AUTHORIZATION' },
]

export function getNextEscalationLevel(currentLevel: EscalationLevel): EscalationLevel {
  const currentIndex = ESCALATION_LEVEL_ORDER.indexOf(currentLevel)
  const nextIndex = Math.min(currentIndex + 1, ESCALATION_LEVEL_ORDER.length - 1)

  return ESCALATION_LEVEL_ORDER[nextIndex]
}

export function getEscalationTargetOptions(currentLevel: EscalationLevel) {
  const currentIndex = ESCALATION_LEVEL_ORDER.indexOf(currentLevel)

  return ESCALATION_LEVEL_ORDER
    .slice(Math.min(currentIndex + 1, ESCALATION_LEVEL_ORDER.length - 1))
    .map((level) => ({ label: ESCALATION_LEVEL_LABELS[level], value: level }))
}
