import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatDate } from '../../../shared/utils/formatDate'
import { TruckStatusBadge } from '../../fleet/components/TruckStatusBadge'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import { maintenanceTypeLabels } from '../constants/preventiveMaintenance.constants'
import type { PreventiveMaintenancePlan } from '../types/preventiveMaintenance.types'
import { getMaintenancePlanSnapshot } from '../utils/preventiveMaintenanceOperations'
import { MaintenanceDueBadge } from './MaintenanceDueBadge'
import styles from './PreventiveMaintenance.module.css'

interface MaintenancePlanTableProps {
  plans: PreventiveMaintenancePlan[]
  trucks: FleetTruck[]
}

export function MaintenancePlanTable({ plans, trucks }: MaintenancePlanTableProps) {
  const trucksById = new Map(trucks.map((truck) => [truck.id, truck]))
  const columns: TableColumn<PreventiveMaintenancePlan>[] = [
    {
      header: 'Camion',
      key: 'truck',
      render: (item) => {
        const truck = trucksById.get(item.truckId)

        return (
          <div className={styles.truckCell}>
            <strong>{truck?.plate || item.truckId}</strong>
            <span className={styles.truckMeta}>
              {truck ? `${truck.brand} ${truck.model} - ${truck.currentOdometer.toLocaleString('es-CL')} km` : 'Camion no encontrado'}
            </span>
            {truck ? <TruckStatusBadge status={truck.operationalStatus} /> : null}
          </div>
        )
      },
      searchableValue: (item) => {
        const truck = trucksById.get(item.truckId)
        return truck ? `${truck.plate} ${truck.brand} ${truck.model} ${truck.operationalStatus}` : item.truckId
      },
      sortValue: (item) => trucksById.get(item.truckId)?.plate || item.truckId,
    },
    {
      header: 'Plan preventivo',
      key: 'type',
      render: (item) => {
        const truck = trucksById.get(item.truckId)
        const snapshot = getMaintenancePlanSnapshot(item, truck)

        return (
          <div className={styles.planCell}>
            <strong>{maintenanceTypeLabels[item.maintenanceType]}</strong>
            <span className={styles.truckMeta}>{item.description}</span>
            <span className={styles.truckMeta}>{snapshot.frequencyLabel}</span>
          </div>
        )
      },
      searchableValue: (item) => `${maintenanceTypeLabels[item.maintenanceType]} ${item.description}`,
      sortValue: (item) => maintenanceTypeLabels[item.maintenanceType],
    },
    {
      header: 'Proximo gatillo',
      key: 'next',
      render: (item) => {
        const truck = trucksById.get(item.truckId)
        const snapshot = getMaintenancePlanSnapshot(item, truck)

        return (
          <div className={styles.nextCell}>
            <strong>{snapshot.dueLabel}</strong>
            <span className={styles.truckMeta}>{snapshot.distanceLabel}</span>
            <span className={styles.truckMeta}>{item.nextDueAt ? formatDate(item.nextDueAt) : 'Sin fecha objetivo'}</span>
          </div>
        )
      },
      sortValue: (item) => {
        const truck = trucksById.get(item.truckId)
        const snapshot = getMaintenancePlanSnapshot(item, truck)
        return snapshot.daysRemaining ?? snapshot.kmRemaining ?? Number.MAX_SAFE_INTEGER
      },
    },
    {
      header: 'Decision operativa',
      key: 'decision',
      render: (item) => {
        const truck = trucksById.get(item.truckId)
        const snapshot = getMaintenancePlanSnapshot(item, truck)

        return (
          <div className={styles.decisionCell}>
            <span className={styles.badgeLine}>
              <MaintenanceDueBadge status={snapshot.effectiveRisk} />
              <Badge tone={snapshot.tone}>{snapshot.decisionLabel}</Badge>
            </span>
            <span className={styles.truckMeta}>{snapshot.decisionHelper}</span>
            <div className={styles.progressTrack} aria-hidden>
              <span style={{ width: `${snapshot.progress}%` }} />
            </div>
          </div>
        )
      },
      searchableValue: (item) => {
        const truck = trucksById.get(item.truckId)
        const snapshot = getMaintenancePlanSnapshot(item, truck)
        return `${snapshot.effectiveRisk} ${snapshot.decisionLabel} ${snapshot.decisionHelper}`
      },
      sortValue: (item) => getMaintenancePlanSnapshot(item, trucksById.get(item.truckId)).progress,
    },
    {
      align: 'right',
      header: 'Responsable',
      key: 'owner',
      render: (item) => item.assignedTo || 'Taller',
    },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <Link to={ROUTES.preventiveMaintenanceDetail(item.id)}>
          <Button size="sm" variant="secondary">
            Abrir
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={plans}
      density="compact"
      enableSearch
      emptyDescription="Crea planes por camion para controlar vencimientos por kilometraje, fecha o ambos."
      getRowHref={(item) => ROUTES.preventiveMaintenanceDetail(item.id)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir plan preventivo ${maintenanceTypeLabels[item.maintenanceType]}`}
      getSearchText={(item) => {
        const truck = trucksById.get(item.truckId)
        const snapshot = getMaintenancePlanSnapshot(item, truck)

        return [
          truck?.plate,
          truck?.brand,
          truck?.model,
          truck?.operationalStatus,
          maintenanceTypeLabels[item.maintenanceType],
          item.description,
          item.assignedTo,
          snapshot.effectiveRisk,
          snapshot.decisionLabel,
          snapshot.dueLabel,
        ].join(' ')
      }}
      initialSort={{ direction: 'desc', key: 'decision' }}
      searchPlaceholder="Buscar camion, patente, tipo, responsable, riesgo o gatillo"
    />
  )
}
