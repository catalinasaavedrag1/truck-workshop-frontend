import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { NotificationSeverity } from '../types/notification.types'

export function severityTone(severity: NotificationSeverity): BadgeTone {
  const tones: Record<NotificationSeverity, BadgeTone> = {
    critical: 'danger',
    info: 'info',
    success: 'success',
    warning: 'warning',
  }

  return tones[severity]
}

export function severityLabel(severity: NotificationSeverity) {
  const labels: Record<NotificationSeverity, string> = {
    critical: 'Critica',
    info: 'Info',
    success: 'OK',
    warning: 'Alerta',
  }

  return labels[severity]
}
