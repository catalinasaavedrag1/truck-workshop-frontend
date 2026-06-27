import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ClipboardList, DollarSign, FileText, Plus, Route, Truck, UserRound, Wrench } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { casesMock } from '../../../mocks/cases.mock'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { Input } from '../../../shared/components/Input/Input'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { Select } from '../../../shared/components/Select/Select'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { driversMock } from '../../drivers/mocks/drivers.mock'
import type { Driver } from '../../drivers/types/driver.types'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import { freightRequestsMock } from '../../freight/mocks/freight.mock'
import type { FreightRequest } from '../../freight/types/freight.types'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import { IncidentTable } from '../components/IncidentTable'
import styles from '../components/IncidentsModule.module.css'
import { incidentSeverityOptions, incidentStatusOptions } from '../constants/incidents.constants'
import { incidentsMock } from '../mocks/incidents.mock'
import type { Incident, IncidentSeverity, IncidentStatus } from '../types/incidents.types'

type ModuleFilter = 'all' | 'freight' | 'workshop' | 'driver' | 'unlinked'

const moduleFilterOptions: Array<{ label: string; value: ModuleFilter }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Con flete', value: 'freight' },
  { label: 'Con caso taller', value: 'workshop' },
  { label: 'Con chofer', value: 'driver' },
  { label: 'Sin modulo destino', value: 'unlinked' },
]

