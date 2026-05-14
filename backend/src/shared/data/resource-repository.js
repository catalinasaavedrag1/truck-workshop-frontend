import { randomUUID } from 'node:crypto'
import { getPool, sql } from '../../db/pool.js'
import { AppError } from '../errors/app-error.js'
import { toSnakeCase } from '../utils/case-converters.js'
import { buildPaginationMeta, parsePaginationOptions, parseSortOrder } from './query-options.js'

export class ResourceRepository {
  constructor(resource) {
    this.resource = {
      defaultSort: 'createdAt',
      filterFields: [],
      jsonFields: [],
      searchableFields: [],
      sortFields: [],
      ...resource,
    }
    this.jsonFields = new Set(this.resource.jsonFields)
    this.fields = this.resource.fields
  }

  async findAll(query = {}) {
    const { limit, offset, page } = parsePaginationOptions(query)
    const sortField = this.safeSortField(query.sort)
    const sortOrder = parseSortOrder(query.order).toUpperCase()
    const request = (await getPool()).request()
    const where = this.buildWhereClause(request, query)
    const selectColumns = this.selectColumns()

    request.input('offset', sql.Int, offset)
    request.input('limit', sql.Int, limit)

    const dataQuery = `
      SELECT ${selectColumns}
      FROM ${this.tableName()}
      ${where.sql}
      ORDER BY ${this.columnName(sortField)} ${sortOrder}
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
    `
    const [dataResult, countResult] = await Promise.all([
      request.query(dataQuery),
      this.count(query),
    ])

    return {
      data: dataResult.recordset.map((row) => this.fromDb(row)),
      meta: buildPaginationMeta({ limit, page, total: countResult }),
    }
  }

  async findById(id) {
    const request = (await getPool()).request()
    request.input('id', sql.NVarChar(80), id)

    const result = await request.query(`
      SELECT ${this.selectColumns()}
      FROM ${this.tableName()}
      WHERE ${this.columnName('id')} = @id AND deleted_at IS NULL;
    `)

    const record = result.recordset[0]

    return record ? this.fromDb(record) : null
  }

  async existsById(id) {
    const request = (await getPool()).request()
    request.input('id', sql.NVarChar(80), id)

    const result = await request.query(`
      SELECT COUNT(1) AS total
      FROM ${this.tableName()}
      WHERE ${this.columnName('id')} = @id;
    `)

    return Number(result.recordset[0]?.total || 0) > 0
  }

  async create(payload) {
    const now = new Date().toISOString()
    const record = {
      ...payload,
      id: payload.id || randomUUID(),
    }

    if (this.fields.includes('createdAt') && !record.createdAt) {
      record.createdAt = now
    }

    if (this.fields.includes('updatedAt') && !record.updatedAt) {
      record.updatedAt = now
    }

    const columns = this.writableFields().filter((field) => record[field] !== undefined)
    const request = (await getPool()).request()

    for (const field of columns) {
      this.bindInput(request, field, record[field])
    }

    await request.query(`
      INSERT INTO ${this.tableName()} (${columns.map((field) => this.columnName(field)).join(', ')})
      VALUES (${columns.map((field) => `@${field}`).join(', ')});
    `)

    return this.findById(record.id)
  }

  async update(id, payload) {
    const current = await this.findById(id)

    if (!current) {
      throw new AppError(`${this.resource.name} no encontrado`, 404)
    }

    const updatePayload = { ...payload }

    if (this.fields.includes('updatedAt')) {
      updatePayload.updatedAt = new Date().toISOString()
    }

    const columns = this.writableFields()
      .filter((field) => field !== 'id')
      .filter((field) => updatePayload[field] !== undefined)

    if (columns.length === 0) {
      return current
    }

    const request = (await getPool()).request()
    request.input('id', sql.NVarChar(80), id)

    for (const field of columns) {
      this.bindInput(request, field, updatePayload[field])
    }

    await request.query(`
      UPDATE ${this.tableName()}
      SET ${columns.map((field) => `${this.columnName(field)} = @${field}`).join(', ')}
      WHERE ${this.columnName('id')} = @id AND deleted_at IS NULL;
    `)

    return this.findById(id)
  }

