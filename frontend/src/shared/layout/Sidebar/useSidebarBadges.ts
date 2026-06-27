import { useResourceList } from '../../hooks/useResourceList'
import { casesMock } from '../../../mocks/cases.mock'
import type { WorkshopCase } from '../../../features/workshop-cases/types/workshopCase.types'
import { incidentsMock } from '../../../features/incidents/mocks/incidents.mock'
import type { Incident } from '../../../features/incidents/types/incidents.types'
import { notificationsMock } from '../../../features/notifications/mocks/notifications.mock'
import type { OperationalNotification } from '../../../features/notifications/types/notification.types'

export type SidebarBadgeTone = 'info' | 'warning' | 'danger'

export interface SidebarBadge {
  count: number
  tone: SidebarBadgeTone
  /** Etiqueta accesible, ej "3 sin leer". */
  label: string
}

/**
 * Contadores dinamicos para el menu, priorizando trabajo pendiente. Se calculan
 * desde los mismos recursos que el resto de la app (con fallback mock), sin tocar
 * contratos de backend. La clave coincide con `badge` en app.config.
 */
export function useSidebarBadges(): Record<string, SidebarBadge> {
  const { data: notifications } = useResourceList<OperationalNotification>('/notifications', notificationsMock)
  const { data: incidents } = useResourceList<Incident>('/incidents', incidentsMock)
  const { data: cases } = useResourceList<WorkshopCase>('/cases', casesMock)

  const unreadNotifications = notifications.filter((item) => item.status === 'unread').length
  const openIncidents = incidents.filter((item) => item.status === 'OPEN' || item.status === 'UNDER_REVIEW').length
  const criticalCases = cases.filter((item) => item.slaStatus === 'BREACHED' || item.slaStatus === 'AT_RISK').length

  return {
    notifications: { count: unreadNotifications, tone: 'info', label: `${unreadNotifications} sin leer` },
    incidents: { count: openIncidents, tone: 'warning', label: `${openIncidents} abiertos` },
    criticalCases: { count: criticalCases, tone: 'danger', label: `${criticalCases} con SLA en riesgo` },
  }
}
