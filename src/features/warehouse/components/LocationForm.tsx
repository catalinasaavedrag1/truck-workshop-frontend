import type { FormEvent } from 'react'
import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { createWarehouseLocation, updateWarehouseLocation } from '../services/warehouseLocations.service'
import type { WarehouseLocation, WarehouseLocationStatus } from '../types/warehouse.types'

const locationStatusOptions: { label: string; value: WarehouseLocationStatus }[] = [
  { label: 'Activa', value: 'active' },
  { label: 'Llena', value: 'full' },
  { label: 'Mantencion', value: 'maintenance' },
  { label: 'Inactiva', value: 'inactive' },
]

interface LocationFormProps {
  location?: WarehouseLocation | null
  onCancel?: () => void
  onSaved?: (location: WarehouseLocation) => void
}

export function LocationForm({ location, onCancel, onSaved }: LocationFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const payload = {
      aisle: String(formData.get('aisle') || '').trim(),
      capacity: Number(formData.get('capacity') || 0),
      code: String(formData.get('code') || '').trim().toUpperCase(),
      level: String(formData.get('level') || '').trim(),
      name: String(formData.get('name') || '').trim(),
      shelf: String(formData.get('shelf') || '').trim(),
      status: String(formData.get('status') || 'active') as WarehouseLocationStatus,
      zone: String(formData.get('zone') || '').trim().toUpperCase(),
    }

    setIsSaving(true)
    setErrorMessage('')

    try {
      const savedLocation = location
        ? await updateWarehouseLocation(location.id, payload)
        : await createWarehouseLocation(payload)

      onSaved?.(savedLocation)
      event.currentTarget.reset()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="form-grid" key={location?.id || 'new-location'} onSubmit={handleSubmit}>
      {errorMessage ? (
        <div className="span-2">
          <ErrorState description={errorMessage} title="No se pudo guardar la bodega" />
        </div>
      ) : null}
      <Input defaultValue={location?.code} label="Codigo" name="code" placeholder="A-01-01" required />
      <Input defaultValue={location?.name} label="Nombre" name="name" placeholder="Motor alta rotacion" required />
      <Input defaultValue={location?.zone} label="Zona" name="zone" placeholder="A" required />
      <Input defaultValue={location?.aisle} label="Pasillo" name="aisle" placeholder="01" required />
      <Input defaultValue={location?.shelf} label="Estante" name="shelf" placeholder="01" required />
      <Input defaultValue={location?.level} label="Nivel" name="level" placeholder="Medio" required />
      <Input defaultValue={location?.capacity ?? 0} label="Capacidad" min={0} name="capacity" placeholder="120" type="number" />
      <Select defaultValue={location?.status || 'active'} label="Estado" name="status" options={locationStatusOptions} />
      <div className="span-2 inline-actions">
        <Button disabled={isSaving} icon={<Save size={18} />} type="submit">
          {isSaving ? 'Guardando...' : location ? 'Actualizar bodega' : 'Crear bodega'}
        </Button>
        {location ? (
          <Button disabled={isSaving} onClick={onCancel} type="button" variant="secondary">
            Cancelar edicion
          </Button>
        ) : null}
      </div>
    </form>
  )
}
