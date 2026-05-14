import type { WorkshopBay } from '../types/workshopBay.types'

export const workshopBaysMock: WorkshopBay[] = [
  {
    id: 'bay-001',
    name: 'Estacion 1 motor',
    type: 'mechanical',
    status: 'occupied',
    currentCaseId: 'case-001',
    currentCaseNumber: 'TW-2026-001',
  },
  {
    id: 'bay-002',
    name: 'Estacion 2 frenos',
    type: 'mechanical',
    status: 'occupied',
    currentCaseId: 'case-002',
    currentCaseNumber: 'TW-2026-002',
  },
  {
    id: 'bay-003',
    name: 'Diagnostico rapido',
    type: 'diagnostic',
    status: 'available',
  },
  {
    id: 'bay-004',
    name: 'Electrica avanzada',
    type: 'electrical',
    status: 'maintenance',
  },
  {
    id: 'bay-005',
    name: 'Prueba final',
    type: 'test',
    status: 'occupied',
    currentCaseId: 'case-004',
    currentCaseNumber: 'TW-2026-004',
  },
]
