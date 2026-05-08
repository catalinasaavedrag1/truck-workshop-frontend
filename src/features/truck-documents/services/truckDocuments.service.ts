import { createResource, deleteResource, updateResource } from '../../../shared/services/resourceApi'
import type { TruckDocument, TruckDocumentPayload } from '../types/truckDocuments.types'

const TRUCK_DOCUMENTS_PATH = '/truck-documents'

export function createTruckDocument(payload: TruckDocumentPayload) {
  return createResource<TruckDocument, TruckDocumentPayload>(TRUCK_DOCUMENTS_PATH, payload)
}

export function updateTruckDocument(documentId: string, payload: Partial<TruckDocumentPayload>) {
  return updateResource<TruckDocument, Partial<TruckDocumentPayload>>(TRUCK_DOCUMENTS_PATH, documentId, payload)
}

export function deleteTruckDocument(documentId: string) {
  return deleteResource<TruckDocument>(TRUCK_DOCUMENTS_PATH, documentId)
}
