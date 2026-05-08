import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { Modal } from '../../../shared/components/Modal/Modal'
import { Select } from '../../../shared/components/Select/Select'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import {
  ESCALATION_LEVEL_LABELS,
  ESCALATION_REASON_OPTIONS,
  getEscalationTargetOptions,
  getNextEscalationLevel,
} from '../constants/escalation.constants'
import type { EscalationEvent, EscalationLevel, EscalationReason } from '../types/escalation.types'
import styles from './EscalateCaseModal.module.css'

interface EscalateCaseModalProps {
  open: boolean
  workshopCase: WorkshopCase
  onClose: () => void
  onSubmit: (event: EscalationEvent) => void
}

export function EscalateCaseModal({ open, workshopCase, onClose, onSubmit }: EscalateCaseModalProps) {
  const formKey = `${workshopCase.id}-${workshopCase.escalationLevel}-${open ? 'open' : 'closed'}`

  return (
    <Modal onClose={onClose} open={open} title={`Escalar ${workshopCase.caseNumber}`}>
      {open ? (
        <EscalateCaseForm key={formKey} onClose={onClose} onSubmit={onSubmit} workshopCase={workshopCase} />
      ) : null}
    </Modal>
  )
}

interface EscalateCaseFormProps {
  workshopCase: WorkshopCase
  onClose: () => void
  onSubmit: (event: EscalationEvent) => void
}

function EscalateCaseForm({ workshopCase, onClose, onSubmit }: EscalateCaseFormProps) {
  const defaultTargetLevel = getNextEscalationLevel(workshopCase.escalationLevel)
  const [toLevel, setToLevel] = useState<EscalationLevel>(defaultTargetLevel)
  const [reason, setReason] = useState<EscalationReason>(workshopCase.escalationReason || getDefaultReason(workshopCase))
  const [comment, setComment] = useState(getDefaultComment(workshopCase))
  const targetOptions = getEscalationTargetOptions(workshopCase.escalationLevel)
  const isAlreadyAtMaxLevel = workshopCase.escalationLevel === 'LEVEL_3_GERENCIA'

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isAlreadyAtMaxLevel) {
      return
    }

    onSubmit({
      caseId: workshopCase.id,
      comment: comment.trim() || getDefaultComment(workshopCase),
      createdAt: new Date().toISOString(),
      createdBy: 'Coordinador taller',
      fromLevel: workshopCase.escalationLevel,
      id: `esc-${workshopCase.id}-${Date.now()}`,
      reason,
      toLevel,
    })
  }

  const handleLevelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setToLevel(event.target.value as EscalationLevel)
  }

  const handleReasonChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setReason(event.target.value as EscalationReason)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <section className={styles.summary} aria-label="Resumen del caso a escalar">
        <span className={styles.eyebrow}>Caso</span>
        <h3>{workshopCase.title}</h3>
        <p>{workshopCase.failureDescription}</p>
        <dl className={styles.summaryGrid}>
          <div>
            <dt>Camion</dt>
            <dd>{workshopCase.truckPlate}</dd>
          </div>
          <div>
            <dt>Operacion</dt>
            <dd>{workshopCase.customerName}</dd>
          </div>
          <div>
            <dt>Nivel actual</dt>
            <dd>{ESCALATION_LEVEL_LABELS[workshopCase.escalationLevel]}</dd>
          </div>
        </dl>
      </section>

      {isAlreadyAtMaxLevel ? (
        <p className={styles.notice}>Este caso ya se encuentra en el nivel maximo de escalamiento.</p>
      ) : (
        <div className={styles.controls}>
          <Select label="Escalar a" name="toLevel" onChange={handleLevelChange} options={targetOptions} value={toLevel} />
          <Select label="Motivo" name="reason" onChange={handleReasonChange} options={ESCALATION_REASON_OPTIONS} value={reason} />
          <label className="text-field" htmlFor={`comment-${workshopCase.id}`}>
            <span>Comentario operativo</span>
            <textarea
              id={`comment-${workshopCase.id}`}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Explica que impide avanzar y que decision necesitas"
              value={comment}
            />
          </label>
        </div>
      )}

      <div className={styles.actions}>
        <Button onClick={onClose} type="button" variant="secondary">
          Cancelar
        </Button>
        <Button disabled={isAlreadyAtMaxLevel} icon={<ArrowUpRight size={18} />} type="submit">
          Registrar escalamiento
        </Button>
      </div>
    </form>
  )
}

function getDefaultReason(workshopCase: WorkshopCase): EscalationReason {
  if (workshopCase.slaStatus === 'BREACHED') {
    return 'SLA_BREACHED'
  }

  if (workshopCase.slaStatus === 'AT_RISK') {
    return 'SLA_AT_RISK'
  }

  if (workshopCase.requiredParts.some((part) => part.requiresPurchase)) {
    return 'CRITICAL_PART_MISSING'
  }

  return 'DIAGNOSIS_BLOCKED'
}

function getDefaultComment(workshopCase: WorkshopCase) {
  return `Revisar ${workshopCase.caseNumber}: ${workshopCase.currentStep.toLowerCase()} con prioridad ${workshopCase.priority}.`
}
