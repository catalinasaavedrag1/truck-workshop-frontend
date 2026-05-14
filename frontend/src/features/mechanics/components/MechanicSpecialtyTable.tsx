import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import type { MechanicSpecialty } from '../types/mechanic.types'
import styles from './MechanicView.module.css'

interface MechanicSpecialtyTableProps {
  assignedCountBySpecialtyId: Map<string, number>
  isLoading?: boolean
  onEdit: (specialty: MechanicSpecialty) => void
  specialties: MechanicSpecialty[]
}

export function MechanicSpecialtyTable({
  assignedCountBySpecialtyId,
  isLoading = false,
  onEdit,
  specialties,
}: MechanicSpecialtyTableProps) {
  const columns: TableColumn<MechanicSpecialty>[] = [
    {
      header: 'Especialidad',
      key: 'name',
      render: (item) => (
        <div className={styles.mechanicCell}>
          <strong>{item.name}</strong>
          <span className="muted-text">{item.code} - {item.category}</span>
        </div>
      ),
      sortValue: (item) => item.name,
    },
    {
      header: 'Uso operacional',
      key: 'description',
      render: (item) => item.description || 'Sin descripcion',
      sortValue: (item) => item.description,
    },
    {
      align: 'right',
      header: 'Mecanicos',
      key: 'assigned',
      render: (item) => (
        <div className={styles.mechanicCell}>
          <strong>{assignedCountBySpecialtyId.get(item.id) || 0}</strong>
          <span className="muted-text">usuarios asignados</span>
        </div>
      ),
      sortValue: (item) => assignedCountBySpecialtyId.get(item.id) || 0,
    },
    {
      header: 'Estado',
      key: 'status',
      render: (item) => <Badge tone={item.status === 'active' ? 'success' : 'neutral'}>{item.status === 'active' ? 'Activa' : 'Inactiva'}</Badge>,
      sortValue: (item) => item.status,
    },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <Button onClick={() => onEdit(item)} size="sm" type="button" variant="secondary">
          Editar
        </Button>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={specialties}
      density="compact"
      enableSearch
      emptyDescription="Crea especialidades para asignarlas a usuarios con rol MECANICO y ordenar la carga tecnica."
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Editar especialidad ${item.name}`}
      initialSort={{ direction: 'asc', key: 'name' }}
      isLoading={isLoading}
      onRowClick={onEdit}
      searchPlaceholder="Buscar especialidad, codigo, categoria o descripcion"
    />
  )
}
