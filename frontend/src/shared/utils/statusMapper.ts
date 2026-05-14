import type { BadgeTone } from '../components/Badge/Badge'

export function mapToneByStatus(status: string): BadgeTone {
  if (status.includes('closed') || status.includes('available')) {
    return 'success'
  }

  if (status.includes('urgent') || status.includes('critical')) {
    return 'danger'
  }

  if (status.includes('repair') || status.includes('testing')) {
    return 'warning'
  }

  return 'info'
}
