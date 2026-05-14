import type { FormEvent } from 'react'
import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { Input } from '../../../shared/components/Input/Input'
import { Modal } from '../../../shared/components/Modal/Modal'
import { Select } from '../../../shared/components/Select/Select'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type { CloseWorkshopCasePayload } from '../services/workshopCases.service'
import type { WorkshopCase } from '../types/workshopCase.types'
import styles from './CloseCaseModal.module.css'

const closeReasonOptions = [
  { label: 'Reparado y probado', value: 'resolved' },
  { label: 'Derivado a servicio externo', value: 'external_service' },
  { label: 'Sin falla reproducible', value: 'no_fault_found' },
  { label: 'Cierre administrativo', value: 'administrative_close' },
]

interface CloseCaseModalProps {
  open: boolean
  workshopCase: WorkshopCase
  onClose: () => void
  onSubmit: (payload: CloseWorkshopCasePayload) => Promise<void> | void
}

export function CloseCaseModal({ onClose, onSubmit, open, workshopCase }: CloseCaseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const closureSummary = String(formData.get('closureSummary') || '').trim()

    if (!closureSummary) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        closeReason: String(formData.get('closeReason') || 'resolved'),
        closureSummary,
        estimatedCost: Number(formData.get('estimatedCost') || workshopCase.estimatedCost || 0),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal onClose={onClose} open={open} title={`Cerrar ${workshopCase.caseNumber}`}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <section className={styles.summary} aria-label="Resumen del caso a cerrar">
          <h3>{workshopCase.title}</h3>
          <p>{workshopCase.failureDescription}</p>
          <dl className={styles.summaryGrid}>
            <div>
              <dt>Camion</dt>
              <dd>{workshopCase.truckPlate}</dd>
            </div>
            <div>
              <dt>Responsable</dt>
              <dd>{workshopCase.mechanicName || 'Sin asignar'}</dd>
            </div>
            <div>
              <dt>SLA</dt>
              <dd>{formatDate(workshopCase.slaDueAt)}</dd>
            </div>
          </dl>
        </section>

        <Select label="Motivo de cierre" name="closeReason" options={closeReasonOptions} />
        <Input
          label="Costo final estimado"
          min={0}
          name="estimatedCost"
          step={1000}
          type="number"
          defaultValue={workshopCase.estimatedCost}
        />
        <label className="text-field" htmlFor={`closureSummary-${workshopCase.id}`}>
          <span>Resumen de cierre</span>
          <textarea
            id={`closureSummary-${workshopCase.id}`}
            name="closureSummary"
            placeholder="Que se hizo, como se valido, si queda observacion pendiente y quien entrega la unidad"
            required
          />
        </label>

        <p className={styles.notice}>
          Al cerrar, el caso queda bloqueado para acciones operativas, la asignacion activa pasa a completada y la unidad
          vuelve a disponibilidad de flota.
        </p>

        <div className={styles.actions}>
          <Button onClick={onClose} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button disabled={isSubmitting} icon={<CheckCircle2 size={18} />} type="submit">
            {isSubmitting ? 'Cerrando...' : `Cerrar caso (${formatCurrency(workshopCase.estimatedCost)})`}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
