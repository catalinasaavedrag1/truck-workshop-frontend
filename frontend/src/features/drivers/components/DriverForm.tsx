import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { RutInput } from '../../../shared/components/RutInput/RutInput'
import { Select } from '../../../shared/components/Select/Select'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { formatRut } from '../../../shared/utils/rut'
import { createDriver, updateDriver } from '../services/drivers.service'
import type { Driver, DriverStatus } from '../types/driver.types'

const statusOptions = [
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
]

interface DriverFormProps {
  driver?: Driver
}

export function DriverForm({ driver }: DriverFormProps) {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const payload = {
      caseIds: driver?.caseIds || [],
      company: String(formData.get('company') || '').trim(),
      document: formatRut(String(formData.get('document') || '')),
      license: String(formData.get('license') || '').trim(),
      name: String(formData.get('name') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      status: String(formData.get('status') || 'active') as DriverStatus,
    }

    setIsSaving(true)
    setErrorMessage('')

    try {
      const savedDriver = driver ? await updateDriver(driver.id, payload) : await createDriver(payload)
      navigate(driver ? ROUTES.driverDetail(savedDriver.id) : ROUTES.driverDetail(savedDriver.id))
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {errorMessage ? (
        <div className="span-2">
          <ErrorState description={errorMessage} title="No se pudo guardar el chofer" />
        </div>
      ) : null}
      <Input defaultValue={driver?.name} label="Nombre" name="name" placeholder="Nombre del chofer" required />
      <RutInput defaultValue={driver?.document} label="RUT" name="document" required />
      <Input defaultValue={driver?.phone} label="Telefono" name="phone" placeholder="+56 9 ..." />
      <Input defaultValue={driver?.company} label="Empresa" name="company" placeholder="Transportes..." required />
      <Input defaultValue={driver?.license} label="Licencia" name="license" placeholder="A5 vigente" required />
      <Select defaultValue={driver?.status || 'active'} label="Estado" name="status" options={statusOptions} />
      <div className="span-2 inline-actions">
        <Button disabled={isSaving} icon={<Save size={18} />} type="submit">
          {isSaving ? 'Guardando...' : 'Guardar chofer'}
        </Button>
        <Button disabled={isSaving} onClick={() => navigate(ROUTES.drivers)} type="button" variant="secondary">
          Cancelar
        </Button>
      </div>
    </form>
  )
}
