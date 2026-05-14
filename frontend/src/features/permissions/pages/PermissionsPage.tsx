import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { RefreshCw, ShieldCheck, UserCheck, Users } from 'lucide-react'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { PermissionMatrix } from '../components/PermissionMatrix'
import styles from '../components/PermissionsModule.module.css'
import { RoleForm } from '../components/RoleForm'
import { RoleTable } from '../components/RoleTable'
import { UserRoleAssignment } from '../components/UserRoleAssignment'
import { UserRoleForm } from '../components/UserRoleForm'
import { permissionModulesMock } from '../mocks/permissions.mock'
import { permissionsApi } from '../services/permissions.service'
import type { Role, UserRoleAssignment as UserRoleAssignmentModel } from '../types/permission.types'

type ActivePanel = 'users' | 'profiles'

export function PermissionsPage() {
  const [activePanel, setActivePanel] = useState<ActivePanel>('users')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserRoleAssignmentModel | null>(null)
  const [users, setUsers] = useState<UserRoleAssignmentModel[]>([])

  useEffect(() => {
    let isMounted = true

    Promise.all([permissionsApi.listRoles(), permissionsApi.listUsers()])
      .then(([rolesData, usersData]) => {
        if (isMounted) {
          setRoles(rolesData)
          setUsers(usersData)
          setErrorMessage('')
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(getApiErrorMessage(error))
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [refreshKey])

  const stats = useMemo(() => {
    const adminUsers = users.filter((user) => user.roleCode === 'ADMIN').length
    const mechanicUsers = users.filter((user) => user.roleCode === 'MECANICO').length
    const rolesWithoutUsers = roles.filter((role) => (role.usersCount ?? 0) === 0).length

    return { adminUsers, mechanicUsers, rolesWithoutUsers }
  }, [roles, users])

  const refresh = () => {
    setIsLoading(true)
    setRefreshKey((current) => current + 1)
  }

  const handleSaved = () => {
    setSelectedRole(null)
    setSelectedUser(null)
    refresh()
  }

  const deleteRole = async (role: Role) => {
    if ((role.usersCount ?? 0) > 0 || !window.confirm(`Eliminar perfil ${role.name}?`)) {
      return
    }

    try {
      await permissionsApi.deleteRole(role.id)
      if (selectedRole?.id === role.id) {
        setSelectedRole(null)
      }
      refresh()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  const deleteUser = async (user: UserRoleAssignmentModel) => {
    if (!window.confirm(`Eliminar usuario ${user.userName}?`)) {
      return
    }

    try {
      await permissionsApi.deleteUser(user.id)
      if (selectedUser?.id === user.id) {
        setSelectedUser(null)
      }
      refresh()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  return (
    <PageContainer>
      <PageHeader
        actions={
          <Button icon={<RefreshCw size={18} />} onClick={refresh} type="button" variant="secondary">
            Actualizar
          </Button>
        }
        description="Perfiles, permisos y usuarios operativos conectados al backend."
        title="Usuarios y perfiles"
      />

      {errorMessage ? <ErrorState description={errorMessage} title="No se pudo cargar administracion" /> : null}
      {isLoading ? <LoadingState label="Cargando perfiles y usuarios" /> : null}

      <div className={styles.summaryGrid}>
        <SummaryCard helper="usuarios activos con perfil" icon={<Users size={18} />} label="Usuarios" value={users.length} />
        <SummaryCard helper="perfiles disponibles" icon={<ShieldCheck size={18} />} label="Perfiles" value={roles.length} />
        <SummaryCard helper="usuarios con acceso total" icon={<UserCheck size={18} />} label="Admins" value={stats.adminUsers} />
        <SummaryCard helper="perfiles sin usuarios" icon={<ShieldCheck size={18} />} label="Sin uso" value={stats.rolesWithoutUsers} />
      </div>

      <div className={styles.toolbar}>
        <div className={styles.segmented} role="tablist">
          <button data-active={activePanel === 'users'} onClick={() => setActivePanel('users')} type="button">
            Usuarios
          </button>
          <button data-active={activePanel === 'profiles'} onClick={() => setActivePanel('profiles')} type="button">
            Perfiles
          </button>
        </div>
        <Badge tone={stats.mechanicUsers > 0 ? 'success' : 'warning'}>{stats.mechanicUsers} mecanicos vinculados</Badge>
      </div>

      {activePanel === 'users' ? (
        <div className={styles.layout}>
          <Card>
            <div className="stack">
              <PanelHeader title="Usuarios operativos" subtitle="Cada usuario queda asociado a un unico perfil activo." />
              <UserRoleAssignment assignments={users} onDelete={deleteUser} onSelect={setSelectedUser} selectedUserId={selectedUser?.id} />
            </div>
          </Card>
          <Card className={styles.formCard}>
            <div className="stack">
              <PanelHeader title={selectedUser ? 'Editar usuario' : 'Crear usuario'} subtitle="El perfil define permisos y conexiones con mecanicos." />
              <UserRoleForm onCancel={() => setSelectedUser(null)} onSaved={handleSaved} roles={roles} user={selectedUser} />
            </div>
          </Card>
        </div>
      ) : (
        <div className={styles.layout}>
          <Card>
            <div className="stack">
              <PanelHeader title="Perfiles de acceso" subtitle="Los perfiles agrupan permisos por responsabilidad operacional." />
              <RoleTable onDelete={deleteRole} onSelect={setSelectedRole} roles={roles} selectedRoleId={selectedRole?.id} />
            </div>
          </Card>
          <Card className={styles.formCard}>
            <div className="stack">
              <PanelHeader title={selectedRole ? 'Editar perfil' : 'Crear perfil'} subtitle="Selecciona solo los permisos necesarios para el cargo." />
              <RoleForm modules={permissionModulesMock} onCancel={() => setSelectedRole(null)} onSaved={handleSaved} role={selectedRole} />
            </div>
          </Card>
        </div>
      )}

      <Card>
        <div className="stack">
          <PanelHeader title="Matriz de permisos" subtitle="Referencia rapida de permisos por perfil." />
          <PermissionMatrix modules={permissionModulesMock} roles={roles} />
        </div>
      </Card>
    </PageContainer>
  )
}

interface PanelHeaderProps {
  subtitle: string
  title: string
}

function PanelHeader({ subtitle, title }: PanelHeaderProps) {
  return (
    <div className={styles.panelHeader}>
      <div className={styles.panelTitle}>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  )
}

interface SummaryCardProps {
  helper: string
  icon: ReactNode
  label: string
  value: number
}

function SummaryCard({ helper, icon, label, value }: SummaryCardProps) {
  return (
    <div className={styles.summaryCard}>
      <span>{label}</span>
      <strong>{value}</strong>
      <span>{icon} {helper}</span>
    </div>
  )
}
