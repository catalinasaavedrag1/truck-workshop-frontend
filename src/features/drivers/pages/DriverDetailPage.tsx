import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, FileText, Gauge, Phone, Truck } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceItem } from '../../../shared/hooks/useResourceItem'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import { DriverCasesHistory } from '../components/DriverCasesHistory'
import { DriverCompliancePanel } from '../components/DriverCompliancePanel'
import { DriverForm } from '../components/DriverForm'
import { DriverStatusBadge } from '../components/DriverStatusBadge'
import { driverDocumentsMock, driverFinesMock } from '../mocks/driverDocuments.mock'
import { driversMock } from '../mocks/drivers.mock'
import type { DriverDocument, DriverFine } from '../types/driver.types'

export function DriverDetailPage() {
  const { driverId } = useParams()
  const { data: driver } = useResourceItem('/drivers', driverId, driversMock)
  const { data: documents } = useResourceList<DriverDocument>('/driver-documents', driverDocumentsMock, {
    sort: 'expiresAt',
    order: 'asc',
  })
  const { data: fines } = useResourceList<DriverFine>('/driver-fines', driverFinesMock, {
    sort: 'occurredAt',
    order: 'desc',
  })
  const { data: trucks } = useResourceList<FleetTruck>('/fleet/trucks', fleetTrucksMock, { sort: 'plate', order: 'asc' })

  if (!driver) {
    return (
      <PageContainer>
        <EmptyState
          description="Revisa el identificador o vuelve al listado de choferes."
          icon={<AlertCircle size={22} />}
          title="Chofer no encontrado"
        />
      </PageContainer>
    )
  }

  const driverDocuments = documents.filter((document) => document.driverId === driver.id)
  const driverFines = fines.filter((fine) => fine.driverId === driver.id)
  const assignedTruck = trucks.find((truck) => truck.assignedDriverId === driver.id)

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            <Link to={ROUTES.drivers}>
              <Button icon={<ArrowLeft size={18} />} size="sm" variant="secondary">
                Volver
              </Button>
            </Link>
            {assignedTruck ? (
              <Link to={ROUTES.fleetTruckDetail(assignedTruck.id)}>
                <Button icon={<Truck size={18} />} size="sm" variant="secondary">
                  Ver camion
                </Button>
              </Link>
            ) : null}
            <Link to={`${ROUTES.driverPerformanceReport}?driverId=${driver.id}`}>
              <Button icon={<Gauge size={18} />} size="sm" variant="secondary">
                Rendimiento
              </Button>
            </Link>
          </div>
        }
        description={`${driver.company} - documentacion, multas, unidad y casos asociados.`}
        title={driver.name}
      />
      <div className="two-column-grid">
        <div className="stack">
          <Card>
            <dl className="detail-list">
              <div>
                <dt>Documento</dt>
                <dd>{driver.document}</dd>
              </div>
              <div>
                <dt>Telefono</dt>
                <dd>{driver.phone}</dd>
              </div>
              <div>
                <dt>Unidad asignada</dt>
                <dd>{assignedTruck ? assignedTruck.plate : 'Sin unidad'}</dd>
              </div>
              <div>
                <dt>Licencia</dt>
                <dd>{driver.license}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>
                  <DriverStatusBadge status={driver.status} />
                </dd>
              </div>
            </dl>
          </Card>
          <DriverCompliancePanel documents={driverDocuments} driver={driver} fines={driverFines} />
          <Card>
            <div className="stack">
              <h2 className="section-title">Historial de casos</h2>
              <DriverCasesHistory caseIds={driver.caseIds} />
            </div>
          </Card>
        </div>
        <div className="stack">
          <Card>
            <div className="stack">
              <h2 className="section-title">Ficha editable</h2>
              <DriverForm driver={driver} />
            </div>
          </Card>
          <Card>
            <div className="stack">
              <h2 className="section-title">Acciones operativas</h2>
              <Link className="shortcut-link" to={ROUTES.incidentsNew}>
                <FileText aria-hidden size={18} />
                <span>
                  Registrar multa o incidente
                  <small>Conecta evento con chofer, camion y flete.</small>
                </span>
              </Link>
              <a className="shortcut-link" href={`tel:${driver.phone}`}>
                <Phone aria-hidden size={18} />
                <span>
                  Llamar chofer
                  <small>{driver.phone}</small>
                </span>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
