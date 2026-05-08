import { diagnosticResource, workshopCaseResource } from '../../config/resources.js'
import { createRepository } from '../../shared/data/repository-factory.js'
import { AppError } from '../../shared/errors/app-error.js'

const VALID_CATEGORIES = new Set(['engine', 'brakes', 'electric', 'transmission', 'tires', 'other'])
const VALID_SEVERITIES = new Set(['low', 'medium', 'high'])

export class DiagnosticService {
  constructor() {
    this.diagnostics = createRepository(diagnosticResource)
    this.cases = createRepository(workshopCaseResource)
  }

  async create(payload, actorName) {
    const workshopCase = await this.requireCase(payload.caseId)
    const diagnostic = await this.diagnostics.create({
      ...normalizeDiagnosticPayload(payload),
      createdBy: payload.createdBy || actorName,
      updatedBy: payload.updatedBy || actorName,
    })

    await this.cases.update(workshopCase.id, {
      currentStep: 'Definir solucion',
      status: shouldAdvanceCase(workshopCase.status) ? 'solution' : workshopCase.status,
    })

    return diagnostic
  }

  update(id, payload, actorName) {
    return this.diagnostics.update(id, {
      ...normalizeDiagnosticPayload(stripImmutableFields(payload), { partial: true }),
      updatedBy: actorName,
    })
  }

  async remove(id, actorName) {
    await this.diagnostics.update(id, { deletedBy: actorName, updatedBy: actorName })

    return this.diagnostics.remove(id)
  }

  async requireCase(caseId) {
    const workshopCase = await this.cases.findById(caseId)

    if (!workshopCase) {
      throw new AppError('Caso no encontrado para registrar diagnostico', 404)
    }

    return workshopCase
  }
}

function normalizeDiagnosticPayload(payload, options = {}) {
  const normalized = { ...payload }

  if (!options.partial || payload.caseId !== undefined) {
    normalized.caseId = String(payload.caseId || '').trim()

    if (!normalized.caseId) {
      throw new AppError('El diagnostico requiere un caso asociado', 400)
    }
  }

  if (!options.partial || payload.category !== undefined) {
    const category = String(payload.category || 'other').trim()
    normalized.category = VALID_CATEGORIES.has(category) ? category : 'other'
  }

  if (!options.partial || payload.symptoms !== undefined) {
    normalized.symptoms = normalizeSymptoms(payload.symptoms)

    if (normalized.symptoms.length === 0) {
      throw new AppError('El diagnostico requiere al menos un sintoma', 400)
    }
  }

  if (!options.partial || payload.rootCause !== undefined) {
    normalized.rootCause = String(payload.rootCause || '').trim()

    if (!options.partial && !normalized.rootCause) {
      throw new AppError('El diagnostico requiere causa probable', 400)
    }
  }

  if (!options.partial || payload.severity !== undefined) {
    const severity = String(payload.severity || 'medium').trim()
    normalized.severity = VALID_SEVERITIES.has(severity) ? severity : 'medium'
  }

  return normalized
}

function normalizeSymptoms(symptoms) {
  if (Array.isArray(symptoms)) {
    return symptoms.map((symptom) => String(symptom).trim()).filter(Boolean)
  }

  return String(symptoms || '')
    .split('|')
    .map((symptom) => symptom.trim())
    .filter(Boolean)
}

function shouldAdvanceCase(status) {
  return ['new', 'diagnosis', 'assigned'].includes(status)
}

function stripImmutableFields(payload) {
  const editablePayload = { ...payload }

  delete editablePayload.createdAt
  delete editablePayload.createdBy
  delete editablePayload.deletedBy
  delete editablePayload.id

  return editablePayload
}
