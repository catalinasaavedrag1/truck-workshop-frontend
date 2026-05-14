const ACTOR_HEADER = 'x-user-name'

export function getActorName(request, fallbackFields = []) {
  if (hasValue(request.user?.name)) {
    return String(request.user.name)
  }

  const headerValue = request.get?.(ACTOR_HEADER) || request.headers?.[ACTOR_HEADER]

  if (hasValue(headerValue)) {
    return String(headerValue)
  }

  for (const field of fallbackFields) {
    const payloadValue = request.body?.[field]

    if (hasValue(payloadValue)) {
      return String(payloadValue)
    }
  }

  return 'Sistema'
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== ''
}
