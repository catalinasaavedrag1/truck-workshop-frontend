export type UserRole = string

export interface AuthUser {
  id: string
  name: string
  email: string
  permissions?: string[]
  role: UserRole
  roleName?: string
}

export interface LoginCredentials {
  email: string
  password: string
}
