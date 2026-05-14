import type { SlaConfig, SlaSnapshot, SlaStatus } from '../types/sla.types'

const mockNow = new Date('2026-05-05T12:00:00.000Z')

export const slaConfigsMock: SlaConfig[] = [
  { id: 'sla-critical', name: 'Critico 24h', priority: 'critical', targetHours: 24, atRiskHours: 6 },
  { id: 'sla-high', name: 'Alta 48h', priority: 'high', targetHours: 48, atRiskHours: 6 },
  { id: 'sla-medium', name: 'Media 72h', priority: 'medium', targetHours: 72, atRiskHours: 6 },
  { id: 'sla-low', name: 'Baja 96h', priority: 'low', targetHours: 96, atRiskHours: 6 },
]

export function calculateRemainingHours(dueAt: string, now = mockNow) {
  return Math.round((new Date(dueAt).getTime() - now.getTime()) / 36_000) / 100
}

export function calculateSlaStatus(dueAt: string, now = mockNow): SlaStatus {
  const remainingHours = calculateRemainingHours(dueAt, now)

  if (remainingHours <= 0) {
    return 'BREACHED'
  }

  if (remainingHours < 6) {
    return 'AT_RISK'
  }

  return 'OK'
}

export function getSlaSnapshot(slaId: string, dueAt: string, createdAt: string): SlaSnapshot {
  const dueTime = new Date(dueAt).getTime()
  const createdTime = new Date(createdAt).getTime()
  const totalHours = Math.max((dueTime - createdTime) / 3_600_000, 1)
  const remainingHours = calculateRemainingHours(dueAt)
  const elapsedHours = totalHours - Math.max(remainingHours, 0)
  const consumedPercent = Math.min(Math.max(Math.round((elapsedHours / totalHours) * 100), 0), 100)

  return {
    slaId,
    dueAt,
    status: calculateSlaStatus(dueAt),
    remainingHours,
    totalHours,
    consumedPercent,
  }
}
