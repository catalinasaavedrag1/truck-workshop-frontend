export type RoleCode =
  | 'ADMIN'
  | 'JEFE_TALLER'
  | 'RECEPCION'
  | 'MECANICO'
  | 'ENCARGADO_BODEGA'
  | 'COMPRAS'
  | 'SUPERVISOR'
  | (string & {})

export type PermissionKey =
  | 'cases.view'
  | 'cases.create'
  | 'cases.diagnose'
  | 'cases.assign'
  | 'cases.escalate'
  | 'cases.close'
  | 'drivers.manage'
  | 'warehouse.manage'
  | 'purchaseOrders.create'
  | 'purchaseOrders.approve'
  | 'permissions.manage'
  | 'reports.view'
  | 'freight.requests.view'
  | 'freight.requests.create'
  | 'freight.quotes.create'
  | 'freight.quotes.send'
  | 'freight.quotes.decide'
  | 'freight.assign'
  | 'freight.assignments.view'
  | 'fleet.view'
  | 'fleet.manage'
  | 'fleet.availability'
  | 'fleet.maintenance'
  | 'fleet.documents'
  | 'fleet.fuel'
  | 'fleet.costs'
  | 'fleet.incidents'
  | 'fleet.telematics'

export interface PermissionDefinition {
  key: PermissionKey
  label: string
  module: string
}

export interface PermissionModule {
  id: string
  label: string
  permissions: PermissionDefinition[]
}

export interface Role {
  id: string
  code: RoleCode
  name: string
  description: string
  permissions: PermissionKey[]
  createdAt?: string
  updatedAt?: string
  usersCount?: number
}

export interface UserRoleAssignment {
  id: string
  userId: string
  userName: string
  email: string
  hasPassword?: boolean
  isActive?: boolean
  password?: string
  passwordHash?: string
  passwordUpdatedAt?: string
  roleCode: RoleCode
  createdAt?: string
  permissionsCount?: number
  roleName?: string
  updatedAt?: string
}
