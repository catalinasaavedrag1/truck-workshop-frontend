import { randomUUID } from 'node:crypto'
import { roleResource, userRoleAssignmentResource } from '../../config/resources.js'
import { createRepository } from '../../shared/data/repository-factory.js'
import { AppError } from '../../shared/errors/app-error.js'

const developmentUsers = [
  {
    email: 'admin@truckworkshop.cl',
    id: 'user-001',
    name: 'Admin Taller',
    password: 'truckworkshop',
    role: 'ADMIN',
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
    const expectedPassword = process.env.DEV_LOGIN_PASSWORD || 'truckworkshop'
    const dbUser = await this.findDatabaseUser(email)
    const fallbackUser = developmentUsers.find((item) => item.email.toLowerCase() === email)
    const user = dbUser || fallbackUser

    if (!user || password !== (user.password || expectedPassword)) {
      throw new AppError('Credenciales invalidas', 401)
    }

    return {
      token: `session-${randomUUID()}`,
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

  async findDatabaseUser(email) {
    const usersResult = await this.userRoles.findAll({ limit: 100, search: email })
    const userRole = usersResult.data.find((item) => item.email.toLowerCase() === email)

    if (!userRole) {
      return null
    }

    const rolesResult = await this.roles.findAll({ code: userRole.roleCode, limit: 100 })
    const role = rolesResult.data.find((item) => item.code === userRole.roleCode)

    return {
      email: userRole.email,
      id: userRole.userId,
      name: userRole.userName,
      permissions: role?.permissions || [],
      role: userRole.roleCode,
      roleName: role?.name || userRole.roleCode,
    }
  }
}
