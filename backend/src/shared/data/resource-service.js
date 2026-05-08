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
    return this.repository.create(payload)
  }

  update(id, payload) {
    return this.repository.update(id, payload)
  }

  remove(id) {
    return this.repository.remove(id)
  }
}
