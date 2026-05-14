import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type { FreightRequestOperation } from '../utils/freightOperations'
import { getFreightStageIndex } from '../utils/freightOperations'
import styles from './FreightModule.module.css'

interface FreightTimelineProps {
  operation: FreightRequestOperation
}

export function FreightTimeline({ operation }: FreightTimelineProps) {
  const activeIndex = getFreightStageIndex(operation.stage)
  const timeline = buildFreightTimeline(operation)

  return (
    <section className={styles.timelinePanel}>
      <div className={styles.timelineHeader}>
        <h3>Timeline operacional</h3>
        <span>{timeline.length} eventos</span>
      </div>
      <ol className={styles.freightTimeline}>
        {timeline.map((event, index) => (
          <li className={index <= activeIndex ? styles.timelineDone : ''} key={`${event.title}-${event.date}`}>
            <span className={styles.timelineDot} />
            <div>
              <strong>{event.title}</strong>
              <p>{event.description}</p>
              <small>
                {formatDate(event.date)} / {event.actor}
              </small>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function buildFreightTimeline(operation: FreightRequestOperation) {
  const events = [
    {
      actor: 'Comercial',
      date: operation.request.createdAt,
      description: `${operation.request.customerName} ingreso ${operation.request.cargoDescription}.`,
      title: 'Solicitud creada',
    },
  ]

  if (operation.quote) {
    events.push({
      actor: 'Comercial',
      date: operation.quote.sentAt || operation.quote.validUntil,
      description: `Cotizacion ${operation.quote.quoteNumber} por ${formatCurrency(operation.quote.total)}.`,
      title: operation.quote.sentAt ? 'Cotizacion enviada' : 'Cotizacion generada',
    })

    if (operation.quote.approvedAt) {
      events.push({
        actor: 'Cliente',
        date: operation.quote.approvedAt,
        description: 'Cliente aprobo condiciones comerciales.',
        title: 'Aprobacion recibida',
      })
    }
  }

  if (operation.assignment) {
    events.push({
      actor: operation.assignment.assignedBy,
      date: operation.assignment.createdAt,
      description: `Camion ${operation.assignment.truckId} y chofer ${operation.assignment.driverId}.`,
      title: 'Recursos asignados',
    })
    events.push({
      actor: 'Despacho',
      date: operation.assignment.pickupDate,
      description: 'Ventana de retiro programada.',
      title: 'Retiro programado',
    })
  }

  if (operation.request.status === 'IN_TRANSIT') {
    events.push({
      actor: 'Trafico',
      date: operation.request.updatedAt,
      description: 'Viaje activo con seguimiento operacional.',
      title: 'En ruta',
    })
  }

  if (operation.request.status === 'DELIVERED') {
    events.push({
      actor: 'Backoffice',
      date: operation.request.updatedAt,
      description: 'Entrega confirmada y lista para cierre documental.',
      title: 'Entrega confirmada',
    })
  }

  return events.sort((first, second) => new Date(first.date).getTime() - new Date(second.date).getTime())
}
