import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Textarea } from '../../../shared/components/Textarea/Textarea'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { saveDiagnostic } from '../services/diagnostics.service'
import type { Diagnostic } from '../types/diagnostic.types'
import { FailureCategorySelect } from './FailureCategorySelect'
import styles from './DiagnosticWorkspace.module.css'

interface DiagnosticFormProps {
  caseId?: string
  formId?: string
  onSaved?: (diagnostic: Diagnostic) => void
  showActions?: boolean
}

const severityOptions = [
  { className: styles.severityLow, label: 'Baja', value: 'low' },
  { className: styles.severityMedium, label: 'Media', value: 'medium' },
  { className: styles.severityHigh, label: 'Alta', value: 'high' },
]

export function DiagnosticForm({ caseId, formId = 'diagnostic-form', onSaved, showActions = true }: DiagnosticFormProps) {
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
      <form className={styles.technicalForm} id={formId} onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <div>
            <h2>Formulario tecnico</h2>
            <p>Completa los datos clave para que taller, compras y aprobacion trabajen sobre el mismo diagnostico.</p>
          </div>
        </div>
        {errorMessage ? <ErrorState description={errorMessage} title="No se pudo guardar el diagnostico" /> : null}
        <div className={styles.formGrid}>
          <FailureCategorySelect />
          <SeveritySelector />
          <Input label="Sintoma principal" name="symptomPrimary" placeholder="Perdida de potencia" required />
          <Input label="Condicion" name="condition" placeholder="En subida, con carga completa" />
          <Input className={styles.wideField} label="Observaciones" name="notes" placeholder="Detalle tecnico inicial" />
          <Textarea
            className={styles.wideField}
            label="Causa probable"
            name="rootCause"
            placeholder="Describe la causa tecnica encontrada"
            required
          />
        </div>
        {showActions ? (
          <div className="inline-actions">
            <Button disabled={isSaving || !caseId} icon={<Save size={18} />} type="submit">
              {isSaving ? 'Guardando...' : 'Guardar diagnostico'}
            </Button>
            <Button disabled={isSaving || !caseId} onClick={() => caseId && navigate(ROUTES.caseDetail(caseId))} type="button" variant="secondary">
              Volver al caso
            </Button>
          </div>
        ) : null}
        {savedMessage ? <p className={styles.savedMessage} role="status">{savedMessage}</p> : null}
      </form>
    </Card>
  )
}

function SeveritySelector() {
  return (
    <fieldset className={styles.severityField}>
      <legend className={styles.fieldLabel}>Severidad</legend>
      <div className={styles.severityOptions}>
        {severityOptions.map((option) => (
          <label className={[styles.severityOption, option.className].join(' ')} key={option.value}>
            <input defaultChecked={option.value === 'medium'} name="severity" type="radio" value={option.value} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
