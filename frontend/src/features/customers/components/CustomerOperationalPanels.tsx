import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import { Card } from '../../../shared/components/Card/Card'
import { EntityLink } from '../../../shared/components/EntityLink'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type { CommunicationConversation } from '../../communications/types/communication.types'
import { DriverTripSheetStatusBadge } from '../../driver-trip-sheets/components/DriverTripSheetStatusBadge'
import type { DriverTripSheet } from '../../driver-trip-sheets/types/driverTripSheet.types'
import { FreightAssignmentStatusBadge } from '../../freight/components/FreightAssignmentStatusBadge'
import { FreightMarginBadge } from '../../freight-profitability/components/FreightMarginBadge'
import type { FreightProfitability } from '../../freight-profitability/types/freightProfitability.types'
import { CasePriorityBadge } from '../../workshop-cases/components/CasePriorityBadge'
import { CaseStatusBadge } from '../../workshop-cases/components/CaseStatusBadge'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import type { Customer360Snapshot } from '../utils/customer360'
import { CustomerActivityTimeline } from './CustomerActivityTimeline'

interface CustomerOperationalPanelsProps {
  snapshot: Customer360Snapshot
}

interface AssignmentRow {
  assignment: Customer360Snapshot['freightAssignments'][number]
  request?: Customer360Snapshot['freightRequests'][number]
}

const conversationStatusTone: Record<CommunicationConversation['status'], BadgeTone> = {
  archived: 'neutral',
  open: 'info',
  pending: 'warning',
  resolved: 'success',
}

const priorityTone: Record<CommunicationConversation['priority'], BadgeTone> = {
  high: 'warning',
  low: 'neutral',
  medium: 'info',
  urgent: 'danger',
}

export function CustomerOperationalPanels({ snapshot }: CustomerOperationalPanelsProps) {
  const assignmentRows = snapshot.freightAssignments.map((assignment) => ({
    assignment,
    request: snapshot.freightRequests.find((request) => request.id === assignment.requestId),
  }))

  return (
    <div className="stack">
      <Card>
        <div className="stack">
          <SectionHeader
            description="Casos de taller asociados por ficha de cliente, nombre comercial o cotizaciones relacionadas."
            title="Taller del cliente"
          />
          <Table
            columns={caseColumns}
            data={snapshot.workshopCases}
            density="compact"
            emptyDescription="No hay casos de taller relacionados con este cliente."
            emptyLabel="Sin casos de taller"
            getRowHref={(workshopCase) => ROUTES.caseDetail(workshopCase.id)}
            getRowKey={(workshopCase) => workshopCase.id}
            getRowLabel={(workshopCase) => `Abrir caso ${workshopCase.caseNumber}`}
          />
        </div>
      </Card>

      <Card>
        <div className="stack">
          <SectionHeader
            description="Despacho, planillas de viaje y margen operativo reunidos desde fletes y rentabilidad."
            title="Despacho y viajes"
          />
          <Table
            columns={assignmentColumns}
            data={assignmentRows}
            density="compact"
            emptyDescription="No hay asignaciones de flete vinculadas al cliente."
            emptyLabel="Sin asignaciones"
            getRowHref={(row) => row.request ? ROUTES.freightRequestDetail(row.request.id) : ROUTES.freightAssignments}
            getRowKey={(row) => row.assignment.id}
            getRowLabel={(row) => `Abrir asignacion ${row.assignment.id}`}
          />
          <Table
            columns={tripSheetColumns}
            data={snapshot.tripSheets}
            density="compact"
            emptyDescription="No hay planillas de viaje vinculadas al cliente."
            emptyLabel="Sin planillas"
            getRowHref={(sheet) => `${ROUTES.driverTripSheets}?query=${encodeURIComponent(sheet.sheetNumber)}`}
            getRowKey={(sheet) => sheet.id}
            getRowLabel={(sheet) => `Abrir planilla ${sheet.sheetNumber}`}
          />
          <Table
            columns={profitabilityColumns}
            data={snapshot.freightProfitability}
            density="compact"
            emptyDescription="No hay cierres de rentabilidad para este cliente."
            emptyLabel="Sin rentabilidad"
            getRowHref={(item) => `${ROUTES.freightProfitability}?query=${encodeURIComponent(item.freightId)}`}
            getRowKey={(item) => item.id}
            getRowLabel={(item) => `Abrir rentabilidad ${item.freightId}`}
          />
        </div>
      </Card>

      <Card>
        <div className="stack">
          <SectionHeader
            description="Conversaciones, seguimientos y eventos recientes conectados al cliente."
            title="Comunicaciones y actividad"
          />
          <Table
            columns={conversationColumns}
            data={snapshot.conversations}
            density="compact"
            emptyDescription="No hay conversaciones vinculadas al cliente."
            emptyLabel="Sin comunicaciones"
            getRowHref={(conversation) => `${ROUTES.communications}?query=${encodeURIComponent(conversation.subject)}`}
            getRowKey={(conversation) => conversation.id}
            getRowLabel={(conversation) => `Abrir conversacion ${conversation.subject}`}
          />
          <CustomerActivityTimeline items={snapshot.activity} />
        </div>
      </Card>
    </div>
  )
}

