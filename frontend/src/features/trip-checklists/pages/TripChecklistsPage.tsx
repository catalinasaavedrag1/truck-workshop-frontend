import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Camera, ClipboardCheck, Flag, Gauge, MapPin, Package, Route, Send, ShieldCheck, Truck } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { formatDate } from '../../../shared/utils/formatDate'
import { driversMock } from '../../drivers/mocks/drivers.mock'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import { freightRequestsMock } from '../../freight/mocks/freight.mock'
import { ChecklistStatusBadge } from '../components/ChecklistStatusBadge'
import { ChecklistSummaryCard } from '../components/ChecklistSummaryCard'
import styles from '../components/TripChecklistModule.module.css'
import { arrivalChecklistsMock, departureChecklistsMock } from '../mocks/tripChecklists.mock'
import type { TripArrivalChecklist, TripDepartureChecklist } from '../types/tripChecklists.types'

export function TripChecklistsPage() {
  const { data: departureChecklists } = useResourceList<TripDepartureChecklist>(
    '/trip-checklists/departures',
    departureChecklistsMock,
    { order: 'desc', sort: 'departureAt' },
  )
  const { data: arrivalChecklists } = useResourceList<TripArrivalChecklist>(
    '/trip-checklists/arrivals',
    arrivalChecklistsMock,
    { order: 'desc', sort: 'arrivalAt' },
  )

  const arrivalFreightIds = new Set(arrivalChecklists.map((checklist) => checklist.freightId))
  const pendingDepartureRequests = freightRequestsMock.filter(
    (request) =>
      ['APPROVED', 'ASSIGNED'].includes(request.status) &&
      !departureChecklists.some((checklist) => checklist.freightId === request.id && checklist.status !== 'BLOCKED'),
  )
  const inRouteDepartures = departureChecklists.filter(
    (checklist) => checklist.status === 'COMPLETED' && !arrivalFreightIds.has(checklist.freightId),
  )
  const arrivalsWithIssues = arrivalChecklists.filter((checklist) => checklist.status === 'WITH_OBSERVATIONS' || checklist.newDamages)
  const blockedDepartures = departureChecklists.filter((checklist) => checklist.status === 'BLOCKED')

  const activity = [
    ...departureChecklists.map((checklist) => ({
      date: checklist.departureAt,
      driverId: checklist.driverId,
      evidenceCount: checklist.photos.length,
      freightId: checklist.freightId,
      icon: <Send aria-hidden size={17} />,
      id: checklist.id,
      label: 'Salida',
      status: checklist.status,
      truckId: checklist.truckId,
    })),
    ...arrivalChecklists.map((checklist) => ({
      date: checklist.arrivalAt,
      driverId: checklist.driverId,
      evidenceCount: checklist.photos.length + (checklist.receiverSignatureUrl ? 1 : 0),
      freightId: checklist.freightId,
      icon: <Flag aria-hidden size={17} />,
      id: checklist.id,
      label: 'Entrada',
      status: checklist.status,
      truckId: checklist.truckId,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const operationCards = [
    {
      action: 'Crear salida',
      description: 'Fletes aprobados o asignados que aun necesitan inspeccion antes de despacho.',
      icon: <Send aria-hidden size={18} />,
      items: pendingDepartureRequests.slice(0, 3).map((request) => ({
        helper: `${request.originAddress} -> ${request.destinationAddress}`,
        title: `${request.requestNumber} - ${request.customerName}`,
      })),
      route: ROUTES.tripChecklistDeparture,
      tone: 'info',
      value: pendingDepartureRequests.length,
      title: 'Pendiente salida',
    },
    {
      action: 'Cerrar entrada',
      description: 'Camiones con salida conforme y sin entrada registrada.',
      icon: <Truck aria-hidden size={18} />,
      items: inRouteDepartures.slice(0, 3).map((checklist) => ({
        helper: getFreightRoute(checklist.freightId),
        title: getTruckLabel(checklist.truckId),
      })),
      route: ROUTES.tripChecklistArrival,
      tone: 'success',
      value: inRouteDepartures.length,
      title: 'En ruta / retorno',
    },
    {
      action: 'Revisar novedad',
      description: 'Entradas con dano, diferencia de carga u observacion operacional.',
      icon: <AlertTriangle aria-hidden size={18} />,
      items: arrivalsWithIssues.slice(0, 3).map((checklist) => ({
        helper: checklist.observations || checklist.cargoStatus,
        title: getTruckLabel(checklist.truckId),
      })),
      route: ROUTES.tripChecklistArrival,
      tone: arrivalsWithIssues.length > 0 ? 'warning' : 'success',
      value: arrivalsWithIssues.length,
      title: 'Entradas con novedad',
    },
    {
      action: 'Corregir bloqueo',
      description: 'Salidas detenidas por control critico no apto.',
      icon: <ShieldCheck aria-hidden size={18} />,
      items: blockedDepartures.slice(0, 3).map((checklist) => ({
        helper: checklist.observations || 'Control critico no apto',
        title: getTruckLabel(checklist.truckId),
      })),
      route: ROUTES.tripChecklistDeparture,
      tone: blockedDepartures.length > 0 ? 'danger' : 'success',
      value: blockedDepartures.length,
      title: 'Bloqueos de patio',
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            <Link to={ROUTES.tripChecklistDeparture}>
              <Button icon={<Send size={18} />}>Registrar salida</Button>
            </Link>
            <Link to={ROUTES.tripChecklistArrival}>
              <Button icon={<Flag size={18} />} variant="secondary">
                Registrar entrada
              </Button>
            </Link>
          </div>
        }
        description="Inspeccion operacional de camiones para salida de patio, retorno, evidencia y bloqueo antes de ruta."
        title="Checklist entrada/salida"
      />
      <ChecklistSummaryCard arrivals={arrivalChecklists} departures={departureChecklists} />
      <Card className={styles.flowCard}>
        <div className={styles.activityHeader}>
          <div>
            <h2 className="section-title">Flujo de inspeccion de patio</h2>
            <p className={styles.muted}>La lectura parte por el flete, valida camion y chofer, y cierra con evidencia de entrada o salida.</p>
          </div>
          <Gauge aria-hidden size={20} />
        </div>
        <div className={styles.flowSteps}>
          <div className={styles.flowStep}>
            <span className={styles.flowIcon}>
              <Package aria-hidden size={17} />
            </span>
            <strong>Flete asignado</strong>
            <small>Cliente, ruta y carga claros.</small>
          </div>
          <ArrowRight aria-hidden className={styles.flowArrow} size={18} />
          <div className={styles.flowStep}>
            <span className={styles.flowIcon}>
              <ShieldCheck aria-hidden size={17} />
            </span>
            <strong>Salida de patio</strong>
            <small>Seguridad, documentos y carga.</small>
          </div>
          <ArrowRight aria-hidden className={styles.flowArrow} size={18} />
          <div className={styles.flowStep}>
            <span className={styles.flowIcon}>
              <Truck aria-hidden size={17} />
            </span>
            <strong>Ruta / retorno</strong>
            <small>Unidad en operacion.</small>
          </div>
          <ArrowRight aria-hidden className={styles.flowArrow} size={18} />
          <div className={styles.flowStep}>
            <span className={styles.flowIcon}>
              <ClipboardCheck aria-hidden size={17} />
            </span>
            <strong>Entrada y cierre</strong>
            <small>Recepcion, dano y firma.</small>
          </div>
        </div>
      </Card>
      <div className={styles.operationsGrid}>
        {operationCards.map((card) => (
          <Card className={[styles.operationCard, styles[card.tone]].join(' ')} key={card.title}>
            <div className={styles.operationCardHeader}>
              <span className={styles.icon}>{card.icon}</span>
              <div>
                <span className={styles.label}>{card.title}</span>
                <strong className={styles.operationValue}>{card.value}</strong>
              </div>
            </div>
            <p className={styles.muted}>{card.description}</p>
            <div className={styles.operationList}>
              {card.items.length > 0 ? (
                card.items.map((item) => (
                  <div className={styles.operationItem} key={`${card.title}-${item.title}`}>
                    <strong>{item.title}</strong>
                    <span>{item.helper}</span>
                  </div>
                ))
              ) : (
                <div className={styles.operationItem}>
                  <strong>Sin pendientes</strong>
                  <span>La operacion no requiere accion inmediata.</span>
                </div>
              )}
            </div>
            <Link to={card.route}>
              <Button fullWidth icon={<ArrowRight size={16} />} size="sm" variant="secondary">
                {card.action}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
      <Card>
        <div className={styles.patternGrid}>
          <div className={styles.patternCard}>
            <div className={styles.patternHeader}>
              <div className={styles.patternCopy}>
                <span className={styles.phaseLabel}>Salida</span>
                <strong>Aptitud antes de ruta</strong>
              </div>
              <span className={styles.patternIcon}>
                <ShieldCheck aria-hidden size={17} />
              </span>
            </div>
            <div className={styles.patternList}>
              <span className={styles.patternItem}>
                Frenos/documentos <Badge tone="danger">Bloquea</Badge>
              </span>
              <span className={styles.patternItem}>
                Fluidos/neumaticos <Badge tone="warning">Observa</Badge>
              </span>
            </div>
          </div>
          <div className={styles.patternCard}>
            <div className={styles.patternHeader}>
              <div className={styles.patternCopy}>
                <span className={styles.phaseLabel}>Llegada</span>
                <strong>Cierre de recepcion</strong>
              </div>
              <span className={styles.patternIcon}>
                <ClipboardCheck aria-hidden size={17} />
              </span>
            </div>
            <div className={styles.patternList}>
              <span className={styles.patternItem}>
                Recepcion conforme <Badge tone="success">Cierra</Badge>
              </span>
              <span className={styles.patternItem}>
                Dano o diferencia <Badge tone="warning">Novedad</Badge>
              </span>
            </div>
          </div>
          <div className={styles.patternCard}>
            <div className={styles.patternHeader}>
              <div className={styles.patternCopy}>
                <span className={styles.phaseLabel}>Evidencia</span>
                <strong>Respaldo operacional</strong>
              </div>
              <span className={styles.patternIcon}>
                <Camera aria-hidden size={17} />
              </span>
            </div>
            <div className={styles.patternList}>
              <span className={styles.patternItem}>
                Fotos <Badge tone="info">Visual</Badge>
              </span>
              <span className={styles.patternItem}>
                Firma recepcion <Badge tone="success">Conforme</Badge>
              </span>
            </div>
          </div>
        </div>
      </Card>
      <Card className={styles.activityCard}>
        <div className={styles.activityHeader}>
          <div>
            <h2 className="section-title">Actividad reciente</h2>
            <p className={styles.muted}>Secuencia combinada de salidas y entradas por camion, chofer y flete.</p>
          </div>
          <Route aria-hidden size={20} />
        </div>
        <div className={styles.activityList}>
          {activity.map((checklist) => (
            <div className={styles.activityRow} key={checklist.id}>
              <span className={styles.activityIcon}>{checklist.icon}</span>
              <div className={styles.activityCopy}>
                <strong>
                  {checklist.label} {getTruckLabel(checklist.truckId)}
                </strong>
                <div className={styles.activityMeta}>
                  <span>{formatDate(checklist.date)}</span>
                  <span>{getDriverLabel(checklist.driverId)}</span>
                  <span>{getFreightNumber(checklist.freightId)}</span>
                  <span>{checklist.evidenceCount} evidencias</span>
                </div>
                <div className={styles.activityRoute}>
                  <MapPin aria-hidden size={14} />
                  <span>{getFreightRoute(checklist.freightId)}</span>
                </div>
              </div>
              <ChecklistStatusBadge status={checklist.status} />
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  )
}

function getTruckLabel(truckId: string) {
  const truck = fleetTrucksMock.find((item) => item.id === truckId)

  return truck ? `${truck.plate} - ${truck.brand} ${truck.model}` : truckId
}

function getDriverLabel(driverId: string) {
  const driver = driversMock.find((item) => item.id === driverId)

  return driver ? driver.name : driverId
}

function getFreightNumber(freightId: string) {
  const freight = freightRequestsMock.find((item) => item.id === freightId)

  return freight ? freight.requestNumber : `Flete ${freightId}`
}

function getFreightRoute(freightId: string) {
  const freight = freightRequestsMock.find((item) => item.id === freightId)

  return freight ? `${freight.originAddress} -> ${freight.destinationAddress}` : 'Ruta no asociada'
}
