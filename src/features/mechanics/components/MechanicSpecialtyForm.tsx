import type { FormEvent } from 'react'
import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { createMechanicSpecialty, updateMechanicSpecialty } from '../services/mechanics.service'
import type { MechanicSpecialty } from '../types/mechanic.types'

const statusOptions = [
  { label: 'Activa', value: 'active' },
  { label: 'Inactiva', value: 'inactive' },
]

interface MechanicSpecialtyFormProps {
  onCancel?: () => void
  onSaved?: (specialty: MechanicSpecialty) => void
  specialty?: MechanicSpecialty | null
}

export function MechanicSpecialtyForm({ onCancel, onSaved, specialty }: MechanicSpecialtyFormProps) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    setErrorMessage('')
    setSavedMessage('')
    setIsSaving(true)

    try {
      const payload = {
        category: String(formData.get('category') || '').trim(),
        code: String(formData.get('code') || '').trim().toUpperCase(),
        createdBy: specialty?.createdBy || 'Admin Taller',
        description: String(formData.get('description') || '').trim(),
        name: String(formData.get('name') || '').trim(),
        status: String(formData.get('status') || 'active') as MechanicSpecialty['status'],
        updatedBy: 'Admin Taller',
      }
      const savedSpecialty = specialty
        ? await updateMechanicSpecialty(specialty.id, payload)
        : await createMechanicSpecialty(payload)

      setSavedMessage(`Especialidad ${savedSpecialty.name} guardada.`)
      onSaved?.(savedSpecialty)

      if (!specialty) {
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
      {errorMessage ? <ErrorState description={errorMessage} title="No se pudo guardar la especialidad" /> : null}
      <Input defaultValue={specialty?.name || ''} label="Nombre" name="name" placeholder="Motor diesel" required />
      <Input defaultValue={specialty?.code || ''} label="Codigo" name="code" placeholder="MOT-DIESEL" required />
      <Input defaultValue={specialty?.category || ''} label="Categoria operacional" name="category" placeholder="Mecanica pesada" required />
      <Select defaultValue={specialty?.status || 'active'} label="Estado" name="status" options={statusOptions} />
      <Input
        className="span-2"
        defaultValue={specialty?.description || ''}
        label="Uso operacional"
        name="description"
        placeholder="Diagnostico, reparacion y pruebas asociadas a esta especialidad"
      />
      <div className="span-2">
        <Button disabled={isSaving} icon={<Save size={18} />} type="submit">
          {isSaving ? 'Guardando...' : specialty ? 'Actualizar especialidad' : 'Crear especialidad'}
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
