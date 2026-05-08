export type MechanicAvailability = 'available' | 'busy' | 'off-shift'

export interface Mechanic {
  id: string
  userId?: string
  userName?: string
  email?: string
  roleCode?: 'MECANICO' | string
  name: string
  specialtyId?: string
  specialty: string
  availability: MechanicAvailability
  activeCases: number
  maxCases: number
  shift: string
  createdAt?: string
  updatedAt?: string
}

export interface MechanicPayload {
  availability: MechanicAvailability
  email?: string
  maxCases: number
  name: string
  roleCode?: 'MECANICO' | string
  shift: string
  specialtyId?: string
  specialty: string
  userId?: string
  userName?: string
}

export type MechanicSpecialtyStatus = 'active' | 'inactive'

export interface MechanicSpecialty {
  id: string
  code: string
  name: string
  category: string
  description: string
  status: MechanicSpecialtyStatus
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface MechanicSpecialtyPayload {
  category: string
  code: string
  createdBy?: string
  description: string
  name: string
  status: MechanicSpecialtyStatus
  updatedBy?: string
}
