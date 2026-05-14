import { createResource } from '../../../shared/services/resourceApi'
import type { Assignment } from '../types/assignment.types'

const ASSIGNMENTS_PATH = '/assignments'

export async function assignCase(payload: Assignment) {
  return createResource<Assignment, Assignment>(ASSIGNMENTS_PATH, payload)
}
