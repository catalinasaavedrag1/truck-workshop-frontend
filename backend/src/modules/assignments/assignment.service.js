import { createRepository } from '../../shared/data/repository-factory.js'
import { assignmentResource, workshopCaseResource } from '../../config/resources.js'
import { AppError } from '../../shared/errors/app-error.js'

export class AssignmentService {
  constructor() {
    this.assignments = createRepository(assignmentResource)
    this.cases = createRepository(workshopCaseResource)
  }

  list(query) {
    return this.assignments.findAll(query)
  }

  async create(payload) {
    const workshopCase = await this.cases.findById(payload.caseId)

    if (!workshopCase) {
      throw new AppError('Caso no encontrado para asignacion', 404)
    }

    await this.completeOpenAssignments(payload.caseId)

    const assignment = await this.assignments.create({
      ...payload,
      caseCode: payload.caseCode || workshopCase.caseNumber,
      status: payload.status || 'active',
      assignedAt: payload.assignedAt || new Date().toISOString(),
    })

    await this.cases.update(payload.caseId, {
      assignedMechanicId: payload.mechanicId,
      mechanicId: payload.mechanicId,
      mechanicName: payload.mechanicName,
      status: workshopCase.status === 'new' || workshopCase.status === 'diagnosis' ? 'assigned' : workshopCase.status,
    })

    return assignment
  }

  async completeOpenAssignments(caseId) {
    const result = await this.assignments.findAll({ caseId, limit: 100 })
    const openAssignments = result.data.filter((assignment) => ['active', 'paused', 'queued'].includes(assignment.status))

    await Promise.all(openAssignments.map((assignment) => this.assignments.update(assignment.id, { status: 'completed' })))
  }
}
