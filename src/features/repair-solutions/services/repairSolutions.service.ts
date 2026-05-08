import { createResource } from '../../../shared/services/resourceApi'
import type { RepairSolution } from '../types/repairSolution.types'

export type RepairSolutionPayload = Omit<RepairSolution, 'id'>

export async function saveRepairSolution(payload: RepairSolutionPayload) {
  return createResource<RepairSolution, RepairSolutionPayload>('/repair-solutions', payload)
}
