import { partsMock } from '../../../mocks/parts.mock'
import { createResource, deleteResource, getResourceById, listResource, updateResource } from '../../../shared/services/resourceApi'
import type { Part } from '../types/part.types'

const PARTS_PATH = '/parts'

export async function getParts() {
  return listResource<Part>(PARTS_PATH, partsMock, { sort: 'sku', order: 'asc' })
}

export async function getPartById(partId: string) {
  return getResourceById<Part>(PARTS_PATH, partId, partsMock)
}

export type PartPayload = Omit<Part, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'deletedBy'>

export async function createPart(payload: PartPayload) {
  return createResource<Part, PartPayload>(PARTS_PATH, payload)
}

export async function updatePart(partId: string, payload: PartPayload) {
  return updateResource<Part, PartPayload>(PARTS_PATH, partId, payload)
}

export async function deletePart(partId: string) {
  return deleteResource<Part>(PARTS_PATH, partId)
}
