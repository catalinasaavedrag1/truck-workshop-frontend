import type { FormEvent } from 'react'
import { useState } from 'react'
import { FileText, Send } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import { createWorkshopQuote } from '../services/quotes.service'
import type { Quote, QuoteLineItem, QuoteStatus } from '../types/quote.types'

interface QuoteFormProps {
  workshopCase: WorkshopCase
  onCreated: (quote: Quote) => void
}

type QuoteSubmitEvent = Event & {
  submitter?: HTMLElement
}

export function QuoteForm({ workshopCase, onCreated }: QuoteFormProps) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const defaultServiceAmount = workshopCase.estimatedCost > 0 ? String(Math.round(workshopCase.estimatedCost)) : ''

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const submitter = (event.nativeEvent as QuoteSubmitEvent).submitter
    const status = normalizeSubmitStatus(submitter instanceof HTMLButtonElement ? submitter.value : undefined)
    const serviceAmount = Number(formData.get('serviceAmount') || 0)
    const laborHours = Number(formData.get('laborHours') || 0)
    const laborRate = Number(formData.get('laborRate') || 0)
    const items: Array<Omit<QuoteLineItem, 'id'>> = []

    if (serviceAmount > 0) {
      items.push({
        description: String(formData.get('serviceDescription') || 'Servicio taller y repuestos').trim(),
        quantity: 1,
        type: 'part',
        unitPrice: serviceAmount,
      })
    }

    if (laborHours > 0 && laborRate > 0) {
      items.push({
        description: String(formData.get('laborDescription') || 'Mano de obra taller').trim(),
        quantity: laborHours,
        type: 'labor',
        unitPrice: laborRate,
      })
    }

    if (items.length === 0) {
      setErrorMessage('Agrega al menos un monto de servicio/repuestos o mano de obra.')
      return
    }

    setErrorMessage('')
    setSavedMessage('')
    setIsSaving(true)

    try {
      const quote = await createWorkshopQuote({
        caseId: workshopCase.id,
        caseNumber: workshopCase.caseNumber,
        customerName: workshopCase.customerName,
        diagnosisSummary: String(formData.get('diagnosisSummary') || workshopCase.failureDescription || '').trim(),
        expiresAt: String(formData.get('expiresAt') || ''),
        items,
        status,
      })

      onCreated(quote)
      setSavedMessage(status === 'SENT' ? 'Cotizacion creada y enviada a aprobacion.' : 'Borrador de cotizacion creado.')
      form.reset()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {errorMessage ? <ErrorState description={errorMessage} title="No se pudo crear la cotizacion" /> : null}
      <label className="text-field span-2" htmlFor="quoteDiagnosisSummary">
        Resumen operativo
        <textarea
          defaultValue={workshopCase.failureDescription}
          id="quoteDiagnosisSummary"
          name="diagnosisSummary"
          placeholder="Diagnostico, alcance y condiciones de la cotizacion"
          required
        />
      </label>
      <Input
        defaultValue="Servicio taller y repuestos"
        label="Concepto servicio/repuestos"
        name="serviceDescription"
        required
      />
      <Input
        defaultValue={defaultServiceAmount}
        label="Monto servicio/repuestos"
        min={0}
        name="serviceAmount"
        type="number"
      />
      <Input defaultValue="Mano de obra taller" label="Concepto mano de obra" name="laborDescription" />
      <Input label="Horas mano de obra" min={0} name="laborHours" step="0.5" type="number" />
      <Input defaultValue={45000} label="Tarifa hora" min={0} name="laborRate" type="number" />
      <Input defaultValue={defaultExpiryDate()} label="Vigencia hasta" name="expiresAt" required type="date" />
      <div className="span-2 inline-actions">
        <Button disabled={isSaving} icon={<FileText size={18} />} type="submit" value="DRAFT" variant="secondary">
          {isSaving ? 'Guardando...' : 'Crear borrador'}
        </Button>
        <Button disabled={isSaving} icon={<Send size={18} />} type="submit" value="SENT">
          {isSaving ? 'Enviando...' : 'Crear y enviar'}
        </Button>
        {savedMessage ? <span className="muted-text">{savedMessage}</span> : null}
      </div>
    </form>
  )
}

function normalizeSubmitStatus(value: string | undefined): QuoteStatus {
  return value === 'SENT' ? 'SENT' : 'DRAFT'
}

function defaultExpiryDate() {
  const date = new Date()
  date.setDate(date.getDate() + 3)

  return date.toISOString().slice(0, 10)
}
