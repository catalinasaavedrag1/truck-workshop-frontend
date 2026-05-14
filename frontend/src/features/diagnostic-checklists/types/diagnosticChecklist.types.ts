export type DiagnosticChecklistCategory =
  | 'engine'
  | 'brakes'
  | 'electrical'
  | 'tires'
  | 'suspension'
  | 'transmission'

export interface DiagnosticChecklistItem {
  id: string
  label: string
  required: boolean
  checked: boolean
}

export interface DiagnosticChecklistTemplate {
  id: string
  category: DiagnosticChecklistCategory
  name: string
  estimatedMinutes: number
  items: DiagnosticChecklistItem[]
}
