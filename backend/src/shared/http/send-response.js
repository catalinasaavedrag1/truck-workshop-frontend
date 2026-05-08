export function sendResponse(response, payload, statusCode = 200) {
  const requestId = response.locals.requestId
  const responsePayload = requestId
    ? {
        ...payload,
        meta: {
          ...(payload.meta || {}),
          requestId,
        },
      }
    : payload

  response.status(statusCode).json(responsePayload)
}
