export type EscalationLevel =
  | 'LEVEL_0_NORMAL'
  | 'LEVEL_1_SUPERVISOR'
  | 'LEVEL_2_JEFE_TALLER'
  | 'LEVEL_3_GERENCIA'

export type EscalationReason =
  | 'SLA_AT_RISK'
  | 'SLA_BREACHED'
  | 'CRITICAL_PART_MISSING'
  | 'CUSTOMER_COMPLAINT'
  | 'DIAGNOSIS_BLOCKED'
  | 'MECHANIC_UNAVAILABLE'
  | 'SPECIAL_AUTHORIZATION'

export interface EscalationEvent {
  id: string
  caseId: string
  fromLevel: EscalationLevel
  toLevel: EscalationLevel
  reason: EscalationReason
  comment: string
  createdAt: string
  createdBy: string
}
