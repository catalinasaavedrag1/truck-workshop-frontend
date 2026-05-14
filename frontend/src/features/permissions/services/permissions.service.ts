import { createResource, deleteResource, listResource, updateResource } from '../../../shared/services/resourceApi'
import type { Role, UserRoleAssignment } from '../types/permission.types'
import { rolesMock, userRoleAssignmentsMock } from '../mocks/permissions.mock'

export const permissionsApi = {
  createRole: (payload: Omit<Role, 'id'>) => createResource<Role, Omit<Role, 'id'>>('/permissions/roles', payload),
  createUser: (payload: Partial<UserRoleAssignment>) =>
    createResource<UserRoleAssignment, Partial<UserRoleAssignment>>('/permissions/user-roles', payload),
  deleteRole: (id: string) => deleteResource<Role>('/permissions/roles', id),
  deleteUser: (id: string) => deleteResource<UserRoleAssignment>('/permissions/user-roles', id),
  listRoles: () => listResource<Role>('/permissions/roles', rolesMock, { order: 'asc', sort: 'name' }),
  listUsers: () => listResource<UserRoleAssignment>('/permissions/user-roles', userRoleAssignmentsMock, { order: 'asc', sort: 'userName' }),
  updateRole: (id: string, payload: Partial<Role>) => updateResource<Role, Partial<Role>>('/permissions/roles', id, payload),
  updateUser: (id: string, payload: Partial<UserRoleAssignment>) =>
    updateResource<UserRoleAssignment, Partial<UserRoleAssignment>>('/permissions/user-roles', id, payload),
}
