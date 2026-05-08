import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { driversMock } from '../../drivers/mocks/drivers.mock'
import type { Driver } from '../../drivers/types/driver.types'
import { trucksMock } from '../../../mocks/trucks.mock'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { formatDate } from '../../../shared/utils/formatDate'
import { FreightAssignmentControlPanel } from '../components/FreightAssignmentControlPanel'
import { FreightAssignmentForm } from '../components/FreightAssignmentForm'
import { FreightAssignmentStatusBadge } from '../components/FreightAssignmentStatusBadge'
import { FreightOperationsSummary } from '../components/FreightOperationsSummary'
import { freightAssignmentsMock, freightQuotesMock, freightRequestsMock } from '../mocks/freight.mock'
import type { FreightAssignment, FreightQuote, FreightRequest } from '../types/freight.types'
import type { Truck } from '../../trucks/types/truck.types'
import styles from '../components/FreightModule.module.css'

export function FreightAssignmentsPage() {
  const [savedAssignments, setSavedAssignments] = useState<FreightAssignment[]>([])
  const { data: drivers } = useResourceList<Driver>('/drivers', driversMock, { order: 'asc', sort: 'name' })
  const { data: trucks } = useResourceList<Truck>('/trucks', trucksMock, { order: 'asc', sort: 'plate' })
  const { data: loadedFreightAssignments } = useResourceList<FreightAssignment>(
    '/freight/assignments',
    freightAssignmentsMock,
    { order: 'asc', sort: 'pickupDate' },
  )
  const { data: freightRequests } = useResourceList<FreightRequest>('/freight/requests', freightRequestsMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: freightQuotes } = useResourceList<FreightQuote>('/freight/quotes', freightQuotesMock, {
    order: 'desc',
    sort: 'validUntil',
  })
  const freightAssignments = useMemo(() => {
    const savedById = new Map(savedAssignments.map((assignment) => [assignment.id, assignment]))

    return [
      ...loadedFreightAssignments.filter((assignment) => !savedById.has(assignment.id)),
      ...savedAssignments,
    ].sort((first, second) => new Date(first.pickupDate).getTime() - new Date(second.pickupDate).getTime())
  }, [loadedFreightAssignments, savedAssignments])

  const handleSaved = (assignment: FreightAssignment) => {
    setSavedAssignments((current) => [
      assignment,
      ...current.filter((item) => item.id !== assignment.id),
    ])
  }

  const columns: TableColumn<FreightAssignment>[] = [
    {
      header: 'Solicitud',
      key: 'requestId',
      render: (item) => {
        const request = freightRequests.find((candidate) => candidate.id === item.requestId)

        return request ? (
          <div>
            <strong>{request.requestNumber}</strong>
            <p className="muted-text">{request.customerName}</p>
          </div>
        ) : (
          item.requestId
        )
      },
    },
    {
      header: 'Recurso',
      key: 'truckId',
      render: (item) => {
        const truck = trucks.find((candidate) => candidate.id === item.truckId)
        const driver = drivers.find((candidate) => candidate.id === item.driverId)

        return (
          <div>
            <strong>{truck?.plate || item.truckId}</strong>
            <p className="muted-text">{driver?.name || item.driverId}</p>
          </div>
        )
      },
      searchableValue: (item) => `${item.truckId} ${item.driverId}`,
    },
    { header: 'Asignado por', key: 'assignedBy', render: (item) => item.assignedBy || item.createdBy || 'Sistema' },
    { header: 'Retiro', key: 'pickupDate', render: (item) => formatDate(item.pickupDate), sortValue: (item) => new Date(item.pickupDate) },
    { header: 'Estado', key: 'status', render: (item) => <FreightAssignmentStatusBadge status={item.status} /> },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <Link to={ROUTES.freightRequestDetail(item.requestId)}>
          <Button size="sm" variant="secondary">
            Ver solicitud
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        description="Centro de control para convertir fletes aprobados en despachos con camion y chofer."
        title="Asignacion de fletes"
      />
      <FreightOperationsSummary assignments={freightAssignments} quotes={freightQuotes} requests={freightRequests} />
      <FreightAssignmentControlPanel
        assignments={freightAssignments}
        drivers={drivers}
        requests={freightRequests}
        trucks={trucks}
      />
      <div className={styles.workbench}>
        <Card>
          <div className="stack">
            <div>
              <h2 className="section-title">Agenda de asignaciones</h2>
              <p className="muted-text">Camion, chofer, retiro y trazabilidad de despacho.</p>
            </div>
            <Table
              columns={columns}
              data={freightAssignments}
              density="compact"
              enablePagination
              enableSearch
              getRowHref={(item) => ROUTES.freightRequestDetail(item.requestId)}
              getRowKey={(item) => item.id}
              getRowLabel={(item) => `Abrir solicitud asociada a la asignacion ${item.id}`}
              getSearchText={(item) => {
                const request = freightRequests.find((candidate) => candidate.id === item.requestId)
                const truck = trucks.find((candidate) => candidate.id === item.truckId)
                const driver = drivers.find((candidate) => candidate.id === item.driverId)

                return `${request?.requestNumber || item.requestId} ${request?.customerName || ''} ${truck?.plate || item.truckId} ${driver?.name || item.driverId} ${item.assignedBy} ${item.status}`
              }}
              initialSort={{ direction: 'asc', key: 'pickupDate' }}
              searchPlaceholder="Buscar solicitud, camion, chofer, retiro o estado"
            />
          </div>
        </Card>
        <FreightAssignmentForm drivers={drivers} freightRequests={freightRequests} onSaved={handleSaved} trucks={trucks} />
      </div>
    </PageContainer>
  )
}
