import { AppError } from '../errors/app-error.js'

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    next(error)
    return
  }

  const isKnownError = error instanceof AppError
  const explicitStatusCode = Number(error.statusCode || error.status)
  const isExplicitClientError =
    Number.isInteger(explicitStatusCode) && explicitStatusCode >= 400 && explicitStatusCode < 500
  const statusCode = isKnownError ? error.statusCode : isExplicitClientError ? explicitStatusCode : 500
  const requestId = response.locals.requestId || request.requestId
  const payload = {
    error: {
      details: isKnownError ? error.details : undefined,
      message: isKnownError || isExplicitClientError ? error.message : 'Error interno del servidor',
      path: request.originalUrl,
      requestId,
      statusCode,
    },
  }

  if (process.env.NODE_ENV !== 'production' && !isKnownError) {
    payload.error.stack = error.stack
  }

  response.status(statusCode).json(payload)
}
