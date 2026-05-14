import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, DollarSign, FileText, MessageSquare, Route, Truck, UserRound, Wrench } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { casesMock } from '../../../mocks/cases.mock'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { EntityLink as InlineEntityLink } from '../../../shared/components/EntityLink'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceItem } from '../../../shared/hooks/useResourceItem'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { driverDocumentsMock, driverFinesMock } from '../../drivers/mocks/driverDocuments.mock'
import { driversMock } from '../../drivers/mocks/drivers.mock'
import type { Driver, DriverDocument, DriverFine } from '../../drivers/types/driver.types'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import { freightRequestsMock } from '../../freight/mocks/freight.mock'
import type { FreightRequest } from '../../freight/types/freight.types'
import { truckCostsMock } from '../../truck-costs/mocks/truckCosts.mock'
import type { TruckCost } from '../../truck-costs/types/truckCosts.types'
import { truckDocumentsMock } from '../../truck-documents/mocks/truckDocuments.mock'
import type { TruckDocument } from '../../truck-documents/types/truckDocuments.types'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import { IncidentSeverityBadge } from '../components/IncidentSeverityBadge'
import { IncidentStatusBadge } from '../components/IncidentStatusBadge'
import { IncidentTimeline } from '../components/IncidentTimeline'
import { IncidentTypeBadge } from '../components/IncidentTypeBadge'
import styles from '../components/IncidentsModule.module.css'
import { incidentsMock } from '../mocks/incidents.mock'

