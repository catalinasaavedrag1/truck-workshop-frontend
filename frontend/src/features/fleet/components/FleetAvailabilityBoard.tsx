import { formatDate } from '../../../shared/utils/formatDate'
import { availabilityColumnLabels, availabilityColumns } from '../constants/fleet.constants'
import type { FleetAvailabilityItem, FleetTruck } from '../types/fleet.types'
import styles from './FleetAvailabilityBoard.module.css'
import { TruckStatusBadge } from './TruckStatusBadge'

interface FleetAvailabilityBoardProps {
  availability: FleetAvailabilityItem[]
  showEmptyColumns?: boolean
  trucks: FleetTruck[]
}

export function FleetAvailabilityBoard({ availability, showEmptyColumns = true, trucks }: FleetAvailabilityBoardProps) {
  const visibleColumns = showEmptyColumns
    ? availabilityColumns
    : availabilityColumns.filter((column) => availability.some((item) => item.column === column))

  return (
    <div className={styles.board}>
      {visibleColumns.map((column) => {
        const items = availability.filter((item) => item.column === column)

        return (
          <section className={styles.column} key={column}>
            <div className={styles.columnHeader}>
              <h2 className={styles.columnTitle}>{availabilityColumnLabels[column]}</h2>
              <strong className={styles.count}>{items.length}</strong>
            </div>
            <div className={styles.items}>
              {items.length > 0 ? (
                items.map((item) => {
                  const truck = trucks.find((candidate) => candidate.id === item.truckId)

                  if (!truck) {
                    return null
                  }

                  return (
                    <div className={styles.truckCard} key={item.id}>
                      <div className={styles.truckHeader}>
                        <div>
                          <strong className={styles.truckPlate}>{truck.plate}</strong>
                          <div className={styles.truckModel}>
                            {truck.brand} {truck.model}
                          </div>
                        </div>
                        <TruckStatusBadge status={truck.operationalStatus} />
                      </div>
                      <div className={styles.metaList}>
                        <small className={styles.metaItem}>Chofer: {truck.assignedDriverName || 'Sin asignar'}</small>
                        <small className={styles.metaItem}>
                          Bloqueo: {item.blockerReason || truck.mainBlocker || 'Sin bloqueo'}
                        </small>
                        <small className={styles.metaItem}>
                          Vuelve: {item.availableAt ? formatDate(item.availableAt) : 'Disponible ahora'}
                        </small>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className={styles.empty}>Sin camiones en esta columna.</p>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
