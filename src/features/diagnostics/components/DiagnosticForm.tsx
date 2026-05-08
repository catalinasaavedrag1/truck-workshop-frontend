import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Select } from '../../../shared/components/Select/Select'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { saveDiagnostic } from '../services/diagnostics.service'
import type { Diagnostic } from '../types/diagnostic.types'
import { FailureCategorySelect } from './FailureCategorySelect'
import { SymptomsForm } from './SymptomsForm'

interface DiagnosticFormProps {
  caseId?: string
  onSaved?: (diagnostic: Diagnostic) => void
}

const severityOptions = [
  { label: 'Baja', value: 'low' },
  { label: 'Media', value: 'medium' },
  { label: 'Alta', value: 'high' },
]

export function DiagnosticForm({ caseId, onSaved }: DiagnosticFormProps) {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!caseId) {
      setErrorMessage('Debes abrir el diagnostico desde un caso para poder guardarlo.')
      return
    }

    const formData = new FormData(event.currentTarget)
    const symptomPrimary = String(formData.get('symptomPrimary') || '').trim()
    const condition = String(formData.get('condition') || '').trim()
    const notes = String(formData.get('notes') || '').trim()

    setIsSaving(true)
    setErrorMessage('')
    setSavedMessage('')

    try {
      const diagnostic = await saveDiagnostic({
        caseId,
        category: String(formData.get('category') || 'other') as Diagnostic['category'],
        rootCause: String(formData.get('rootCause') || '').trim(),
        severity: String(formData.get('severity') || 'medium') as Diagnostic['severity'],
        symptoms: [symptomPrimary, condition, notes].filter(Boolean),
      })

      onSaved?.(diagnostic)
      setSavedMessage('Diagnostico registrado y caso actualizado.')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <form className="stack" onSubmit={handleSubmit}>
        {errorMessage ? <ErrorState description={errorMessage} title="No se pudo guardar el diagnostico" /> : null}
        <FailureCategorySelect />
        <SymptomsForm />
        <label className="text-field" htmlFor="rootCause">
          <span>Causa probable</span>
          <textarea id="rootCause" name="rootCause" placeholder="Describe la causa tecnica encontrada" required />
        </label>
        <Select defaultValue="medium" label="Severidad" name="severity" options={severityOptions} />
        <div className="inline-actions">
          <Button disabled={isSaving || !caseId} icon={<Save size={18} />} type="submit">
            {isSaving ? 'Guardando...' : 'Guardar diagnostico'}
          </Button>
          <Button disabled={isSaving || !caseId} onClick={() => caseId && navigate(ROUTES.caseDetail(caseId))} type="button" variant="secondary">
            Volver al caso
          </Button>
        </div>
        {savedMessage ? <p className="muted-text" role="status">{savedMessage}</p> : null}
      </form>
    </Card>
  )
}
