import type { FormEvent } from 'react'
import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { createPart, updatePart } from '../services/parts.service'
import type { Part } from '../types/part.types'

interface PartFormProps {
  part?: Part | null
  onCancel?: () => void
  onSaved?: (part: Part) => void
}

export function PartForm({ onCancel, onSaved, part }: PartFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const payload = {
      category: String(formData.get('category') || '').trim(),
      minStock: Number(formData.get('minStock') || 0),
      name: String(formData.get('name') || '').trim(),
      sku: String(formData.get('sku') || '').trim().toUpperCase(),
      stock: Number(formData.get('stock') || 0),
      unitCost: Number(formData.get('unitCost') || 0),
    }

    setIsSaving(true)
    setErrorMessage('')

    try {
      const savedPart = part ? await updatePart(part.id, payload) : await createPart(payload)

      onSaved?.(savedPart)
      event.currentTarget.reset()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="form-grid" key={part?.id || 'new-part'} onSubmit={handleSubmit}>
      {errorMessage ? (
        <div className="span-2">
          <ErrorState description={errorMessage} title="No se pudo guardar el SKU" />
        </div>
      ) : null}
      <Input defaultValue={part?.sku} label="SKU" name="sku" placeholder="BRK-2210" required />
      <Input defaultValue={part?.name} label="Nombre" name="name" placeholder="Valvula moduladora freno" required />
      <Input defaultValue={part?.category} label="Categoria" name="category" placeholder="Frenos" required />
      <Input defaultValue={part?.stock ?? 0} label="Stock" min={0} name="stock" type="number" />
      <Input defaultValue={part?.minStock ?? 0} label="Stock minimo" min={0} name="minStock" type="number" />
      <Input defaultValue={part?.unitCost ?? 0} label="Costo unitario" min={0} name="unitCost" step={100} type="number" />
      <div className="span-2 inline-actions">
        <Button disabled={isSaving} icon={<Save size={18} />} type="submit">
          {isSaving ? 'Guardando...' : part ? 'Actualizar SKU' : 'Crear SKU'}
        </Button>
        {part ? (
          <Button disabled={isSaving} onClick={onCancel} type="button" variant="secondary">
            Cancelar edicion
          </Button>
        ) : null}
      </div>
    </form>
  )
}
