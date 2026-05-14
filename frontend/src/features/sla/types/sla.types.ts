export type SlaStatus = 'OK' | 'AT_RISK' | 'BREACHED'

export interface SlaConfig {
  id: string
  name: string
  priority: string
  targetHours: number
  atRiskHours: number
}

export interface SlaSnapshot {
  slaId: string
  dueAt: string
  status: SlaStatus
  remainingHours: number
  totalHours: number
  consumedPercent: number
}
