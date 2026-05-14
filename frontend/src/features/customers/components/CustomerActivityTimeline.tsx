import { Link } from 'react-router-dom'
import { Badge } from '../../../shared/components/Badge/Badge'
import { formatDate } from '../../../shared/utils/formatDate'
import type { CustomerActivityItem } from '../utils/customer360'

interface CustomerActivityTimelineProps {
  items: CustomerActivityItem[]
}

const kindLabels: Record<CustomerActivityItem['kind'], string> = {
  case: 'Taller',
  communication: 'Comunicacion',
  freight: 'Flete',
  'freight-assignment': 'Asignacion',
  'freight-quote': 'Cotizacion flete',
  profitability: 'Rentabilidad',
  'trip-sheet': 'Planilla',
  'workshop-quote': 'Cotizacion taller',
}

export function CustomerActivityTimeline({ items }: CustomerActivityTimelineProps) {
  if (items.length === 0) {
    return <p className="muted-text">Todavia no hay actividad operacional asociada a este cliente.</p>
  }

  return (
    <div className="timeline">
      {items.slice(0, 8).map((item, index) => (
        <div className="timeline-step" key={item.id}>
          <span className="timeline-dot">{index + 1}</span>
          <div>
            <div className="split-row">
              {item.href ? <Link to={item.href}>{item.title}</Link> : <strong>{item.title}</strong>}
              <Badge tone="info">{kindLabels[item.kind]}</Badge>
            </div>
            <p className="muted-text">{item.description}</p>
            <small className="muted-text">
              {item.date ? formatDate(item.date) : 'Sin fecha'}{item.meta ? ` - ${item.meta}` : ''}
            </small>
          </div>
        </div>
      ))}
    </div>
  )
}
