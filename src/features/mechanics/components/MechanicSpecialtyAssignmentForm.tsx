import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { UserCheck } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import type { UserRoleAssignment } from '../../permissions/types/permission.types'
import { createMechanic, updateMechanic } from '../services/mechanics.service'
import type { Mechanic, MechanicSpecialty } from '../types/mechanic.types'
import styles from './MechanicView.module.css'

const availabilityOptions = [
  { label: 'Disponible', value: 'available' },
  { label: 'Ocupado', value: 'busy' },
  { label: 'Fuera de turno', value: 'off-shift' },
]

interface MechanicSpecialtyAssignmentFormProps {
  mechanics: Mechanic[]
  onSaved?: (mechanic: Mechanic) => void
  specialties: MechanicSpecialty[]
  users: UserRoleAssignment[]
}

export function MechanicSpecialtyAssignmentForm({
  mechanics,
  onSaved,
  specialties,
  users,
}: MechanicSpecialtyAssignmentFormProps) {
  const activeSpecialties = useMemo(() => specialties.filter((specialty) => specialty.status === 'active'), [specialties])
  const mechanicUsers = useMemo(() => users.filter((user) => user.roleCode === 'MECANICO'), [users])
  const [selectedUserId, setSelectedUserId] = useState(mechanicUsers[0]?.userId || '')
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(activeSpecialties[0]?.id || '')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  const selectedUser = mechanicUsers.find((user) => user.userId === selectedUserId)
  const selectedSpecialty = activeSpecialties.find((specialty) => specialty.id === selectedSpecialtyId)
  const existingMechanic = mechanics.find((mechanic) => mechanic.userId === selectedUserId)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedUser || !selectedSpecialty) {
      setErrorMessage('Selecciona un usuario mecanico y una especialidad activa.')
      return
    }

    const formData = new FormData(event.currentTarget)
    setErrorMessage('')
    setSavedMessage('')
    setIsSaving(true)

    try {
      const payload = {
        availability: String(formData.get('availability') || existingMechanic?.availability || 'available') as Mechanic['availability'],
        email: selectedUser.email,
        maxCases: Number(formData.get('maxCases') || existingMechanic?.maxCases || 4),
        name: selectedUser.userName,
        roleCode: 'MECANICO',
        shift: String(formData.get('shift') || existingMechanic?.shift || '').trim(),
        specialty: selectedSpecialty.name,
        specialtyId: selectedSpecialty.id,
        userId: selectedUser.userId,
        userName: selectedUser.userName,
      }
      const savedMechanic = existingMechanic
        ? await updateMechanic(existingMechanic.id, payload)
        : await createMechanic(payload)

      setSavedMessage(`${selectedUser.userName} quedo asignado a ${selectedSpecialty.name}.`)
      onSaved?.(savedMechanic)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {errorMessage ? <ErrorState description={errorMessage} title="No se pudo asignar la especialidad" /> : null}
      <Select
        label="Usuario con perfil MECANICO"
        name="userId"
        onChange={(event) => setSelectedUserId(event.target.value)}
        options={mechanicUsers.map((user) => ({ label: `${user.userName} - ${user.email}`, value: user.userId }))}
        value={selectedUserId}
      />
      <Select
        label="Especialidad"
        name="specialtyId"
        onChange={(event) => setSelectedSpecialtyId(event.target.value)}
        options={activeSpecialties.map((specialty) => ({ label: `${specialty.name} - ${specialty.category}`, value: specialty.id }))}
        value={selectedSpecialtyId}
      />
      <Input key={`shift-${selectedUserId}`} defaultValue={existingMechanic?.shift || '08:00 - 17:00'} label="Turno operativo" name="shift" />
      <Input
        key={`capacity-${selectedUserId}`}
        defaultValue={String(existingMechanic?.maxCases || 4)}
        label="Capacidad casos"
        max={20}
        min={1}
        name="maxCases"
        type="number"
      />
      <Select
        key={`availability-${selectedUserId}`}
        defaultValue={existingMechanic?.availability || 'available'}
        label="Disponibilidad"
        name="availability"
        options={availabilityOptions}
      />
      <div className={styles.assignmentPreview}>
        <strong>{existingMechanic ? 'Actualiza mecanico existente' : 'Crea ficha tecnica'}</strong>
        <span>{selectedUser?.userName || 'Sin usuario'} - {selectedSpecialty?.name || 'Sin especialidad'}</span>
      </div>
      <div className="span-2">
        <Button disabled={isSaving || !selectedUser || !selectedSpecialty} icon={<UserCheck size={18} />} type="submit">
          {isSaving ? 'Asignando...' : 'Asignar especialidad'}
        </Button>
        {savedMessage ? <p className="muted-text">{savedMessage}</p> : null}
      </div>
    </form>
  )
}
