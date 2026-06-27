import { randomUUID } from 'node:crypto'
import { env } from '../../config/env.js'
import { roleResource, userRoleAssignmentResource } from '../../config/resources.js'
import { createRepository } from '../../shared/data/repository-factory.js'
import { AppError } from '../../shared/errors/app-error.js'
import { signJwt } from '../../shared/security/jwt.js'
import { verifyPassword } from '../../shared/security/password.js'

const defaultDevelopmentPasswordHash =
  'pbkdf2-sha256$210000$truck-workshop-dev$3U-e7YzJ6hv9dqURDvjHuWh1IYjePGhumCRKcD7TaDI'

const developmentUsers = [
  {
    email: env.auth.devLoginEmail,
    id: 'user-001',
    name: 'Admin Taller',
    passwordHash: env.auth.devLoginPasswordHash || defaultDevelopmentPasswordHash,
    permissions: ['*'],
    role: 'ADMIN',
    roleName: 'Administrador',
  },
  {
    // Usuario admin de demo: login "admin" / "1234" (hash PBKDF2 de '1234').
    email: 'admin',
    id: 'user-fernando-gonzalez',
    name: 'Fernando González',
    passwordHash: 'pbkdf2-sha256$210000$admin-demo-1234$6vkMSPnnPSlbhS8y39xvtrIbXdr6rscrtbE4HnGKAzA',
    permissions: ['*'],
    role: 'ADMIN',
    roleName: 'Administrador',
  },
]

export class AuthService {
  constructor() {
    this.roles = createRepository(roleResource)
    this.userRoles = createRepository(userRoleAssignmentResource)
  }

  async login(credentials) {
    const email = String(credentials.email || '').trim().toLowerCase()
    const password = String(credentials.password || '')
    const dbUser = await this.findDatabaseUser(email)
    const fallbackUser = env.auth.allowDevelopmentLogin
      ? developmentUsers.find((item) => item.email.toLowerCase() === email)
      : null
    const user = dbUser || fallbackUser

    if (!user || user.isActive === false || !this.verifyUserPassword(user, password)) {
      throw new AppError('Credenciales invalidas', 401)
    }

    const tokenPayload = {
      email: user.email,
      jti: randomUUID(),
      name: user.name,
      permissions: user.permissions || [],
      role: user.role,
      roleName: user.roleName || user.role,
      sub: user.id,
    }
    const token = signJwt(tokenPayload, {
      expiresInSeconds: env.auth.jwtExpiresInSeconds,
      secret: env.jwtSecret,
    })

    return {
      expiresAt: new Date(Date.now() + env.auth.jwtExpiresInSeconds * 1000).toISOString(),
      token,
      user: {
        email: user.email,
        id: user.id,
        name: user.name,
        permissions: user.permissions || [],
        role: user.role,
        roleName: user.roleName || user.role,
      },
    }
  }

  verifyUserPassword(user, password) {
    if (verifyPassword(password, user.passwordHash)) {
      return true
    }

    return false
  }

  async findDatabaseUser(email) {
    const usersResult = await this.userRoles.findAll({ limit: 100, search: email })
    const userRole = usersResult.data.find((item) => String(item.email || '').toLowerCase() === email)

    if (!userRole) {
      return null
    }

    const rolesResult = await this.roles.findAll({ code: userRole.roleCode, limit: 100 })
    const role = rolesResult.data.find((item) => item.code === userRole.roleCode)

    return {
      email: userRole.email,
      id: userRole.userId,
      isActive: userRole.isActive,
      name: userRole.userName,
      passwordHash: userRole.passwordHash,
      permissions: role?.permissions || [],
      role: userRole.roleCode,
      roleName: role?.name || userRole.roleCode,
    }
  }
}
