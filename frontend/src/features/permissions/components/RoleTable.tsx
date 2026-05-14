import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import type { Role } from '../types/permission.types'
import styles from './PermissionsModule.module.css'

interface RoleTableProps {
  onDelete?: (role: Role) => void
  onSelect?: (role: Role) => void
  roles: Role[]
  selectedRoleId?: string
}

export function RoleTable({ onDelete, onSelect, roles, selectedRoleId }: RoleTableProps) {
  const columns: TableColumn<Role>[] = [
    {
      header: 'Perfil',
      key: 'name',
      render: (item) => (
        <div className={styles.roleCell}>
          <strong>{item.name}</strong>
          <span className={styles.roleMeta}>{item.description || 'Sin descripcion operacional'}</span>
        </div>
      ),
    },
    { header: 'Codigo', key: 'code', render: (item) => <Badge tone="info">{item.code}</Badge> },
    {
      align: 'right',
      header: 'Usuarios',
      key: 'usersCount',
      render: (item) => item.usersCount ?? 0,
      sortValue: (item) => item.usersCount ?? 0,
    },
    { align: 'right', header: 'Permisos', key: 'permissions', render: (item) => item.permissions.length },
    {
      align: 'right',
      header: 'Acciones',
      key: 'actions',
      render: (item) => (
        <div className={styles.actionGroup} data-row-click-ignore>
          <Button onClick={() => onSelect?.(item)} size="sm" type="button" variant={selectedRoleId === item.id ? 'primary' : 'secondary'}>
            Editar
          </Button>
          <Button disabled={(item.usersCount ?? 0) > 0} onClick={() => onDelete?.(item)} size="sm" type="button" variant="ghost">
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
      data={roles}
      density="compact"
      enableSearch
      getRowKey={(item) => item.id}
      onRowClick={onSelect}
      searchPlaceholder="Buscar rol, codigo o descripcion"
    />
  )
}