export function IncidentsPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all')
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | 'all'>('all')
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>('all')
  const { data: incidents } = useResourceList<Incident>('/incidents', incidentsMock, {
    order: 'desc',
    sort: 'occurredAt',
  })
  const { data: trucks } = useResourceList<FleetTruck>('/fleet/trucks', fleetTrucksMock, { order: 'asc', sort: 'plate' })
  const { data: drivers } = useResourceList<Driver>('/drivers', driversMock, { order: 'asc', sort: 'name' })
  const { data: freightRequests } = useResourceList<FreightRequest>('/freight/requests', freightRequestsMock, {
    order: 'desc',
    sort: 'updatedAt',
  })
  const { data: workshopCases } = useResourceList<WorkshopCase>('/workshop-cases', casesMock, {
    order: 'desc',
    sort: 'updatedAt',
  })

  const filteredIncidents = useMemo(() => {
    const normalizedQuery = normalizeSearch(query)

    return incidents.filter((incident) => {
      const truck = trucks.find((item) => item.id === incident.truckId)
      const driver = drivers.find((item) => item.id === incident.driverId)
      const freight = freightRequests.find((item) => item.id === incident.freightId)
      const workshopCase = workshopCases.find((item) => item.id === incident.workshopCaseId)
      const matchesStatus = statusFilter === 'all' || incident.status === statusFilter
      const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter
      const matchesModule =
        moduleFilter === 'all' ||
        (moduleFilter === 'freight' && Boolean(freight)) ||
        (moduleFilter === 'workshop' && Boolean(workshopCase)) ||
        (moduleFilter === 'driver' && Boolean(driver)) ||
        (moduleFilter === 'unlinked' && !freight && !workshopCase)
      const matchesQuery = !normalizedQuery || normalizeSearch([
        incident.incidentNumber,
        incident.description,
        incident.location,
        incident.notes,
        truck?.plate,
        driver?.name,
        freight?.requestNumber,
        workshopCase?.caseNumber,
      ].join(' ')).includes(normalizedQuery)

      return matchesStatus && matchesSeverity && matchesModule && matchesQuery
    })
  }, [drivers, freightRequests, incidents, moduleFilter, query, severityFilter, statusFilter, trucks, workshopCases])

  const openCritical = incidents.filter((incident) => incident.status === 'OPEN' && incident.severity === 'CRITICAL')
  const openIncidents = incidents.filter((incident) => incident.status === 'OPEN' || incident.status === 'UNDER_REVIEW')
  const unlinkedOpen = openIncidents.filter((incident) => !incident.freightId && !incident.workshopCaseId)
  const totalCost = incidents.reduce((sum, incident) => sum + (incident.estimatedCost || 0), 0)
  const affectedTrucks = new Set(openIncidents.map((incident) => incident.truckId)).size
  const workshopLinked = incidents.filter((incident) => incident.workshopCaseId).length

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <div className="inline-actions">
              <Link to={ROUTES.fleetAvailability}>
                <Button icon={<Truck size={18} />} size="sm" variant="secondary">
                  Disponibilidad
                </Button>
              </Link>
              <Link to={ROUTES.incidentsNew}>
                <Button icon={<Plus size={18} />}>Nuevo incidente</Button>
              </Link>
            </div>
          }
          description="Accidentes, multas, retrasos y fallas en ruta, ligados a flota y taller."
          title="Incidentes"
        />

        <div className={styles.metricGrid}>
          <MetricItem helper="requieren decision inmediata" icon={<AlertTriangle size={18} />} label="Criticos abiertos" value={openCritical.length} />
          <MetricItem helper="camiones con seguimiento activo" icon={<Truck size={18} />} label="Unidades afectadas" value={affectedTrucks} />
          <MetricItem helper="costo operacional registrado" icon={<DollarSign size={18} />} label="Costo estimado" value={formatCurrency(totalCost)} />
          <MetricItem helper="necesitan derivacion clara" icon={<ClipboardList size={18} />} label="Sin modulo destino" value={unlinkedOpen.length} />
          <MetricItem helper="con trazabilidad hacia taller" icon={<Wrench size={18} />} label="Casos vinculados" value={workshopLinked} />
        </div>

        <div className={styles.toolbar}>
          <Input
            label="Buscar"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="INC, patente, chofer, ruta, flete o caso"
            type="search"
            value={query}
          />
          <Select
            label="Estado"
            onChange={(event) => setStatusFilter(event.target.value as IncidentStatus | 'all')}
            options={[{ label: 'Todos', value: 'all' }, ...incidentStatusOptions]}
            value={statusFilter}
          />
          <Select
            label="Severidad"
            onChange={(event) => setSeverityFilter(event.target.value as IncidentSeverity | 'all')}
            options={[{ label: 'Todas', value: 'all' }, ...incidentSeverityOptions]}
            value={severityFilter}
          />
          <Select
            label="Conexion"
            onChange={(event) => setModuleFilter(event.target.value as ModuleFilter)}
            options={moduleFilterOptions}
            value={moduleFilter}
          />
        </div>

        <div className={styles.quickFilters}>
          {[
            { key: 'all' as const, label: 'Todos', value: incidents.length },
            { key: 'unlinked' as const, label: 'Sin derivar', value: unlinkedOpen.length },
            { key: 'workshop' as const, label: 'Taller', value: workshopLinked },
            { key: 'freight' as const, label: 'Flete', value: incidents.filter((incident) => incident.freightId).length },
          ].map((filter) => (
            <button
              className={[styles.filterButton, moduleFilter === filter.key ? styles.filterButtonActive : ''].filter(Boolean).join(' ')}
              key={filter.key}
              onClick={() => setModuleFilter(filter.key)}
              type="button"
            >
              {filter.label}
              <Badge>{filter.value}</Badge>
            </button>
          ))}
        </div>

        <div className={styles.boardGrid}>
          <Card className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Incidentes operacionales</h2>
                <p>Filtra, lee impacto y entra al detalle para derivar al modulo correcto.</p>
              </div>
              <Badge tone="info">{filteredIncidents.length} visibles</Badge>
            </div>
            <IncidentTable
              drivers={drivers}
              freightRequests={freightRequests}
              incidents={filteredIncidents}
              trucks={trucks}
              workshopCases={workshopCases}
            />
          </Card>

          <Card className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Derivacion sugerida</h2>
                <p>Lo que debe enterarse segun tipo de incidente.</p>
              </div>
            </div>
            <div className={styles.actionList}>
              <GuidanceItem
                icon={<Wrench size={17} />}
                label="Falla, accidente o dano"
                text="Debe abrir o vincular caso de taller y bloquear disponibilidad si afecta seguridad."
              />
              <GuidanceItem
                icon={<UserRound size={17} />}
                label="Multa o conducta chofer"
                text="Debe quedar en ficha del chofer y, si aplica, en costos del camion."
              />
              <GuidanceItem
                icon={<Route size={17} />}
                label="Retraso, carga o cliente"
                text="Debe conectarse con solicitud de flete para seguimiento comercial y operativo."
              />
              <GuidanceItem
                icon={<FileText size={17} />}
                label="Documentacion vencida"
                text="Debe revisarse contra documentos de camion y chofer antes de volver a asignar."
              />
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

interface MetricItemProps {
  helper: string
  icon: ReactNode
  label: string
  value: number | string
}

function MetricItem({ helper, icon, label, value }: MetricItemProps) {
  return (
    <Card className={styles.metricItem}>
      <span>{icon}</span>
      <span>{label}</span>
      <strong>{value}</strong>
      <small className={styles.helper}>{helper}</small>
    </Card>
  )
}

function GuidanceItem({ icon, label, text }: { icon: ReactNode; label: string; text: string }) {
  return (
    <div className={styles.actionCard}>
      <div className={styles.actionTop}>
        <span className={styles.entityIcon}>{icon}</span>
        <strong>{label}</strong>
      </div>
      <span className={styles.metaText}>{text}</span>
    </div>
  )
}

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}
