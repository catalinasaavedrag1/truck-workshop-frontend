import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, CheckCircle2, ClipboardCheck, UserPlus } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import type { WorkshopCase } from '../types/workshopCase.types'

interface CaseActionsPanelProps {
  onAssign: () => void
  onCloseCase: () => void
  onEscalate: () => void
  workshopCase: WorkshopCase
}

export function CaseActionsPanel({ onAssign, onCloseCase, onEscalate, workshopCase }: CaseActionsPanelProps) {
  const navigate = useNavigate()
  const isClosed = workshopCase.status === 'closed'
  const hasResponsible = Boolean(workshopCase.mechanicId || workshopCase.assignedMechanicId)

  return (
    <Card>
      <div className="stack">
        <div>
          <h2 className="section-title">Acciones del caso</h2>
          <p className="muted-text">
            {isClosed
              ? `Cerrado por ${workshopCase.closedBy || 'taller'}${workshopCase.closedAt ? ` el ${new Date(workshopCase.closedAt).toLocaleDateString('es-CL')}` : ''}.`
              : hasResponsible
                ? `Responsable actual: ${workshopCase.mechanicName || 'mecanico asignado'}.`
                : 'Este caso aun no tiene responsable operativo.'}
          </p>
        </div>
        <Button
          disabled={isClosed}
          fullWidth
          icon={<ClipboardCheck size={18} />}
          onClick={() => navigate(ROUTES.diagnostics(workshopCase.id))}
          variant="secondary"
        >
          Registrar diagnostico
        </Button>
        <Button disabled={isClosed} fullWidth icon={<UserPlus size={18} />} onClick={onAssign} variant={hasResponsible ? 'secondary' : 'primary'}>
          {hasResponsible ? 'Reasignar responsable' : 'Asignar responsable'}
        </Button>
        <Button disabled={isClosed} fullWidth icon={<ArrowUpRight size={18} />} onClick={onEscalate} variant="secondary">
          Escalar caso
        </Button>
        <Button disabled={isClosed} fullWidth icon={<CheckCircle2 size={18} />} onClick={onCloseCase}>
          {isClosed ? 'Caso cerrado' : 'Cerrar caso'}
        </Button>
      </div>
    </Card>
  )
}
