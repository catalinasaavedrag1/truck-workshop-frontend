import { mechanicsMock } from '../../../mocks/mechanics.mock'
import { createResource, deleteResource, getResourceById, listResource, updateResource } from '../../../shared/services/resourceApi'
import { mechanicSpecialtiesMock } from '../mocks/mechanicSpecialties.mock'
import type { Mechanic, MechanicPayload, MechanicSpecialty, MechanicSpecialtyPayload } from '../types/mechanic.types'

export async function getMechanics() {
  return listResource<Mechanic>('/mechanics', mechanicsMock, { sort: 'name', order: 'asc' })
}

export async function getMechanicById(mechanicId: string) {
  return getResourceById<Mechanic>('/mechanics', mechanicId, mechanicsMock)
}

export async function createMechanic(payload: MechanicPayload) {
  return createResource<Mechanic, MechanicPayload>('/mechanics', payload)
}

export async function updateMechanic(mechanicId: string, payload: MechanicPayload) {
  return updateResource<Mechanic, MechanicPayload>('/mechanics', mechanicId, payload)
}

export async function getMechanicSpecialties() {
  return listResource<MechanicSpecialty>('/mechanic-specialties', mechanicSpecialtiesMock, { sort: 'name', order: 'asc' })
}

export async function createMechanicSpecialty(payload: MechanicSpecialtyPayload) {
  return createResource<MechanicSpecialty, MechanicSpecialtyPayload>('/mechanic-specialties', payload)
}

export async function updateMechanicSpecialty(specialtyId: string, payload: MechanicSpecialtyPayload) {
  return updateResource<MechanicSpecialty, MechanicSpecialtyPayload>('/mechanic-specialties', specialtyId, payload)
}

export async function deleteMechanicSpecialty(specialtyId: string) {
  return deleteResource<MechanicSpecialty>('/mechanic-specialties', specialtyId)
}
