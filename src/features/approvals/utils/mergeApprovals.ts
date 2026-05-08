import type { Approval } from '../types/approval.types'

export function mergeApprovals(baseApprovals: Approval[], changedApprovals: Approval[]) {
  const changedById = new Map(changedApprovals.map((approval) => [approval.id, approval]))
  const merged = baseApprovals.map((approval) => changedById.get(approval.id) || approval)
  const baseIds = new Set(baseApprovals.map((approval) => approval.id))

  return [...changedApprovals.filter((approval) => !baseIds.has(approval.id)), ...merged]
}
