import { createResource, updateResource } from '../../../shared/services/resourceApi'
import type { Mechanic, MechanicPayload, MechanicSpecialty, MechanicSpecialtyPayload } from '../types/mechanic.types'

export async function createMechanic(payload: MechanicPayload) {
  return createResource<Mechanic, MechanicPayload>('/mechanics', payload)
}

export async function updateMechanic(mechanicId: string, payload: MechanicPayload) {
  return updateResource<Mechanic, MechanicPayload>('/mechanics', mechanicId, payload)
}

export async function createMechanicSpecialty(payload: MechanicSpecialtyPayload) {
  return createResource<MechanicSpecialty, MechanicSpecialtyPayload>('/mechanic-specialties', payload)
}

export async function updateMechanicSpecialty(specialtyId: string, payload: MechanicSpecialtyPayload) {
  return updateResource<MechanicSpecialty, MechanicSpecialtyPayload>('/mechanic-specialties', specialtyId, payload)
}
