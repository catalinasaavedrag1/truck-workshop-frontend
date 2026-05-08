import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { Button } from '../../../shared/components/Button/Button'
import { Modal } from '../../../shared/components/Modal/Modal'
import { Select } from '../../../shared/components/Select/Select'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { CasePriorityBadge } from '../../workshop-cases/components/CasePriorityBadge'
import { CaseStatusBadge } from '../../workshop-cases/components/CaseStatusBadge'
import type { Mechanic } from '../../mechanics/types/mechanic.types'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import type { Assignment } from '../types/assignment.types'
import styles from './AssignCaseModal.module.css'

interface AssignCaseModalProps {
  open: boolean
  onClose: () => void
  onAssign: (assignment: Assignment) => void | Promise<void>
  initialCaseId?: string
  initialMechanicId?: string
  mechanics: Mechanic[]
  workshopCases: WorkshopCase[]
}

export function AssignCaseModal({
  open,
  onClose,
  onAssign,
  initialCaseId,
  initialMechanicId,
  mechanics,
  workshopCases,
}: AssignCaseModalProps) {
  const formKey = `${initialCaseId || 'case'}-${initialMechanicId || 'mechanic'}-${open ? 'open' : 'closed'}`

  return (
    <Modal onClose={onClose} open={open} title="Asignar caso">
      {open ? (
        <AssignCaseForm
          initialCaseId={initialCaseId}
          initialMechanicId={initialMechanicId}
          key={formKey}
          mechanics={mechanics}
          onAssign={onAssign}
          onClose={onClose}
          workshopCases={workshopCases}
        />
      ) : null}
    </Modal>
  )
}

interface AssignCaseFormProps {
  onClose: () => void
  onAssign: (assignment: Assignment) => void | Promise<void>
  initialCaseId?: string
  initialMechanicId?: string
  mechanics: Mechanic[]
  workshopCases: WorkshopCase[]
}

function AssignCaseForm({
  onClose,
  onAssign,
  initialCaseId,
  initialMechanicId,
  mechanics,
  workshopCases,
}: AssignCaseFormProps) {
  const assignableCases = workshopCases.filter((workshopCase) => workshopCase.status !== 'closed')
  const initialCase = assignableCases.find((workshopCase) => workshopCase.id === initialCaseId) || assignableCases[0]
  const [caseId, setCaseId] = useState(initialCase?.id || '')
  const selectedCase = assignableCases.find((workshopCase) => workshopCase.id === caseId)
  const [mechanicId, setMechanicId] = useState(
    initialMechanicId || initialCase?.mechanicId || initialCase?.assignedMechanicId || mechanics[0]?.id || '',
  )
  const selectedMechanic = mechanics.find((mechanic) => mechanic.id === mechanicId)

  const handleCaseChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextCaseId = event.target.value
    const nextCase = assignableCases.find((workshopCase) => workshopCase.id === nextCaseId)

    setCaseId(nextCaseId)
    setMechanicId(nextCase?.mechanicId || nextCase?.assignedMechanicId || mechanics[0]?.id || '')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedCase || !selectedMechanic) {
      return
    }

    void onAssign({
      assignedAt: new Date().toISOString(),
      caseCode: selectedCase.caseNumber,
      caseId: selectedCase.id,
      id: `assignment-${selectedCase.id}-${selectedMechanic.id}`,
      mechanicId: selectedMechanic.id,
      mechanicName: selectedMechanic.name,
      status: selectedCase.status === 'assigned' || selectedCase.status === 'repairing' ? 'active' : 'queued',
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.controls}>
          <Select
            label="Caso"
            name="caseId"
            onChange={handleCaseChange}
            options={assignableCases.map((workshopCase) => ({
              label: `${workshopCase.caseNumber} - ${workshopCase.truckPlate} - ${workshopCase.title}`,
              value: workshopCase.id,
            }))}
            value={caseId}
          />
          <Select
            label="Mecanico responsable"
            name="mechanicId"
            onChange={(event) => setMechanicId(event.target.value)}
            options={mechanics.map((mechanic) => ({
              label: `${mechanic.name} - ${mechanic.specialty} - ${mechanic.activeCases}/${mechanic.maxCases}`,
              value: mechanic.id,
            }))}
            value={mechanicId}
          />
        </div>

        {selectedCase ? (
          <section className={styles.caseSummary} aria-label="Resumen del caso a asignar">
            <div className={styles.summaryHeader}>
              <div>
                <span className={styles.eyebrow}>Estas asignando</span>
                <h3>{selectedCase.caseNumber}</h3>
                <p>{selectedCase.failureDescription}</p>
              </div>
              <div className={styles.badges}>
                <CasePriorityBadge priority={selectedCase.priority} />
                <CaseStatusBadge status={selectedCase.status} />
              </div>
            </div>

            <dl className={styles.summaryGrid}>
              <div>
                <dt>Camion</dt>
                <dd>{selectedCase.truckPlate}</dd>
              </div>
              <div>
                <dt>Chofer</dt>
                <dd>{selectedCase.driverName}</dd>
              </div>
              <div>
                <dt>Operacion</dt>
                <dd>{selectedCase.customerName}</dd>
              </div>
              <div>
                <dt>SLA</dt>
                <dd>{formatDate(selectedCase.slaDueAt)}</dd>
              </div>
              <div>
                <dt>Paso actual</dt>
                <dd>{selectedCase.currentStep}</dd>
              </div>
              <div>
                <dt>Costo estimado</dt>
                <dd>{formatCurrency(selectedCase.estimatedCost)}</dd>
              </div>
            </dl>
          </section>
        ) : null}

        <div className={styles.actions}>
          <Button onClick={onClose} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button type="submit">Confirmar asignacion</Button>
        </div>
    </form>
  )
}
