import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Gauge, RefreshCw, Truck } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { Input } from '../../../shared/components/Input/Input'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import { LiveGpsPanel } from '../components/LiveGpsPanel'
import { RouteTimeline } from '../components/RouteTimeline'
import { TelematicsStatsCards } from '../components/TelematicsStatsCards'
import styles from '../components/TelematicsModule.module.css'
import { TruckTelemetryTable } from '../components/TruckTelemetryTable'
import { telematicsMock } from '../mocks/telematics.mock'
import type { TruckTelemetry } from '../types/telematics.types'
import { buildTelematicsFleetItems } from '../utils/telematicsOperations'
import type { TelematicsFleetItem } from '../utils/telematicsOperations'

type TelematicsFilter = 'all' | 'critical' | 'alerts' | 'moving' | 'stopped' | 'fuel' | 'signal'

export function TelematicsPage() {
  const [activeFilter, setActiveFilter] = useState<TelematicsFilter>('all')
  const [query, setQuery] = useState('')
  const [selectedTruckId, setSelectedTruckId] = useState('')
  const { data: telemetry } = useResourceList<TruckTelemetry>('/telematics', telematicsMock, {
    order: 'desc',
    sort: 'lastSignalAt',
  })
  const { data: trucks } = useResourceList<FleetTruck>('/fleet/trucks', fleetTrucksMock, {
    order: 'asc',
    sort: 'plate',
  })

  const items = useMemo(() => buildTelematicsFleetItems(telemetry, trucks), [telemetry, trucks])
  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeSearch(query)

    return items.filter((item) => {
      const matchesFilter = matchesQuickFilter(item, activeFilter)
      const matchesQuery = !normalizedQuery || normalizeSearch([
        item.plate,
        item.driverName,
        item.truck?.brand,
        item.truck?.model,
        item.truck?.operationalStatus,
        item.decisionLabel,
        item.nextAction,
        item.movementLabel,
        item.telemetry.alerts.join(' '),
      ].join(' ')).includes(normalizedQuery)

      return matchesFilter && matchesQuery
    })
  }, [activeFilter, items, query])

  const selectedVisibleTruckId = filteredItems.some((item) => item.telemetry.truckId === selectedTruckId)
    ? selectedTruckId
    : filteredItems[0]?.telemetry.truckId || items[0]?.telemetry.truckId

  const filters: Array<{ count: number; key: TelematicsFilter; label: string }> = [
    { count: items.length, key: 'all', label: 'Toda la flota' },
    { count: items.filter((item) => item.decisionLevel === 'critical').length, key: 'critical', label: 'Intervenir' },
    { count: items.filter((item) => item.telemetry.alerts.length > 0).length, key: 'alerts', label: 'Con alertas' },
    { count: items.filter((item) => item.movementState === 'moving').length, key: 'moving', label: 'En ruta' },
    { count: items.filter((item) => ['idle', 'stopped', 'off'].includes(item.movementState)).length, key: 'stopped', label: 'Detenidos' },
    { count: items.filter((item) => item.fuelRisk).length, key: 'fuel', label: 'Combustible' },
    { count: items.filter((item) => item.signalState !== 'live').length, key: 'signal', label: 'Senal' },
  ]

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <>
              <Link to={ROUTES.fleetAvailability}>
                <Button icon={<Truck size={18} />} variant="secondary">
                  Disponibilidad
                </Button>
              </Link>
              <Link to={ROUTES.fleet}>
                <Button icon={<Gauge size={18} />} variant="secondary">
                  Centro flota
                </Button>
              </Link>
              <Button
                icon={<RefreshCw size={18} />}
                onClick={() => {
                  setActiveFilter('all')
                  setQuery('')
                }}
                variant="secondary"
              >
                Limpiar vista
              </Button>
            </>
          }
          description="Centro GPS para decidir rapido: ubicacion, senal, combustible, alertas y disponibilidad operacional."
          title="Telemetria / GPS"
        />

        <LiveGpsPanel />

        <TelematicsStatsCards items={items} totalFleet={trucks.length} />

        <div className={styles.controlStrip}>
          <Input
            label="Busqueda operacional"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Patente, chofer, alerta, estado o accion"
            type="search"
            value={query}
          />
          <div className={styles.quickFilters} aria-label="Filtros rapidos GPS">
            {filters.map((filter) => (
              <button
                className={[
                  styles.filterButton,
                  activeFilter === filter.key ? styles.filterButtonActive : '',
                ].filter(Boolean).join(' ')}
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                type="button"
              >
                <span>{filter.label}</span>
                <span className={styles.filterCount}>{filter.count}</span>
              </button>
            ))}
          </div>
        </div>

        <RouteTimeline items={filteredItems} selectedTruckId={selectedVisibleTruckId} />

        <Card>
          <TruckTelemetryTable items={filteredItems} onSelectTruck={setSelectedTruckId} />
        </Card>
      </div>
    </PageContainer>
  )
}

function matchesQuickFilter(item: TelematicsFleetItem, filter: TelematicsFilter) {
  if (filter === 'critical') return item.decisionLevel === 'critical'
  if (filter === 'alerts') return item.telemetry.alerts.length > 0
  if (filter === 'moving') return item.movementState === 'moving'
  if (filter === 'stopped') return ['idle', 'stopped', 'off'].includes(item.movementState)
  if (filter === 'fuel') return item.fuelRisk
  if (filter === 'signal') return item.signalState !== 'live'

  return true
}

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}
