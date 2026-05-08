import {
  approvalResource,
  purchaseOrderResource,
  quoteResource,
  repairSolutionResource,
  workshopCaseResource,
} from '../../config/resources.js'
import { createRepository } from '../../shared/data/repository-factory.js'
import { AppError } from '../../shared/errors/app-error.js'

const VALID_RESOLUTION_STATUSES = new Set(['approved', 'rejected'])

export class ApprovalService {
  constructor() {
    this.approvals = createRepository(approvalResource)
    this.cases = createRepository(workshopCaseResource)
    this.purchaseOrders = createRepository(purchaseOrderResource)
    this.quotes = createRepository(quoteResource)
    this.repairSolutions = createRepository(repairSolutionResource)
  }

  async resolve(id, payload, actorName) {
    const approval = await this.requireApproval(id)
    const status = normalizeResolutionStatus(payload.status || payload.action)

    if (approval.status !== 'pending' && approval.status !== status) {
      throw new AppError('La aprobacion ya fue resuelta', 409)
    }

    const resolvedApproval = await this.approvals.update(id, {
      resolvedAt: new Date().toISOString(),
      status,
    })

    await this.applyRelatedResolution(resolvedApproval, actorName)

    return resolvedApproval
  }

  async requireApproval(id) {
    const approval = await this.approvals.findById(id)

    if (!approval) {
      throw new AppError('Aprobacion no encontrada', 404)
    }

    return approval
  }

  async applyRelatedResolution(approval, actorName) {
    if (approval.type === 'quote') {
      return this.resolveQuoteApproval(approval, actorName)
    }

    if (approval.type === 'purchase') {
      return this.resolvePurchaseApproval(approval, actorName)
    }

    if (approval.type === 'repair') {
      return this.resolveRepairApproval(approval)
    }

    if (approval.type === 'forced_close') {
      return this.resolveForcedCloseApproval(approval)
    }

    return null
  }

  async resolveQuoteApproval(approval, actorName) {
    const quote = await this.quotes.findById(approval.relatedEntityId)

    if (!quote) {
      throw new AppError('Cotizacion relacionada no encontrada', 404)
    }

    const quoteStatus = approval.status === 'approved' ? 'APPROVED' : 'REJECTED'
    const updatedQuote = await this.quotes.update(quote.id, {
      approvedBy: approval.status === 'approved' ? actorName : quote.approvedBy,
      status: quoteStatus,
    })
    const workshopCase = await this.cases.findById(updatedQuote.caseId)

    if (!workshopCase) {
      return updatedQuote
    }

    const casePatch = {
      currentStep: approval.status === 'approved' ? 'Cotizacion aprobada' : 'Cotizacion rechazada',
      estimatedCost: updatedQuote.total,
    }

    if (approval.status === 'approved' && ['new', 'diagnosis', 'solution', 'assigned'].includes(workshopCase.status)) {
      casePatch.status = 'repairing'
    }

    if (approval.status === 'rejected' && workshopCase.status === 'repairing') {
      casePatch.status = 'solution'
    }

    return this.cases.update(workshopCase.id, casePatch)
  }

  async resolvePurchaseApproval(approval, actorName) {
    const purchaseOrder = await this.purchaseOrders.findById(approval.relatedEntityId)

    if (!purchaseOrder) {
      throw new AppError('Orden de compra relacionada no encontrada', 404)
    }

    return this.purchaseOrders.update(purchaseOrder.id, {
      approvedBy: approval.status === 'approved' ? actorName : purchaseOrder.approvedBy,
      status: approval.status === 'approved' ? 'APPROVED' : 'CANCELLED',
    })
  }

  async resolveRepairApproval(approval) {
    const caseId = approval.caseId || approval.relatedEntityId
    const workshopCase = caseId ? await this.cases.findById(caseId) : null
    const repairSolution = await this.repairSolutions.findById(approval.relatedEntityId)

    if (repairSolution && approval.status === 'approved') {
      await this.repairSolutions.update(repairSolution.id, { approvalRequired: false })
    }

    if (!workshopCase && !repairSolution) {
      throw new AppError('Reparacion relacionada no encontrada', 404)
    }

    if (!workshopCase) {
      return repairSolution
    }

    return this.cases.update(workshopCase.id, {
      currentStep: approval.status === 'approved' ? 'Reparacion aprobada' : 'Reparacion rechazada',
      status: approval.status === 'approved' ? 'repairing' : 'solution',
    })
  }

  async resolveForcedCloseApproval(approval) {
    const caseId = approval.caseId || approval.relatedEntityId
    const workshopCase = caseId ? await this.cases.findById(caseId) : null

    if (!workshopCase) {
      throw new AppError('Caso relacionado no encontrado', 404)
    }

    return this.cases.update(workshopCase.id, {
      currentStep: approval.status === 'approved' ? 'Cierre forzado aprobado' : 'Cierre forzado rechazado',
      status: approval.status === 'approved' ? 'closed' : workshopCase.status,
    })
  }
}

function normalizeResolutionStatus(status) {
  const normalized = String(status || '').trim().toLowerCase()

  if (!VALID_RESOLUTION_STATUSES.has(normalized)) {
    throw new AppError('La aprobacion solo puede resolverse como approved o rejected', 400)
  }

  return normalized
}
