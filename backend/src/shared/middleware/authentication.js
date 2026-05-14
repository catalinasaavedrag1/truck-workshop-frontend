import { env } from '../../config/env.js'
import { AppError } from '../errors/app-error.js'
import { verifyJwt } from '../security/jwt.js'
import { hasPermission, requiredPermissionForRequest } from '../security/permission-rules.js'

export function authenticateRequest(request, response, next) {
  const token = getBearerToken(request)

  if (!token) {
    if (env.auth.requireAuth) {
      next(new AppError('Autenticacion requerida', 401))
      return
    }

    next()
    return
  }

  try {
    const payload = verifyJwt(token, { secret: env.jwtSecret })
    request.user = {
      email: payload.email,
      id: payload.sub,
      name: payload.name,
      permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
      role: payload.role,
      roleName: payload.roleName,
    }
    response.locals.user = request.user
    next()
  } catch (error) {
    next(error)
  }
}

export function authorizeRequest(request, response, next) {
  if (!env.auth.enforcePermissions) {
    next()
    return
  }

  const permission = requiredPermissionForRequest(request.method, request.path)

  if (hasPermission(request.user, permission)) {
    next()
    return
  }

  next(new AppError('No tienes permisos para ejecutar esta accion', 403, { permission }))
}

function getBearerToken(request) {
  const authorization = String(request.headers.authorization || '').trim()
  const [scheme, token] = authorization.split(/\s+/)

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return ''
  }

  return token
}
