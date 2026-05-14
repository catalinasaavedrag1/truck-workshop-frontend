import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { EntityLink } from '../../../shared/components/EntityLink'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type { Driver } from '../../drivers/types/driver.types'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import type { FreightRequest } from '../../freight/types/freight.types'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import { incidentStatusLabels } from '../constants/incidents.constants'
import type { Incident } from '../types/incidents.types'
import { IncidentSeverityBadge } from './IncidentSeverityBadge'
import { IncidentStatusBadge } from './IncidentStatusBadge'
import { IncidentTypeBadge } from './IncidentTypeBadge'
import styles from './IncidentsModule.module.css'

interface IncidentTableProps {
  drivers: Driver[]
  freightRequests: FreightRequest[]
  incidents: Incident[]
  trucks: FleetTruck[]
  workshopCases: WorkshopCase[]
}

export function IncidentTable({ drivers, freightRequests, incidents, trucks, workshopCases }: IncidentTableProps) {
  const columns: TableColumn<Incident>[] = [
    {
      header: 'Incidente',
      key: 'number',
      render: (item) => (
        <div className={styles.incidentIdentity}>
          <EntityLink id={item.id} type="incident">
            {item.incidentNumber}
          </EntityLink>
          <span>{item.description}</span>
        </div>
      ),
      sortValue: (item) => item.incidentNumber,
    },
    {
      header: 'Activo / chofer',
      key: 'asset',
      render: (item) => {
        const truck = trucks.find((truckItem) => truckItem.id === item.truckId)
        const driver = drivers.find((driverItem) => driverItem.id === item.driverId)

        return (
          <div className={styles.incidentIdentity}>
            <EntityLink id={item.truckId} type="truck">
              {truck?.plate || item.truckId}
            </EntityLink>
            {item.driverId ? (
              <EntityLink id={item.driverId} type="driver" variant="subtle">
                {driver?.name || item.driverId}
              </EntityLink>
            ) : (
              <span>Sin chofer asociado</span>
            )}
          </div>
        )
      },
      sortValue: (item) => trucks.find((truck) => truck.id === item.truckId)?.plate || item.truckId,
    },
    {
      header: 'Modulo conectado',
      key: 'links',
      render: (item) => {
        const freight = freightRequests.find((request) => request.id === item.freightId)
        const workshopCase = workshopCases.find((workshopCaseItem) => workshopCaseItem.id === item.workshopCaseId)

        return (
          <div className={styles.chipLine}>
            {freight ? (
              <EntityLink id={freight.id} type="freightRequest" variant="subtle">
                {freight.requestNumber}
              </EntityLink>
            ) : null}
            {workshopCase ? (
              <EntityLink id={workshopCase.id} type="case" variant="subtle">
                {workshopCase.caseNumber}
              </EntityLink>
            ) : null}
            {!freight && !workshopCase ? <span className="muted-text">Solo flota</span> : null}
          </div>
        )
      },
      searchableValue: (item) => [
        item.freightId,
        item.workshopCaseId,
        freightRequests.find((request) => request.id === item.freightId)?.requestNumber,
        workshopCases.find((workshopCase) => workshopCase.id === item.workshopCaseId)?.caseNumber,
      ].join(' '),
    },
    { header: 'Tipo', key: 'type', render: (item) => <IncidentTypeBadge type={item.incidentType} /> },
    { header: 'Severidad', key: 'severity', render: (item) => <IncidentSeverityBadge severity={item.severity} /> },
    { header: 'Estado', key: 'status', render: (item) => <IncidentStatusBadge status={item.status} /> },
    { header: 'Fecha', key: 'date', render: (item) => formatDate(item.occurredAt), sortValue: (item) => item.occurredAt },
    { align: 'right', header: 'Costo', key: 'cost', render: (item) => formatCurrency(item.estimatedCost || 0), sortValue: (item) => item.estimatedCost || 0 },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <Link to={ROUTES.incidentDetail(item.id)}>
          <Button size="sm" variant="secondary">
            Ver
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={incidents}
      density="compact"
      enableSearch
      getRowHref={(item) => ROUTES.incidentDetail(item.id)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir incidente ${item.incidentNumber}`}
      getSearchText={(item) => [
        item.incidentNumber,
        item.description,
        item.location,
        item.truckId,
        trucks.find((truck) => truck.id === item.truckId)?.plate,
        drivers.find((driver) => driver.id === item.driverId)?.name,
        freightRequests.find((request) => request.id === item.freightId)?.requestNumber,
        workshopCases.find((workshopCase) => workshopCase.id === item.workshopCaseId)?.caseNumber,
        incidentStatusLabels[item.status],
      ].join(' ')}
      initialSort={{ direction: 'desc', key: 'date' }}
      pageSize={10}
      searchPlaceholder="Buscar incidente, camion, chofer, tipo o severidad"
    />
  )
}
