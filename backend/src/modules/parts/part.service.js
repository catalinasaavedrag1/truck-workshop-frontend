import { partResource } from '../../config/resources.js'
import { createRepository } from '../../shared/data/repository-factory.js'
import { stripImmutableFields } from '../../shared/utils/payload-sanitizers.js'

export class PartService {
  constructor() {
    this.parts = createRepository(partResource)
  }

  create(payload, actorName) {
    return this.parts.create({
      ...normalizePartPayload(payload),
      createdBy: payload.createdBy || actorName,
      updatedBy: payload.updatedBy || actorName,
    })
  }

  update(id, payload, actorName) {
    return this.parts.update(id, {
      ...normalizePartPayload(stripImmutableFields(payload), { partial: true }),
      updatedBy: actorName,
    })
  }

  async remove(id, actorName) {
    await this.parts.update(id, { deletedBy: actorName, updatedBy: actorName })

    return this.parts.remove(id)
  }
}

function normalizePartPayload(payload, options = {}) {
  const normalized = { ...payload }

  if (payload.sku !== undefined) {
    normalized.sku = String(payload.sku || '').trim().toUpperCase()
  }

  if (!options.partial || payload.stock !== undefined) {
    normalized.stock = Number(payload.stock || 0)
  }

  if (!options.partial || payload.minStock !== undefined) {
    normalized.minStock = Number(payload.minStock || 0)
  }

  if (!options.partial || payload.unitCost !== undefined) {
    normalized.unitCost = Number(payload.unitCost || 0)
  }

  return normalized
}
