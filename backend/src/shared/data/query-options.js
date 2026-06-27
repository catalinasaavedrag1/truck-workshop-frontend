const DEFAULT_PAGE_SIZE = 25
const MAX_PAGE_SIZE = 100

export function parsePaginationOptions(query = {}) {
  const page = clampInteger(query.page, { fallback: 1, max: Number.MAX_SAFE_INTEGER, min: 1 })
  const limit = clampInteger(query.limit, { fallback: DEFAULT_PAGE_SIZE, max: MAX_PAGE_SIZE, min: 1 })

  return {
    limit,
    offset: (page - 1) * limit,
    page,
  }
}

export function parseSortOrder(order) {
  return String(order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc'
}

export function buildPaginationMeta({ limit, page, total }) {
  return {
    limit,
    page,
    total,
    totalPages: Math.ceil(total / limit),
  }
}

export function compareValues(first, second) {
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

function clampInteger(value, { fallback, max, min }) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.min(Math.max(Math.trunc(parsed), min), max)
}
