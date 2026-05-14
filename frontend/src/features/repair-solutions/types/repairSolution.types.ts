export interface RequiredPart {
  partId: string
  name: string
  quantity: number
  unitCost: number
}

export interface RepairSolution {
  id: string
  caseId: string
  summary: string
  requiredParts: RequiredPart[]
  laborHours: number
  estimatedCost: number
  approvalRequired: boolean
}