  async updateAny(id, payload) {
    const updatePayload = { ...payload }

    if (this.fields.includes('updatedAt')) {
      updatePayload.updatedAt = updatePayload.updatedAt || new Date().toISOString()
    }

    const columns = this.writableFields()
      .filter((field) => field !== 'id')
      .filter((field) => updatePayload[field] !== undefined)

    if (columns.length === 0) {
      return this.findById(id)
    }

    const request = (await getPool()).request()
    request.input('id', sql.NVarChar(80), id)

    for (const field of columns) {
      this.bindInput(request, field, updatePayload[field])
    }

    await request.query(`
      UPDATE ${this.tableName()}
      SET ${columns.map((field) => `${this.columnName(field)} = @${field}`).join(', ')},
          deleted_at = NULL
      WHERE ${this.columnName('id')} = @id;
    `)

    return this.findById(id)
  }

  async remove(id) {
    const current = await this.findById(id)

    if (!current) {
      throw new AppError(`${this.resource.name} no encontrado`, 404)
    }

    const request = (await getPool()).request()
    request.input('id', sql.NVarChar(80), id)

    await request.query(`
      UPDATE ${this.tableName()}
      SET deleted_at = SYSUTCDATETIME()
      WHERE ${this.columnName('id')} = @id AND deleted_at IS NULL;
    `)

    return current
  }

  async upsertMany(records) {
    const saved = []

    for (const record of records) {
      const exists = record.id ? await this.existsById(record.id) : false
      saved.push(exists ? await this.updateAny(record.id, record) : await this.create(record))
    }

    return saved
  }

  async countBy(filters = {}) {
    const request = (await getPool()).request()
    const clauses = ['deleted_at IS NULL']

    Object.entries(filters).forEach(([field, value]) => {
      if (!this.fields.includes(field) || value === undefined || value === null || value === '') {
        return
      }

      request.input(field, value)
      clauses.push(`${this.columnName(field)} = @${field}`)
    })

    const result = await request.query(`
      SELECT COUNT(1) AS total
      FROM ${this.tableName()}
      WHERE ${clauses.join(' AND ')};
    `)

    return Number(result.recordset[0]?.total || 0)
  }

  async count(query) {
    const request = (await getPool()).request()
    const where = this.buildWhereClause(request, query)

    const result = await request.query(`
      SELECT COUNT(1) AS total
      FROM ${this.tableName()}
      ${where.sql};
    `)

    return Number(result.recordset[0]?.total || 0)
  }

  buildWhereClause(request, query) {
    const clauses = ['deleted_at IS NULL']
    const search = String(query.search || query.query || '').trim()

    if (search && this.resource.searchableFields.length > 0) {
      request.input('search', sql.NVarChar(255), `%${search}%`)
      clauses.push(`(${this.resource.searchableFields.map((field) => `${this.columnName(field)} LIKE @search`).join(' OR ')})`)
    }

    for (const field of this.resource.filterFields) {
      const value = query[field]

      if (value === undefined || value === null || value === '' || value === 'all') {
        continue
      }

      request.input(`filter_${field}`, value)
      clauses.push(`${this.columnName(field)} = @filter_${field}`)
    }

    return { sql: `WHERE ${clauses.join(' AND ')}` }
  }

  bindInput(request, field, value) {
    const preparedValue = this.jsonFields.has(field) && value !== null && value !== undefined
      ? JSON.stringify(value)
      : value

    if (preparedValue === null || preparedValue === undefined) {
      request.input(field, sql.NVarChar(sql.MAX), null)
      return
    }

    request.input(field, preparedValue)
  }

  fromDb(row) {
    const record = {}

    for (const field of this.fields) {
      const value = row[field]

      if (this.jsonFields.has(field)) {
        record[field] = parseJson(value)
        continue
      }

      record[field] = value instanceof Date ? value.toISOString() : value
    }

    return record
  }

  writableFields() {
    return this.fields
  }

  safeSortField(field) {
    const allowed = new Set([...this.resource.sortFields, ...this.fields])

    if (field && allowed.has(field)) {
      return field
    }

    if (this.fields.includes(this.resource.defaultSort)) {
      return this.resource.defaultSort
    }

    return 'id'
  }

  selectColumns(alias) {
    return this.fields
      .map((field) => `${alias ? `${alias}.` : ''}${this.columnName(field)} AS [${field}]`)
      .join(', ')
  }

  tableName() {
    return `[dbo].[${this.resource.table}]`
  }

  columnName(field) {
    return `[${this.resource.fieldMap?.[field] || toSnakeCase(field)}]`
  }
}

function parseJson(value) {
  if (value === null || value === undefined || value === '') {
    return []
  }

  if (typeof value !== 'string') {
    return value
  }

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}
