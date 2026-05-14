import { warehouseLocationResource } from '../../config/resources.js'
import { createRepository } from '../../shared/data/repository-factory.js'
import { stripImmutableFields } from '../../shared/utils/payload-sanitizers.js'

export class WarehouseLocationService {
  constructor() {
    this.locations = createRepository(warehouseLocationResource)
  }

  create(payload, actorName) {
    return this.locations.create({
      ...normalizeLocationPayload(payload),
      createdBy: payload.createdBy || actorName,
      updatedBy: payload.updatedBy || actorName,
    })
  }

  update(id, payload, actorName) {
    return this.locations.update(id, {
      ...normalizeLocationPayload(stripImmutableFields(payload), { partial: true }),
      updatedBy: actorName,
    })
  }

  async remove(id, actorName) {
    await this.locations.update(id, { updatedBy: actorName })

    return this.locations.remove(id)
  }
}

function normalizeLocationPayload(payload, options = {}) {
  const normalized = { ...payload }

  if (!options.partial || payload.capacity !== undefined) {
    normalized.capacity = Number(payload.capacity || 0)
  }

  if (!options.partial || payload.status !== undefined) {
    normalized.status = payload.status || 'active'
  }

  return normalized
}
