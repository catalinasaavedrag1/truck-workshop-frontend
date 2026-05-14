import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Button } from '../../../shared/components/Button/Button'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { userRoleAssignmentsMock } from '../../permissions/mocks/permissions.mock'
import type { UserRoleAssignment } from '../../permissions/types/permission.types'
import { mechanicSpecialtiesMock } from '../mocks/mechanicSpecialties.mock'
import { createMechanic, updateMechanic } from '../services/mechanics.service'
import type { Mechanic, MechanicSpecialty } from '../types/mechanic.types'

const availabilityOptions = [
  { label: 'Disponible', value: 'available' },
  { label: 'Ocupado', value: 'busy' },
  { label: 'Fuera de turno', value: 'off-shift' },
]

interface MechanicFormProps {
  mechanic?: Mechanic | null
  onCancel?: () => void
  onSaved?: (mechanic: Mechanic) => void
}

export function MechanicForm({ mechanic, onCancel, onSaved }: MechanicFormProps) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const [selectedUserId, setSelectedUserId] = useState(mechanic?.userId || '')
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(mechanic?.specialtyId || '')
  const { data: specialties } = useResourceList<MechanicSpecialty>('/mechanic-specialties', mechanicSpecialtiesMock, {
    order: 'asc',
    sort: 'name',
  })
  const { data: users } = useResourceList<UserRoleAssignment>('/permissions/user-roles', userRoleAssignmentsMock, {
    order: 'asc',
    roleCode: 'MECANICO',
    sort: 'userName',
  })
  const mechanicUsers = useMemo(() => users.filter((user) => user.roleCode === 'MECANICO'), [users])
  const assignableSpecialties = useMemo(
    () => specialties.filter((specialty) => specialty.status === 'active' || specialty.id === mechanic?.specialtyId),
    [mechanic?.specialtyId, specialties],
  )
  const selectedUser = mechanicUsers.find((user) => user.userId === selectedUserId)
  const selectedSpecialty = assignableSpecialties.find((specialty) => specialty.id === selectedSpecialtyId)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    setErrorMessage('')
    setSavedMessage('')
    setIsSaving(true)

    try {
      const payload = {
        availability: String(formData.get('availability') || 'available') as Mechanic['availability'],
        email: selectedUser?.email || '',
        maxCases: Number(formData.get('maxCases') || 4),
        name: String(formData.get('name') || selectedUser?.userName || '').trim(),
        roleCode: selectedUser ? 'MECANICO' : '',
        shift: String(formData.get('shift') || '').trim(),
        specialty: selectedSpecialty?.name || String(formData.get('specialty') || '').trim(),
        specialtyId: selectedSpecialty?.id || '',
        userId: selectedUser?.userId || '',
        userName: selectedUser?.userName || '',
      }
      const savedMechanic = mechanic
        ? await updateMechanic(mechanic.id, payload)
        : await createMechanic(payload)

      setSavedMessage(`Mecanico ${savedMechanic.name} guardado en backend.`)
      onSaved?.(savedMechanic)

      if (!mechanic) {
        form.reset()
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {errorMessage ? <ErrorState description={errorMessage} title="No se pudo guardar el mecanico" /> : null}
      <Select
        label="Usuario con perfil MECANICO"
        name="userId"
        onChange={(event) => setSelectedUserId(event.target.value)}
        options={[
          { label: 'Sin usuario vinculado', value: '' },
          ...mechanicUsers.map((user) => ({ label: `${user.userName} - ${user.email}`, value: user.userId })),
        ]}
        value={selectedUserId}
      />
      <Select
        label="Especialidad"
        name="specialtyId"
        onChange={(event) => setSelectedSpecialtyId(event.target.value)}
        options={[
          { label: 'Sin especialidad', value: '' },
          ...assignableSpecialties.map((specialty) => ({ label: `${specialty.name} - ${specialty.category}`, value: specialty.id })),
        ]}
        value={selectedSpecialtyId}
      />
      <Input key={`name-${selectedUserId}`} defaultValue={mechanic?.name || selectedUser?.userName || ''} label="Nombre" name="name" required />
      <Input defaultValue={mechanic?.shift || ''} label="Turno" name="shift" placeholder="08:00 - 17:00" />
      <Input
        defaultValue={String(mechanic?.maxCases || 4)}
        label="Capacidad de casos"
        min={1}
        max={20}
        name="maxCases"
        required
        type="number"
      />
      <Select
        defaultValue={mechanic?.availability || 'available'}
        label="Disponibilidad"
        name="availability"
        options={availabilityOptions}
      />
      <div className="span-2">
        <Button disabled={isSaving} type="submit">
          {isSaving ? 'Guardando...' : mechanic ? 'Actualizar mecanico' : 'Crear mecanico'}
        </Button>
        {onCancel ? (
          <Button disabled={isSaving} onClick={onCancel} type="button" variant="secondary">
            Cancelar
          </Button>
        ) : null}
        {savedMessage ? <p className="muted-text">{savedMessage}</p> : null}
      </div>
    </form>
  )
}
