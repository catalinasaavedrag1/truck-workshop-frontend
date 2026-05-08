import type { FormEvent } from 'react'
import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { saveRepairSolution } from '../services/repairSolutions.service'

interface RepairSolutionFormProps {
  caseId?: string
}

export function RepairSolutionForm({ caseId }: RepairSolutionFormProps) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!caseId) {
      setErrorMessage('Debes abrir la solucion desde un caso para poder guardarla.')
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    const estimatedCost = Number(formData.get('estimatedCost') || 0)
    const laborHours = Number(formData.get('laborHours') || 0)

    setErrorMessage('')
    setSavedMessage('')
    setIsSaving(true)

    try {
      await saveRepairSolution({
        approvalRequired: estimatedCost >= 500000,
        caseId,
        estimatedCost,
        laborHours,
        requiredParts: [],
        summary: String(formData.get('summary') || '').trim(),
      })

      setSavedMessage('Solucion guardada en backend.')
      form.reset()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <form className="form-grid" onSubmit={handleSubmit}>
        {errorMessage ? <ErrorState description={errorMessage} title="No se pudo guardar la solucion" /> : null}
        <Input className="span-2" label="Solucion propuesta" name="summary" placeholder="Cambio de valvula y prueba de presion" required />
        <Input label="Horas de trabajo" min={0} name="laborHours" type="number" />
        <Input label="Costo estimado" min={0} name="estimatedCost" type="number" />
        <div className="span-2 inline-actions">
          <Button disabled={isSaving || !caseId} icon={<Save size={18} />} type="submit">
            {isSaving ? 'Guardando...' : 'Guardar solucion'}
          </Button>
          {savedMessage ? <span className="muted-text">{savedMessage}</span> : null}
        </div>
      </form>
    </Card>
  )
}
