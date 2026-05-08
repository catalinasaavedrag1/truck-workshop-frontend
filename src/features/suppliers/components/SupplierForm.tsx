import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { createSupplier, updateSupplier } from '../services/suppliers.service'
import type { Supplier, SupplierStatus } from '../types/supplier.types'

interface SupplierFormProps {
  supplier?: Supplier
}

const statusOptions: { label: string; value: SupplierStatus }[] = [
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
]

export function SupplierForm({ supplier }: SupplierFormProps) {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const payload = {
      activePurchaseOrderIds: supplier?.activePurchaseOrderIds || [],
      averageDeliveryDays: Number(formData.get('averageDeliveryDays') || 0),
      categories: parseCategories(String(formData.get('categories') || '')),
      contactName: String(formData.get('contactName') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      name: String(formData.get('name') || '').trim(),
      notes: String(formData.get('notes') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      rating: Number(formData.get('rating') || 0),
      rut: String(formData.get('rut') || '').trim(),
      status: String(formData.get('status') || 'active') as SupplierStatus,
    }

    setIsSaving(true)
    setErrorMessage('')

    try {
      const savedSupplier = supplier ? await updateSupplier(supplier.id, payload) : await createSupplier(payload)
      navigate(ROUTES.supplierDetail(savedSupplier.id))
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
          <ErrorState description={errorMessage} title="No se pudo guardar el proveedor" />
        </div>
      ) : null}
      <Input defaultValue={supplier?.name} label="Proveedor" name="name" placeholder="Nombre comercial" required />
      <Input defaultValue={supplier?.rut} label="RUT" name="rut" placeholder="76.000.000-0" required />
      <Input defaultValue={supplier?.contactName} label="Contacto" name="contactName" placeholder="Nombre contacto" required />
      <Input defaultValue={supplier?.phone} label="Telefono" name="phone" placeholder="+56 ..." />
      <Input defaultValue={supplier?.email} label="Email" name="email" placeholder="ventas@proveedor.cl" type="email" />
      <Input
        defaultValue={supplier?.categories?.join(', ')}
        helperText="Separalas por coma: Frenos, Filtros, Motor"
        label="Categorias"
        name="categories"
        placeholder="Frenos, Motor, Neumaticos"
        required
      />
      <Input
        defaultValue={supplier?.averageDeliveryDays ?? 1}
        label="Entrega promedio"
        min={0}
        name="averageDeliveryDays"
        step={1}
        type="number"
      />
      <Input
        defaultValue={supplier?.rating ?? 4}
        label="Rating"
        max={5}
        min={0}
        name="rating"
        step={0.1}
        type="number"
      />
      <Select defaultValue={supplier?.status || 'active'} label="Estado" name="status" options={statusOptions} />
      <Input className="span-2" defaultValue={supplier?.notes} label="Notas" name="notes" placeholder="Condiciones, cobertura o restricciones" />
      <div className="span-2 inline-actions">
        <Button disabled={isSaving} icon={<Save size={18} />} type="submit">
          {isSaving ? 'Guardando...' : 'Guardar proveedor'}
        </Button>
        <Button disabled={isSaving} onClick={() => navigate(ROUTES.suppliers)} type="button" variant="secondary">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function parseCategories(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}
