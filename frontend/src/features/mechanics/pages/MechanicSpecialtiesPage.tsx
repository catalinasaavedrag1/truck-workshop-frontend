import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, UserCheck, Wrench } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { mechanicsMock } from '../../../mocks/mechanics.mock'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { Modal } from '../../../shared/components/Modal/Modal'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { userRoleAssignmentsMock } from '../../permissions/mocks/permissions.mock'
import type { UserRoleAssignment } from '../../permissions/types/permission.types'
import { MechanicSpecialtyAssignmentForm } from '../components/MechanicSpecialtyAssignmentForm'
import { MechanicSpecialtyForm } from '../components/MechanicSpecialtyForm'
import { MechanicSpecialtyTable } from '../components/MechanicSpecialtyTable'
import styles from '../components/MechanicView.module.css'
import { mechanicSpecialtiesMock } from '../mocks/mechanicSpecialties.mock'
import type { Mechanic, MechanicSpecialty } from '../types/mechanic.types'

export function MechanicSpecialtiesPage() {
  const [savedSpecialties, setSavedSpecialties] = useState<MechanicSpecialty[]>([])
  const [savedMechanics, setSavedMechanics] = useState<Mechanic[]>([])
  const [editingSpecialty, setEditingSpecialty] = useState<MechanicSpecialty | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { data: specialtyData, isLoading: specialtiesLoading } = useResourceList<MechanicSpecialty>(
    '/mechanic-specialties',
    mechanicSpecialtiesMock,
    { order: 'asc', sort: 'name' },
  )
  const { data: mechanicData } = useResourceList<Mechanic>('/mechanics', mechanicsMock, { order: 'asc', sort: 'name' })
  const { data: users, isLoading: usersLoading } = useResourceList<UserRoleAssignment>(
    '/permissions/user-roles',
    userRoleAssignmentsMock,
    { order: 'asc', roleCode: 'MECANICO', sort: 'userName' },
  )

  const specialties = useMemo(() => mergeById(specialtyData, savedSpecialties), [savedSpecialties, specialtyData])
  const mechanics = useMemo(() => mergeById(mechanicData, savedMechanics), [mechanicData, savedMechanics])
  const mechanicUsers = useMemo(() => users.filter((user) => user.roleCode === 'MECANICO'), [users])
  const assignedCountBySpecialtyId = useMemo(() => {
    const counter = new Map<string, number>()

    mechanics.forEach((mechanic) => {
      if (!mechanic.specialtyId) {
        return
      }

      counter.set(mechanic.specialtyId, (counter.get(mechanic.specialtyId) || 0) + 1)
    })

    return counter
  }, [mechanics])

  const stats = {
    active: specialties.filter((specialty) => specialty.status === 'active').length,
    assignedUsers: mechanics.filter((mechanic) => mechanic.userId && mechanic.specialtyId).length,
    pendingUsers: Math.max(0, mechanicUsers.length - mechanics.filter((mechanic) => mechanic.userId && mechanic.specialtyId).length),
    total: specialties.length,
  }

  const handleSpecialtySaved = (specialty: MechanicSpecialty) => {
    setSavedSpecialties((current) => [specialty, ...current.filter((item) => item.id !== specialty.id)])
    setIsCreateOpen(false)
    setEditingSpecialty(null)
  }

  const handleMechanicSaved = (mechanic: Mechanic) => {
    setSavedMechanics((current) => [mechanic, ...current.filter((item) => item.id !== mechanic.id)])
  }

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <>
              <Link to={ROUTES.mechanics}>
                <Button icon={<ArrowLeft size={18} />} variant="secondary">
                  Volver a mecanicos
                </Button>
              </Link>
              <Button icon={<Plus size={18} />} onClick={() => setIsCreateOpen(true)}>
                Nueva especialidad
              </Button>
            </>
          }
          description="Catalogo tecnico para ordenar capacidades del taller y asignarlas solo a usuarios con perfil MECANICO."
          title="Especialidades mecanicas"
        />

        <div className={styles.summaryGrid}>
          <SummaryItem helper="catalogo tecnico" icon={<Wrench size={18} />} label="Especialidades" value={stats.total} />
          <SummaryItem helper="disponibles para asignar" icon={<Wrench size={18} />} label="Activas" value={stats.active} />
          <SummaryItem helper="usuarios mecanicos vinculados" icon={<UserCheck size={18} />} label="Asignadas" value={stats.assignedUsers} />
          <SummaryItem helper="usuarios MECANICO sin especialidad" icon={<UserCheck size={18} />} label="Pendientes" value={stats.pendingUsers} />
        </div>

        <div className={styles.specialtyGrid}>
          <Card>
            <div className="stack">
              <div className={styles.sectionHeader}>
                <div>
                  <h2>Catalogo de especialidades</h2>
                  <p>Define capacidades tecnicas reutilizables para agenda, casos y asignaciones.</p>
                </div>
              </div>
              <MechanicSpecialtyTable
                assignedCountBySpecialtyId={assignedCountBySpecialtyId}
                isLoading={specialtiesLoading}
                onEdit={setEditingSpecialty}
                specialties={specialties}
              />
            </div>
          </Card>

          <Card>
            <div className="stack">
              <div className={styles.sectionHeader}>
                <div>
                  <h2>Asignar a usuario mecanico</h2>
                  <p>Vincula un usuario con rol MECANICO a una especialidad y deja creada su ficha tecnica.</p>
                </div>
              </div>
              <MechanicSpecialtyAssignmentForm
                mechanics={mechanics}
                onSaved={handleMechanicSaved}
                specialties={specialties}
                users={users}
              />
              {usersLoading ? <p className="muted-text">Cargando usuarios con perfil mecanico...</p> : null}
            </div>
          </Card>
        </div>
      </div>

      <Modal onClose={() => setIsCreateOpen(false)} open={isCreateOpen} title="Crear especialidad">
        <MechanicSpecialtyForm onCancel={() => setIsCreateOpen(false)} onSaved={handleSpecialtySaved} />
      </Modal>
      <Modal onClose={() => setEditingSpecialty(null)} open={Boolean(editingSpecialty)} title="Editar especialidad">
        <MechanicSpecialtyForm
          onCancel={() => setEditingSpecialty(null)}
          onSaved={handleSpecialtySaved}
          specialty={editingSpecialty}
        />
      </Modal>
    </PageContainer>
  )
}

interface SummaryItemProps {
  helper: string
  icon: ReactNode
  label: string
  value: number | string
}

function SummaryItem({ helper, icon, label, value }: SummaryItemProps) {
  return (
    <div className={styles.summaryItem}>
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
      <span className={styles.helperText}>{helper}</span>
    </div>
  )
}

function mergeById<T extends { id: string }>(backendData: T[], localData: T[]) {
  const localById = new Map(localData.map((item) => [item.id, item]))

  return [
    ...backendData.filter((item) => !localById.has(item.id)),
    ...localData,
  ]
}
