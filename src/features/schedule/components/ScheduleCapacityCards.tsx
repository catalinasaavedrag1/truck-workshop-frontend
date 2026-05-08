import { AlertTriangle, Clock3, Warehouse, Wrench } from 'lucide-react'
import { MetricCard } from '../../../shared/components/MetricCard/MetricCard'
import type { WorkshopBay } from '../../workshop-bays/types/workshopBay.types'
import type { ScheduleEvent, WaitingQueueItem } from '../types/schedule.types'
import styles from './SchedulePlanner.module.css'

interface ScheduleCapacityCardsProps {
  bays: WorkshopBay[]
  events: ScheduleEvent[]
  queue: WaitingQueueItem[]
}

export function ScheduleCapacityCards({ bays, events, queue }: ScheduleCapacityCardsProps) {
  const occupiedBayIds = new Set(events.map((event) => event.bayId))
  const availableBays = bays.filter((bay) => bay.status !== 'maintenance' && !occupiedBayIds.has(bay.id)).length
  const occupiedBays = occupiedBayIds.size
  const mechanics = new Set(events.map((event) => event.mechanicId)).size
  const atRisk = events.filter((event) => event.slaStatus !== 'OK').length + queue.filter((item) => item.slaStatus !== 'OK').length
  const blockedByParts =
    events.filter((event) => event.hasPartsBlock).length + queue.filter((item) => item.hasPartsBlock).length

  const metrics = [
    { icon: <Wrench size={16} />, label: 'Estaciones libres', value: availableBays, helper: 'Espacio fisico disponible', tone: 'success' },
    { icon: <Clock3 size={16} />, label: 'Estaciones ocupadas', value: occupiedBays, helper: 'Con trabajo agendado', tone: 'info' },
    { icon: <Wrench size={16} />, label: 'Mecanicos asignados', value: mechanics, helper: 'Carga del dia', tone: 'neutral' },
    { icon: <AlertTriangle size={16} />, label: 'SLA en riesgo', value: atRisk, helper: 'Agenda + cola', tone: atRisk > 0 ? 'warning' : 'success' },
    { icon: <Warehouse size={16} />, label: 'Bloqueo repuestos', value: blockedByParts, helper: 'No iniciar sin stock', tone: blockedByParts > 0 ? 'danger' : 'success' },
  ]

  return (
    <div className={styles.capacityGrid}>
      {metrics.map((metric) => (
        <MetricCard
          helper={metric.helper}
          icon={metric.icon}
          key={metric.label}
          label={metric.label}
          tone={metric.tone as 'neutral' | 'success' | 'warning' | 'danger' | 'info'}
          value={metric.value}
        />
      ))}
    </div>
  )
}
