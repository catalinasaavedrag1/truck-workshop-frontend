import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { ProcurementRisk } from '../types/procurement.types'

const riskTone: Record<ProcurementRisk, BadgeTone> = {
  critical: 'danger',
  high: 'warning',
  low: 'success',
  medium: 'info',
}

const riskLabel: Record<ProcurementRisk, string> = {
  critical: 'Critico',
  high: 'Alto',
  low: 'Bajo',
  medium: 'Medio',
}

const statusToneMap: Record<string, BadgeTone> = {
  Aprobada: 'info',
  Atrasada: 'danger',
  Bloqueado: 'danger',
  Cerrada: 'success',
  'Compra urgente': 'danger',
  'Con demanda': 'info',
  'Con diferencia': 'warning',
  'Convertida en OC': 'success',
  Detectada: 'warning',
  Disponible: 'success',
  'Documento pendiente': 'warning',
  'En revision': 'info',
  'Esperada hoy': 'info',
  'Esperar recepcion': 'warning',
  'No comprar': 'neutral',
  Nueva: 'danger',
  'OC activa': 'info',
  'Pendiente recepcion': 'warning',
  Rechazada: 'danger',
  'Recepcion parcial': 'warning',
  'Sin stock': 'danger',
  Sobrestock: 'warning',
}

interface RiskBadgeProps {
  risk: ProcurementRisk
}

interface StatusBadgeProps {
  children: string
}

export function RiskBadge({ risk }: RiskBadgeProps) {
  return <Badge tone={riskTone[risk]}>{riskLabel[risk]}</Badge>
}

export function StatusBadge({ children }: StatusBadgeProps) {
  return <Badge tone={statusToneMap[children] ?? 'neutral'}>{children}</Badge>
}

export function ActionBadge({ children }: StatusBadgeProps) {
  return <Badge tone="info">{children}</Badge>
}
