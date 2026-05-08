import { EscalationPanel } from '../../escalation/components/EscalationPanel'
import type { EscalationEvent } from '../../escalation/types/escalation.types'
import type { WorkshopCase } from '../types/workshopCase.types'

interface CaseEscalationPanelProps {
  events: EscalationEvent[]
  onEscalate: () => void
  workshopCase: WorkshopCase
}

export function CaseEscalationPanel({ events, onEscalate, workshopCase }: CaseEscalationPanelProps) {
  return <EscalationPanel events={events} onEscalate={onEscalate} workshopCase={workshopCase} />
}