export function IncidentDetailPage() {
  const { incidentId } = useParams()
  const { data: incident } = useResourceItem('/incidents', incidentId, incidentsMock)
  const { data: fleetTrucks } = useResourceList<FleetTruck>('/fleet/trucks', fleetTrucksMock, {
    order: 'asc',
    sort: 'plate',
  })
  const { data: drivers } = useResourceList<Driver>('/drivers', driversMock, { order: 'asc', sort: 'name' })
  const { data: freightRequests } = useResourceList<FreightRequest>('/freight/requests', freightRequestsMock, {
    order: 'desc',
    sort: 'updatedAt',
  })
  const { data: workshopCases } = useResourceList<WorkshopCase>('/workshop-cases', casesMock, {
    order: 'desc',
    sort: 'updatedAt',
  })
  const { data: truckDocuments } = useResourceList<TruckDocument>('/truck-documents', truckDocumentsMock, {
    order: 'asc',
    sort: 'expiresAt',
  })
  const { data: driverDocuments } = useResourceList<DriverDocument>('/driver-documents', driverDocumentsMock, {
    order: 'asc',
    sort: 'expiresAt',
  })
  const { data: driverFines } = useResourceList<DriverFine>('/driver-fines', driverFinesMock, {
    order: 'desc',
    sort: 'occurredAt',
  })
  const { data: truckCosts } = useResourceList<TruckCost>('/truck-costs', truckCostsMock, {
    order: 'desc',
    sort: 'date',
  })

  if (!incident) {
    return (
      <PageContainer>
        <EmptyState icon={<AlertCircle size={22} />} title="Incidente no encontrado" />
      </PageContainer>
    )
  }

  const truck = fleetTrucks.find((item) => item.id === incident.truckId)
  const driver = drivers.find((item) => item.id === incident.driverId)
  const freight = freightRequests.find((item) => item.id === incident.freightId)
  const workshopCase = workshopCases.find((item) => item.id === incident.workshopCaseId)
  const relatedTruckDocuments = truckDocuments.filter((document) => document.truckId === incident.truckId)
  const relatedDriverDocuments = driverDocuments.filter((document) => document.driverId === incident.driverId)
  const relatedFines = driverFines.filter((fine) => fine.incidentId === incident.id)
  const relatedCosts = truckCosts.filter((cost) => cost.relatedEntityType === 'incident' && cost.relatedEntityId === incident.id)
  const documentAlerts = [
    ...relatedTruckDocuments.filter((document) => document.status === 'EXPIRED' || document.status === 'MISSING'),
    ...relatedDriverDocuments.filter((document) => document.status === 'EXPIRED' || document.status === 'MISSING'),
  ]
  const workshopCaseHref = workshopCase
    ? ROUTES.caseDetail(workshopCase.id)
    : `${ROUTES.caseNew}?${new URLSearchParams({
        description: incident.description,
        driverId: incident.driverId || '',
        failureCategory: incident.incidentType === 'ROAD_FAILURE' ? 'engine' : incident.incidentType === 'DAMAGE' ? 'body' : 'other',
        incidentId: incident.id,
        location: incident.location,
        priority: incident.severity === 'CRITICAL' ? 'critical' : incident.severity === 'HIGH' ? 'high' : 'medium',
        source: 'incident',
        title: incident.description,
        truckId: incident.truckId,
      }).toString()}`

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <div className="inline-actions">
              <Link to={ROUTES.incidents}>
                <Button size="sm" variant="secondary">
                  Volver
                </Button>
              </Link>
              <Link to={workshopCaseHref}>
                <Button icon={<Wrench size={18} />} size="sm">
                  {workshopCase ? 'Abrir caso taller' : 'Crear caso taller'}
                </Button>
              </Link>
            </div>
          }
          description={`${truck?.plate || incident.truckId} / ${incident.location} / ${formatDate(incident.occurredAt)}`}
          title={incident.incidentNumber}
        />

        <div className={styles.detailGrid}>
          <div className={styles.detailStack}>
            <Card className={styles.heroCard}>
              <div className={styles.heroTop}>
                <div className={styles.heroTitle}>
                  <h2>{incident.description}</h2>
                  <p>{incident.notes || 'Sin nota operacional adicional. Usa las conexiones laterales para derivar el seguimiento.'}</p>
                </div>
                <div className={styles.statusRail}>
                  <IncidentTypeBadge type={incident.incidentType} />
                  <IncidentSeverityBadge severity={incident.severity} />
                  <IncidentStatusBadge status={incident.status} />
                </div>
              </div>
              <div className={styles.contextList}>
                <ContextItem
                  label="Camion"
                  value={
                    <InlineEntityLink id={incident.truckId} type="truck">
                      {truck ? `${truck.plate} / ${truck.brand} ${truck.model}` : incident.truckId}
                    </InlineEntityLink>
                  }
                />
                <ContextItem
                  label="Chofer"
                  value={
                    incident.driverId ? (
                      <InlineEntityLink id={incident.driverId} type="driver">
                        {driver?.name || incident.driverId}
                      </InlineEntityLink>
                    ) : (
                      'Sin chofer'
                    )
                  }
                />
                <ContextItem
                  label="Flete"
                  value={
                    freight ? (
                      <InlineEntityLink id={freight.id} type="freightRequest">
                        {freight.requestNumber} / {freight.customerName}
                      </InlineEntityLink>
                    ) : (
                      'No vinculado'
                    )
                  }
                />
                <ContextItem
                  label="Caso taller"
                  value={
                    workshopCase ? (
                      <InlineEntityLink id={workshopCase.id} type="case">
                        {workshopCase.caseNumber}
                      </InlineEntityLink>
                    ) : (
                      'No derivado'
                    )
                  }
                />
                <ContextItem label="Costo estimado" value={formatCurrency(incident.estimatedCost || 0)} />
                <ContextItem label="Costo contabilizado" value={formatCurrency(relatedCosts.reduce((sum, cost) => sum + cost.amount, 0))} />
              </div>
              {documentAlerts.length > 0 ? (
                <div className={styles.riskPanel}>
                  <strong>Alerta documental</strong>
                  <span className={styles.metaText}>
                    Hay {documentAlerts.length} documento(s) vencidos o faltantes vinculados al camion/chofer. Revisar antes de reasignar ruta.
                  </span>
                </div>
              ) : null}
            </Card>

            <Card className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Modulos conectados</h2>
                  <p>Accesos directos al contexto que debe saber de esta incidencia.</p>
                </div>
              </div>
              <div className={styles.entityGrid}>
                <EntityLink icon={<Truck size={17} />} label="Camion" text={truck?.plate || incident.truckId} to={ROUTES.fleetTruckDetail(incident.truckId)} />
                <EntityLink icon={<UserRound size={17} />} label="Chofer" text={driver?.name || 'Sin chofer'} to={incident.driverId ? ROUTES.driverDetail(incident.driverId) : ROUTES.drivers} />
                <EntityLink icon={<Route size={17} />} label="Flete" text={freight?.requestNumber || 'Ver fletes'} to={freight ? ROUTES.freightRequestDetail(freight.id) : ROUTES.freightRequests} />
                <EntityLink icon={<Wrench size={17} />} label="Taller" text={workshopCase?.caseNumber || 'Crear/derivar caso'} to={workshopCaseHref} />
                <EntityLink icon={<DollarSign size={17} />} label="Costos camion" text="Impacto mensual/anual" to={ROUTES.truckCostDetail(incident.truckId)} />
                <EntityLink icon={<FileText size={17} />} label="Documentacion" text={`${relatedTruckDocuments.length + relatedDriverDocuments.length} documentos vinculados`} to={ROUTES.truckDocuments} />
              </div>
            </Card>

            <IncidentTimeline incident={incident} />
          </div>

          <aside className={styles.sideStack}>
            <Card className={styles.sideSection}>
              <div className={styles.panelHeader}>
                <div>
                  <h3>Proxima accion</h3>
                  <p>{nextActionForIncident(Boolean(workshopCase), documentAlerts.length, incident.incidentType)}</p>
                </div>
              </div>
              <div className={styles.actionList}>
                <ActionLink icon={<Wrench size={16} />} label={workshopCase ? 'Revisar avance taller' : 'Derivar a taller'} to={workshopCaseHref} />
                <ActionLink icon={<Truck size={16} />} label="Ver disponibilidad flota" to={ROUTES.fleetAvailability} />
                <ActionLink icon={<MessageSquare size={16} />} label="Abrir comunicaciones" to={`${ROUTES.communications}?relatedEntityType=incident&relatedEntityId=${incident.id}`} />
              </div>
            </Card>

            <Card className={styles.sideSection}>
              <h3>Documentos y multas</h3>
              <div className={styles.contextList}>
                <ContextItem label="Docs camion" value={`${relatedTruckDocuments.length} asociados`} />
                <ContextItem label="Docs chofer" value={`${relatedDriverDocuments.length} asociados`} />
                <ContextItem label="Multas vinculadas" value={`${relatedFines.length}`} />
                <ContextItem label="Alertas documentales" value={`${documentAlerts.length}`} />
              </div>
              {relatedFines.map((fine) => (
                <div className={styles.suggestionItem} key={fine.id}>
                  <strong>{fine.fineNumber}</strong>
                  <span className={styles.metaText}>{fine.fineType} / {formatCurrency(fine.amount || 0)}</span>
                </div>
              ))}
            </Card>
          </aside>
        </div>
      </div>
    </PageContainer>
  )
}

function ContextItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={styles.contextItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function EntityLink({ icon, label, text, to }: { icon: ReactNode; label: string; text: string; to: string }) {
  return (
    <Link className={styles.entityCard} to={to}>
      <span className={styles.entityIcon}>{icon}</span>
      <span>{label}</span>
      <strong>{text}</strong>
    </Link>
  )
}

function ActionLink({ icon, label, to }: { icon: ReactNode; label: string; to: string }) {
  return (
    <Link className={styles.actionCard} to={to}>
      <div className={styles.actionTop}>
        <span className={styles.entityIcon}>{icon}</span>
        <strong>{label}</strong>
      </div>
    </Link>
  )
}

function nextActionForIncident(hasWorkshopCase: boolean, documentAlertCount: number, incidentType: string) {
  if (!hasWorkshopCase && ['ACCIDENT', 'DAMAGE', 'ROAD_FAILURE'].includes(incidentType)) {
    return 'Crear caso de taller para dejar responsable, SLA y bloqueo operativo.'
  }

  if (documentAlertCount > 0) {
    return 'Resolver documentos vencidos/faltantes antes de liberar camion o chofer.'
  }

  if (incidentType === 'FINE') {
    return 'Cerrar trazabilidad con chofer, multa y costo asociado al camion.'
  }

  return 'Mantener seguimiento hasta cerrar impacto operativo y costo.'
}
