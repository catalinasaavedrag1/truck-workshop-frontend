import { AppError } from '../errors/app-error.js'

export class ResourceService {
  constructor(repository) {
    this.repository = repository
  }

  list(query) {
    return this.repository.findAll(query)
  }

  async get(id) {
    const record = await this.repository.findById(id)

    if (!record) {
      throw new AppError('Recurso no encontrado', 404)
    }

    return record
  }

  create(payload) {
    return this.repository.create(this.validatePayload(payload))
  }

  update(id, payload) {
    return this.repository.update(id, this.validatePayload(payload, { partial: true }))
  }

  remove(id) {
    return this.repository.remove(id)
  }

  validatePayload(payload, { partial = false } = {}) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new AppError('Payload invalido', 400)
    }

    const allowedFields = new Set(this.repository.resource?.fields || [])
    const unknownFields = Object.keys(payload).filter((field) => !allowedFields.has(field))

    if (unknownFields.length > 0) {
      throw new AppError('Payload contiene campos no permitidos', 400, { fields: unknownFields })
    }

    if (partial) {
      return payload
    }

    return { ...payload }
  }
}
