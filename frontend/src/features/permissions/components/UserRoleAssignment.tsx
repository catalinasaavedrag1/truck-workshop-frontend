import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import type { UserRoleAssignment as UserRoleAssignmentModel } from '../types/permission.types'
import styles from './PermissionsModule.module.css'

interface UserRoleAssignmentProps {
  assignments: UserRoleAssignmentModel[]
  onDelete?: (assignment: UserRoleAssignmentModel) => void
  onSelect?: (assignment: UserRoleAssignmentModel) => void
  selectedUserId?: string
}

export function UserRoleAssignment({ assignments, onDelete, onSelect, selectedUserId }: UserRoleAssignmentProps) {
  const columns: TableColumn<UserRoleAssignmentModel>[] = [
    {
      header: 'Usuario',
      key: 'userName',
      render: (item) => (
        <div className={styles.userCell}>
          <strong>{item.userName}</strong>
          <span className={styles.userMeta}>{item.email}</span>
        </div>
      ),
    },
    {
      header: 'Perfil',
      key: 'roleCode',
      render: (item) => (
        <div className={styles.userCell}>
          <Badge tone={item.roleCode === 'ADMIN' ? 'danger' : item.roleCode === 'MECANICO' ? 'success' : 'info'}>{item.roleCode}</Badge>
          <span className={styles.permissionCount}>{item.permissionsCount ?? 0} permisos</span>
        </div>
      ),
    },
    {
      align: 'right',
      header: 'Acciones',
      key: 'actions',
      render: (item) => (
        <div className={styles.actionGroup} data-row-click-ignore>
          <Button onClick={() => onSelect?.(item)} size="sm" type="button" variant={selectedUserId === item.id ? 'primary' : 'secondary'}>
            Editar
          </Button>
          <Button onClick={() => onDelete?.(item)} size="sm" type="button" variant="ghost">
            Eliminar
          </Button>
        </div>
      ),
      sortable: false,
    },
  ]

  return (
    <Table
      columns={columns}
      data={assignments}
      density="compact"
      enableSearch
      getRowKey={(item) => item.id}
      onRowClick={onSelect}
      searchPlaceholder="Buscar usuario, email o rol"
    />
  )
}