const caseColumns: TableColumn<WorkshopCase>[] = [
  {
    header: 'Caso',
    key: 'caseNumber',
    render: (workshopCase) => (
      <div>
        <EntityLink id={workshopCase.id} type="case">
          {workshopCase.caseNumber}
        </EntityLink>
        <p className="muted-text">{workshopCase.title}</p>
      </div>
    ),
  },
  {
    header: 'Unidad',
    key: 'truck',
    render: (workshopCase) => (
      <div>
        <strong>{workshopCase.truckPlate}</strong>
        <p className="muted-text">{workshopCase.driverName}</p>
      </div>
    ),
  },
  { header: 'Prioridad', key: 'priority', render: (workshopCase) => <CasePriorityBadge priority={workshopCase.priority} /> },
  { header: 'Estado', key: 'status', render: (workshopCase) => <CaseStatusBadge status={workshopCase.status} /> },
  {
    header: 'SLA',
    key: 'slaStatus',
    render: (workshopCase) => <Badge tone={workshopCase.slaStatus === 'BREACHED' ? 'danger' : workshopCase.slaStatus === 'AT_RISK' ? 'warning' : 'success'}>{workshopCase.slaStatus}</Badge>,
  },
  { header: 'Actualizado', key: 'updatedAt', render: (workshopCase) => formatDate(workshopCase.updatedAt) },
]

const assignmentColumns: TableColumn<AssignmentRow>[] = [
  {
    header: 'Flete',
    key: 'request',
    render: (row) => row.request ? (
      <div>
        <EntityLink id={row.request.id} type="freightRequest">
          {row.request.requestNumber}
        </EntityLink>
        <p className="muted-text">{row.request.destinationAddress}</p>
      </div>
    ) : (
      <strong>{row.assignment.requestId}</strong>
    ),
  },
  {
    header: 'Equipo',
    key: 'truckDriver',
    render: (row) => (
      <div>
        <strong>{row.assignment.truckId}</strong>
        <p className="muted-text">{row.assignment.driverId}</p>
      </div>
    ),
  },
  { header: 'Retiro', key: 'pickupDate', render: (row) => formatDate(row.assignment.pickupDate) },
  { header: 'Estado', key: 'status', render: (row) => <FreightAssignmentStatusBadge status={row.assignment.status} /> },
]

const tripSheetColumns: TableColumn<DriverTripSheet>[] = [
  {
    header: 'Planilla',
    key: 'sheetNumber',
    render: (sheet) => (
      <Link to={`${ROUTES.driverTripSheets}?query=${encodeURIComponent(sheet.sheetNumber)}`}>
        {sheet.sheetNumber}
      </Link>
    ),
  },
  {
    header: 'Ruta',
    key: 'route',
    render: (sheet) => (
      <div>
        <strong>{sheet.truckPlate}</strong>
        <p className="muted-text">{sheet.originAddress || 'Origen pendiente'} - {sheet.destinationAddress || 'Destino pendiente'}</p>
      </div>
    ),
  },
  { align: 'right', header: 'Ingreso', key: 'revenue', render: (sheet) => formatCurrency(sheet.revenue) },
  { align: 'right', header: 'Margen', key: 'netMargin', render: (sheet) => formatCurrency(sheet.netMargin) },
  { header: 'Estado', key: 'status', render: (sheet) => <DriverTripSheetStatusBadge status={sheet.status} /> },
]

const profitabilityColumns: TableColumn<FreightProfitability>[] = [
  {
    header: 'Flete',
    key: 'freightId',
    render: (item) => (
      <EntityLink id={item.freightId} type="freightRequest">
        {item.freightId}
      </EntityLink>
    ),
  },
  { align: 'right', header: 'Ingreso', key: 'revenue', render: (item) => formatCurrency(item.revenue) },
  { align: 'right', header: 'Costo', key: 'totalCost', render: (item) => formatCurrency(item.totalCost) },
  { align: 'right', header: 'Margen neto', key: 'netMargin', render: (item) => formatCurrency(item.netMargin) },
  { header: 'Salud margen', key: 'marginPercentage', render: (item) => <FreightMarginBadge marginPercentage={item.marginPercentage} /> },
]

const conversationColumns: TableColumn<CommunicationConversation>[] = [
  {
    header: 'Conversacion',
    key: 'subject',
    render: (conversation) => (
      <div>
        <Link to={`${ROUTES.communications}?query=${encodeURIComponent(conversation.subject)}`}>
          {conversation.subject}
        </Link>
        <p className="muted-text">{conversation.contactName} - {conversation.contactAddress}</p>
      </div>
    ),
  },
  {
    header: 'Canal',
    key: 'channel',
    render: (conversation) => (
      <div>
        <strong>{conversation.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}</strong>
        <p className="muted-text">{conversation.profileName}</p>
      </div>
    ),
  },
  {
    header: 'Estado',
    key: 'status',
    render: (conversation) => (
      <div className="inline-actions">
        <Badge tone={conversationStatusTone[conversation.status]}>{conversation.status}</Badge>
        <Badge tone={priorityTone[conversation.priority]}>{conversation.priority}</Badge>
      </div>
    ),
  },
  { header: 'Ultimo mensaje', key: 'lastMessageAt', render: (conversation) => formatDate(conversation.lastMessageAt) },
]
