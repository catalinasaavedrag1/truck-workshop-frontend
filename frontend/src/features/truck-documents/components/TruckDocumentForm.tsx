import type { FormEvent } from 'react'
import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { toast } from '../../../shared/services/toastStore'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import { createTruckDocument, updateTruckDocument } from '../services/truckDocuments.service'
import type { TruckDocument } from '../types/truckDocuments.types'

interface TruckDocumentFormProps {
  document?: TruckDocument
  onSaved?: (document: TruckDocument) => void
  trucks: FleetTruck[]
}

export function TruckDocumentForm({ document, onSaved, trucks }: TruckDocumentFormProps) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const isEditing = Boolean(document)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      attachmentUrl: String(formData.get('attachmentUrl') || '').trim() || undefined,
      documentNumber: String(formData.get('documentNumber') || '').trim() || undefined,
      documentType: String(formData.get('documentType') || 'CERTIFICATE') as TruckDocument['documentType'],
      expiresAt: String(formData.get('expiresAt') || '') || undefined,
      issuedAt: String(formData.get('issuedAt') || '') || undefined,
      notes: String(formData.get('notes') || '').trim() || undefined,
      truckId: String(formData.get('truckId') || ''),
    }

    setErrorMessage('')
    setIsSaving(true)

    try {
      const savedDocument = document
        ? await updateTruckDocument(document.id, payload)
        : await createTruckDocument(payload)

      toast.success(document ? 'Documento actualizado' : 'Documento guardado', 'Los datos del documento se guardaron en backend.')
      onSaved?.(savedDocument)

      if (!document) {
        form.reset()
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <h2 className="section-title">{isEditing ? 'Actualizar documento' : 'Carga documental'}</h2>
      <form className="form-grid" key={document?.id || 'new-document'} onSubmit={handleSubmit}>
        {errorMessage ? <ErrorState description={errorMessage} title="No se pudo guardar el documento" /> : null}
        <Select
          defaultValue={document?.truckId}
          label="Camion"
          name="truckId"
          options={trucks.map((truck) => ({ label: `${truck.plate} - ${truck.brand} ${truck.model}`, value: truck.id }))}
          required
        />
        <Select
          defaultValue={document?.documentType}
          label="Tipo"
          name="documentType"
          options={[
            { label: 'Permiso circulacion', value: 'CIRCULATION_PERMIT' },
            { label: 'Revision tecnica', value: 'TECHNICAL_INSPECTION' },
            { label: 'Seguro obligatorio', value: 'MANDATORY_INSURANCE' },
            { label: 'Seguro adicional', value: 'ADDITIONAL_INSURANCE' },
            { label: 'Contrato leasing', value: 'LEASING_CONTRACT' },
            { label: 'Padron', value: 'REGISTRATION' },
            { label: 'Factura compra', value: 'PURCHASE_INVOICE' },
            { label: 'Certificado', value: 'CERTIFICATE' },
          ]}
        />
        <Input defaultValue={document?.documentNumber} label="Numero documento" name="documentNumber" />
        <Input defaultValue={toDateInputValue(document?.issuedAt)} label="Fecha emision" name="issuedAt" type="date" />
        <Input defaultValue={toDateInputValue(document?.expiresAt)} label="Fecha vencimiento" name="expiresAt" type="date" />
        <Input className="span-2" defaultValue={document?.attachmentUrl} label="URL archivo" name="attachmentUrl" />
        <label className="text-field span-2" htmlFor="documentNotes">
          Notas
          <textarea
            defaultValue={document?.notes}
            id="documentNotes"
            name="notes"
            placeholder="Motivo de bloqueo, renovacion pendiente o referencia del archivo"
          />
        </label>
        <div className="span-2 inline-actions">
          <Button icon={<Save size={18} />} loading={isSaving} type="submit">
            {isEditing ? 'Actualizar documento' : 'Guardar documento'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

function toDateInputValue(value?: string) {
  return value ? value.slice(0, 10) : undefined
}
