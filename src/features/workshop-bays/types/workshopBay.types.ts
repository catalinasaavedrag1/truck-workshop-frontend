export type WorkshopBayType = 'mechanical' | 'electrical' | 'diagnostic' | 'wash' | 'test'

export type WorkshopBayStatus = 'available' | 'occupied' | 'maintenance'

export interface WorkshopBay {
  id: string
  name: string
  type: WorkshopBayType
  status: WorkshopBayStatus
  currentCaseId?: string
  currentCaseNumber?: string
}
