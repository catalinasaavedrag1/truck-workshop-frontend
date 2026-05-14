export type FailureCategory = 'engine' | 'brakes' | 'electric' | 'transmission' | 'tires' | 'other'

export interface Diagnostic {
  id: string
  caseId: string
  category: FailureCategory
  symptoms: string[]
  rootCause: string
  severity: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
}
