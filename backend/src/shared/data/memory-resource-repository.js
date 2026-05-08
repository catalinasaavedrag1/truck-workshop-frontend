import { randomUUID } from 'node:crypto'
import { seedRecordsByResource } from '../../../scripts/seed-data.js'
import { AppError } from '../errors/app-error.js'

const DEFAULT_PAGE_SIZE = 25
const MAX_PAGE_SIZE = 100
const stores = new Map()

export class MemoryResourceRepository {
  constructor(resource) {
    this.resource = {
      defaultSort: 'createdAt',
      filterFields: [],
      searchableFields: [],
      sortFields: [],
      ...resource,
    }
    this.fields = this.resource.fields
    this.store = ensureStore(this.resource)
  }

  async findAll(query = {}) {
    const page = Math.max(Number(query.page || 1), 1)
    const limit = Math.min(Math.max(Number(query.limit || DEFAULT_PAGE_SIZE), 1), MAX_PAGE_SIZE)
    const sortField = this.safeSortField(query.sort)
    const sortOrder = String(query.order || 'desc').toLowerCase() === 'asc' ? 1 : -1
    const filtered = this.records()
      .filter((record) => this.matchesSearch(record, query))
      .filter((record) => this.matchesFilters(record, query))
      .sort((first, second) => compareValues(first[sortField], second[sortField]) * sortOrder)
    const offset = (page - 1) * limit

    return {
      data: filtered.slice(offset, offset + limit),
      meta: {
        limit,
        page,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    }
  }

  async findById(id) {
    return this.clone(this.store.get(id)) || null
  }

  async create(payload) {
    const now = new Date().toISOString()
    const record = this.pickWritableFields({
      ...payload,
      id: payload.id || randomUUID(),
    })

    if (this.fields.includes('createdAt') && !record.createdAt) {
      record.createdAt = now
    }

    if (this.fields.includes('updatedAt') && !record.updatedAt) {
      record.updatedAt = now
    }

    this.store.set(record.id, record)

    return this.clone(record)
  }

  async update(id, payload) {
    const current = this.store.get(id)

    if (!current) {
      throw new AppError(`${this.resource.name} no encontrado`, 404)
    }

    const record = this.pickWritableFields({
      ...current,
      ...payload,
      id,
      updatedAt: this.fields.includes('updatedAt') ? new Date().toISOString() : current.updatedAt,
    })

    this.store.set(id, record)

    return this.clone(record)
  }

  async remove(id) {
    const current = this.store.get(id)

    if (!current) {
      throw new AppError(`${this.resource.name} no encontrado`, 404)
    }

    this.store.delete(id)

    return this.clone(current)
  }

  async upsertMany(records) {
    const saved = []

    for (const record of records) {
      saved.push(record.id && this.store.has(record.id) ? await this.update(record.id, record) : await this.create(record))
    }

    return saved
  }

  async countBy(filters = {}) {
    return this.records().filter((record) =>
      Object.entries(filters).every(([field, value]) => {
        if (value === undefined || value === null || value === '') {
          return true
        }

        return record[field] === value
      }),
    ).length
  }

  matchesSearch(record, query) {
    const search = String(query.search || query.query || '').trim().toLowerCase()

    if (!search || this.resource.searchableFields.length === 0) {
      return true
    }

    return this.resource.searchableFields.some((field) => String(record[field] || '').toLowerCase().includes(search))
  }

  matchesFilters(record, query) {
    return this.resource.filterFields.every((field) => {
      const value = query[field]

      if (value === undefined || value === null || value === '' || value === 'all') {
        return true
      }

      return String(record[field]) === String(value)
    })
  }

  pickWritableFields(payload) {
    return this.fields.reduce((record, field) => {
      if (payload[field] !== undefined) {
        record[field] = payload[field]
      }

      return record
    }, {})
  }

  safeSortField(field) {
    const allowed = new Set([...this.resource.sortFields, ...this.fields])

    if (field && allowed.has(field)) {
      return field
    }

    return this.fields.includes(this.resource.defaultSort) ? this.resource.defaultSort : 'id'
  }

  records() {
    return [...this.store.values()].map((record) => this.clone(record))
  }

  clone(record) {
    return record ? structuredClone(record) : record
  }
}

function ensureStore(resource) {
  if (!stores.has(resource.name)) {
    stores.set(
      resource.name,
      new Map((seedRecordsByResource[resource.name] || []).map((record) => [record.id, structuredClone(record)])),
    )
  }

  return stores.get(resource.name)
}

function compareValues(first, second) {
  if (first === second) {
    return 0
  }

  if (first === undefined || first === null) {
    return 1
  }

  if (second === undefined || second === null) {
    return -1
  }

  return first > second ? 1 : -1
}
