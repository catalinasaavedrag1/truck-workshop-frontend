import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, ClipboardPlus, Plus, Search, Truck as TruckIcon, Wrench } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { trucksMock } from '../../../mocks/trucks.mock'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { FilterBar } from '../../../shared/components/FilterBar/FilterBar'
import { Input } from '../../../shared/components/Input/Input'
import { MetricCard } from '../../../shared/components/MetricCard/MetricCard'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { Select } from '../../../shared/components/Select/Select'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import type { Truck, TruckStatus } from '../types/truck.types'
import styles from '../components/TruckModule.module.css'
import { TruckTable } from '../components/TruckTable'
import { truckStatusLabels } from '../constants/truck.constants'
import { getTruckServiceRisk } from '../utils/truckMaintenance'

const statusOptions: { label: string; value: TruckStatus | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: truckStatusLabels.available, value: 'available' },
  { label: truckStatusLabels['in-workshop'], value: 'in-workshop' },
  { label: truckStatusLabels.blocked, value: 'blocked' },
  { label: truckStatusLabels['on-route'], value: 'on-route' },
]

export function TrucksPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<TruckStatus | 'all'>('all')
  const { data: trucks } = useResourceList<Truck>('/trucks', trucksMock, { order: 'asc', sort: 'plate' })

  const summary = useMemo(
    () => ({
      attention: trucks.filter((truck) => {
        const risk = getTruckServiceRisk(truck.lastServiceAt)
        return risk.tone === 'warning' || risk.tone === 'danger' || truck.status === 'blocked'
      }).length,
      available: trucks.filter((truck) => truck.status === 'available').length,
      inWorkshop: trucks.filter((truck) => truck.status === 'in-workshop').length,
      total: trucks.length,
    }),
    [trucks],
  )

  const filteredTrucks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return trucks.filter((truck) => {
      const matchesQuery = [truck.plate, truck.brand, truck.model, truck.vin, truck.year]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
      const matchesStatus = status === 'all' || truck.status === status

      return matchesQuery && matchesStatus
    })
  }, [query, status, trucks])
  const statusLabel = statusOptions.find((option) => option.value === status)?.label

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            <Link to={ROUTES.caseNew}>
              <Button icon={<ClipboardPlus size={18} />}>Nuevo caso taller</Button>
            </Link>
            <Link to={ROUTES.truckNew}>
              <Button icon={<Plus size={18} />} variant="secondary">
                Nuevo camion
              </Button>
            </Link>
          </div>
        }
        description="Camiones con mantenimiento, servicio pendiente o bloqueo. La ficha maestra esta en Flota."
        title="Camiones en taller"
      />
      <div className={styles.summaryGrid}>
        <MetricCard
          helper={`${summary.inWorkshop} actualmente en taller`}
          icon={<TruckIcon aria-hidden size={18} />}
          label="Camiones registrados"
          value={summary.total}
        />
        <MetricCard
          helper="Listos para asignacion o salida"
          icon={<CheckCircle2 aria-hidden size={18} />}
          label="Disponibles"
          tone="success"
          value={summary.available}
        />
        <MetricCard
          helper="Con ordenes o revision activa"
          icon={<Wrench aria-hidden size={18} />}
          label="En taller"
          tone="warning"
          value={summary.inWorkshop}
        />
        <MetricCard
          helper="Bloqueos o mantencion por agendar"
          icon={<AlertTriangle aria-hidden size={18} />}
          label="Requieren accion"
          tone="danger"
          value={summary.attention}
        />
      </div>
      <FilterBar
        activeCount={(query ? 1 : 0) + (status !== 'all' ? 1 : 0)}
        activeFilters={[
          ...(query
            ? [
                {
                  label: 'Busqueda',
                  onRemove: () => setQuery(''),
                  value: query,
                },
              ]
            : []),
          ...(status !== 'all'
            ? [
                {
                  label: 'Estado',
                  onRemove: () => setStatus('all'),
                  value: statusLabel,
                },
              ]
            : []),
        ]}
        description="Busca unidades que requieren taller, servicio o validacion antes de volver a disponibilidad."
        onClear={() => {
          setQuery('')
          setStatus('all')
        }}
        title="Filtro de taller"
      >
        <Input
          helperText="Ej: HH-RR-24, Volvo, FH 540"
          label="Buscar camion"
          name="truckSearch"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Patente, modelo o VIN"
          value={query}
        />
        <Select
          label="Estado"
          name="truckStatus"
          onChange={(event) => setStatus(event.target.value as TruckStatus | 'all')}
          options={statusOptions}
          value={status}
        />
      </FilterBar>
      <Card>
        <div className={styles.tableShell}>
          <SectionHeader
            description={`${filteredTrucks.length} de ${trucks.length} unidades visibles para seguimiento.`}
            title="Seguimiento de taller"
            actions={
              <span className={styles.inlineMeta}>
                <Search aria-hidden size={15} /> Taller filtrable
              </span>
            }
          />
          <TruckTable trucks={filteredTrucks} />
        </div>
      </Card>
    </PageContainer>
  )
}
