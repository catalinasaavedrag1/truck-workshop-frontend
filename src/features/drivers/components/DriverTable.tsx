import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import type { Driver, DriverDocument, DriverFine } from '../types/driver.types'
import { getDriverComplianceSummary } from '../utils/driverCompliance'
import { DriverStatusBadge } from './DriverStatusBadge'

interface DriverTableProps {
  documents?: DriverDocument[]
  drivers: Driver[]
  fines?: DriverFine[]
  trucks?: FleetTruck[]
}

export function DriverTable({ documents = [], drivers, fines = [], trucks = [] }: DriverTableProps) {
  const getAssignedTruck = (driverId: string) => trucks.find((truck) => truck.assignedDriverId === driverId)
  const getDriverDocuments = (driverId: string) => documents.filter((document) => document.driverId === driverId)
  const getDriverFines = (driverId: string) => fines.filter((fine) => fine.driverId === driverId)

  const columns: TableColumn<Driver>[] = [
    {
      header: 'Chofer',
      key: 'name',
      render: (item) => (
        <div>
          <strong>{item.name}</strong>
          <p className="muted-text">{item.document} - {item.company}</p>
        </div>
      ),
    },
    {
      header: 'Unidad asignada',
      key: 'assignedTruck',
      render: (item) => {
        const truck = getAssignedTruck(item.id)

        return truck ? (
          <div>
            <strong>{truck.plate}</strong>
            <p className="muted-text">
              {truck.brand} {truck.model}
            </p>
          </div>
        ) : (
          <span className="muted-text">Sin unidad</span>
        )
      },
      searchableValue: (item) => {
        const truck = getAssignedTruck(item.id)
        return truck ? `${truck.plate} ${truck.brand} ${truck.model}` : 'sin unidad'
      },
    },
    { header: 'Telefono', key: 'phone', render: (item) => item.phone },
    { header: 'Licencia', key: 'license', render: (item) => item.license },
    {
      header: 'Cumplimiento',
      key: 'compliance',
      render: (item) => {
        const summary = getDriverComplianceSummary(item, getDriverDocuments(item.id), getDriverFines(item.id))

        return (
          <div>
            <Badge tone={summary.tone}>{summary.decision}</Badge>
            <p className="muted-text">
              {summary.documentIssueCount} docs obs. / {summary.activeFineCount} multas
            </p>
          </div>
        )
      },
      searchableValue: (item) => {
        const summary = getDriverComplianceSummary(item, getDriverDocuments(item.id), getDriverFines(item.id))
        return `${summary.decision} ${summary.helper}`
      },
    },
    { header: 'Estado', key: 'status', render: (item) => <DriverStatusBadge status={item.status} /> },
    { align: 'right', header: 'Casos', key: 'caseIds', render: (item) => item.caseIds.length },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <Link to={ROUTES.driverDetail(item.id)}>
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
      data={drivers}
      enableSearch
      getRowHref={(item) => ROUTES.driverDetail(item.id)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir ficha del chofer ${item.name}`}
      getSearchText={(item) => {
        const truck = getAssignedTruck(item.id)
        const driverDocuments = getDriverDocuments(item.id)
        const driverFines = getDriverFines(item.id)

        return [
          item.name,
          item.document,
          item.phone,
          item.company,
          item.license,
          truck?.plate || '',
          ...driverDocuments.map((document) => `${document.documentType} ${document.documentNumber || ''} ${document.status}`),
          ...driverFines.map((fine) => `${fine.fineNumber} ${fine.fineType} ${fine.status} ${fine.description}`),
        ].join(' ')
      }}
      searchPlaceholder="Buscar chofer, documento, licencia, patente, multa o cumplimiento"
    />
  )
}
