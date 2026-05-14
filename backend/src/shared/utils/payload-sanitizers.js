const DEFAULT_IMMUTABLE_FIELDS = ['createdAt', 'createdBy', 'id']

export function stripImmutableFields(payload, extraFields = []) {
  const sanitizedPayload = { ...(payload || {}) }

  for (const field of [...DEFAULT_IMMUTABLE_FIELDS, ...extraFields]) {
    delete sanitizedPayload[field]
  }

  return sanitizedPayload
}
