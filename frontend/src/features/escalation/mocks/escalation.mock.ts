import type { EscalationEvent } from '../types/escalation.types'

export const escalationHistoryMock: EscalationEvent[] = [
  {
    id: 'esc-001',
    caseId: 'case-002',
    fromLevel: 'LEVEL_0_NORMAL',
    toLevel: 'LEVEL_1_SUPERVISOR',
    reason: 'SLA_AT_RISK',
    comment: 'Caso critico con SLA en riesgo por falta de repuesto de frenos.',
    createdAt: '2026-05-04T17:05:00.000Z',
    createdBy: 'Javier Torres',
  },
  {
    id: 'esc-002',
    caseId: 'case-002',
    fromLevel: 'LEVEL_1_SUPERVISOR',
    toLevel: 'LEVEL_2_JEFE_TALLER',
    reason: 'CRITICAL_PART_MISSING',
    comment: 'Se solicito priorizar compra y confirmar ETA con proveedor.',
    createdAt: '2026-05-05T09:20:00.000Z',
    createdBy: 'Javier Torres',
  },
  {
    id: 'esc-003',
    caseId: 'case-004',
    fromLevel: 'LEVEL_0_NORMAL',
    toLevel: 'LEVEL_1_SUPERVISOR',
    reason: 'CUSTOMER_COMPLAINT',
    comment: 'Operaciones solicita hora exacta de liberacion posterior a recepcion del kit.',
    createdAt: '2026-05-05T08:45:00.000Z',
    createdBy: 'Andrea Molina',
  },
]
