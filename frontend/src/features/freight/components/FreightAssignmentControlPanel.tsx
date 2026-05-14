import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Card } from '../../../shared/components/Card/Card'
import { formatDate } from '../../../shared/utils/formatDate'
import type { Driver } from '../../drivers/types/driver.types'
import type { Truck } from '../../trucks/types/truck.types'
import type { FreightAssignment, FreightRequest } from '../types/freight.types'
import { FreightAssignmentStatusBadge } from './FreightAssignmentStatusBadge'
import styles from './FreightModule.module.css'

interface FreightAssignmentControlPanelProps {
  assignments: FreightAssignment[]
  drivers: Driver[]
  requests: FreightRequest[]
  trucks: Truck[]
}

export function FreightAssignmentControlPanel({
  assignments,
  drivers,
  requests,
  trucks,
}: FreightAssignmentControlPanelProps) {
  const pendingApproved = requests.filter(
    (request) =>
      request.status === 'APPROVED' && !assignments.some((assignment) => assignment.requestId === request.id),
  )
  const availableTrucks = trucks.filter((truck) => truck.status === 'available')
  const activeDrivers = drivers.filter((driver) => driver.status === 'active')
  const conflicts = trucks.filter((truck) => truck.status !== 'available').length
  const timeline = [...assignments]
    .filter((assignment) => ['SCHEDULED', 'IN_TRANSIT'].includes(assignment.status))
    .sort((first, second) => new Date(first.pickupDate).getTime() - new Date(second.pickupDate).getTime())
    .slice(0, 5)

  const metrics = [
    { label: 'Aprobadas pendientes', value: pendingApproved.length },
    { label: 'Camiones disponibles', value: availableTrucks.length },
    { label: 'Choferes activos', value: activeDrivers.length },
    { label: 'Conflictos flota', value: conflicts },
  ]

  return (
    <Card>
      <div className={styles.controlPanel}>
        <div className={styles.flowHeader}>
          <div>
            <h2>Centro de despacho</h2>
            <p>Disponibilidad, conflictos y proximos retiros.</p>
          </div>
        </div>
        <div className={styles.controlGrid}>
          {metrics.map((metric) => (
            <div className={styles.controlMetric} key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>
        <div className={styles.dispatchTimeline}>
          {timeline.length > 0 ? (
            timeline.map((assignment) => {
              const request = requests.find((item) => item.id === assignment.requestId)
              const truck = trucks.find((item) => item.id === assignment.truckId)
              const driver = drivers.find((item) => item.id === assignment.driverId)

              return (
                <div className={styles.dispatchItem} key={assignment.id}>
                  <span className={styles.dispatchTime}>{formatDate(assignment.pickupDate)}</span>
                  <div>
                    <strong>
                      {request ? (
                        <Link to={ROUTES.freightRequestDetail(request.id)}>{request.requestNumber}</Link>
                      ) : (
                        assignment.requestId
                      )}
                    </strong>
                    <p>
                      {truck?.plate || assignment.truckId} - {driver?.name || assignment.driverId}
                    </p>
                  </div>
                  <FreightAssignmentStatusBadge status={assignment.status} />
                </div>
              )
            })
          ) : (
            <p className="muted-text">Sin retiros programados activos.</p>
          )}
        </div>
      </div>
    </Card>
  )
}
