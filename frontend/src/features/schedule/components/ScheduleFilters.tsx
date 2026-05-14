import type { Dispatch, SetStateAction } from 'react'
import { FilterBar } from '../../../shared/components/FilterBar/FilterBar'
import type { ActiveFilterChip } from '../../../shared/components/FilterBar/FilterBar'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import type { Mechanic } from '../../mechanics/types/mechanic.types'
import type { WorkshopBay } from '../../workshop-bays/types/workshopBay.types'
import type { ScheduleEventStatus, ScheduleFilters as ScheduleFiltersModel } from '../types/schedule.types'

interface ScheduleFiltersProps {
  bays: WorkshopBay[]
  filters: ScheduleFiltersModel
  mechanics: Mechanic[]
  setFilters: Dispatch<SetStateAction<ScheduleFiltersModel>>
}

const statusOptions: { label: string; value: ScheduleEventStatus | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Programado', value: 'scheduled' },
  { label: 'En curso', value: 'in_progress' },
  { label: 'Espera repuestos', value: 'waiting_parts' },
  { label: 'Bloqueado', value: 'blocked' },
  { label: 'Terminado', value: 'done' },
]

export function ScheduleFilters({ bays, filters, mechanics, setFilters }: ScheduleFiltersProps) {
  const todayKey = new Date().toISOString().slice(0, 10)
  const resetFilters = () =>
    setFilters({
      bayId: 'all',
      date: todayKey,
      mechanicId: 'all',
      query: '',
      status: 'all',
      viewMode: 'day',
    })
  const activeFilters: ActiveFilterChip[] = []

  if (filters.query) {
    activeFilters.push({
      label: 'Busqueda',
      onRemove: () => setFilters((current) => ({ ...current, query: '' })),
      value: filters.query,
    })
  }

  if (filters.date !== todayKey) {
    activeFilters.push({
      label: 'Fecha',
      onRemove: () => setFilters((current) => ({ ...current, date: todayKey })),
      value: filters.date,
    })
  }

  if (filters.bayId !== 'all') {
    activeFilters.push({
      label: 'Estacion',
      onRemove: () => setFilters((current) => ({ ...current, bayId: 'all' })),
      value: bays.find((bay) => bay.id === filters.bayId)?.name || filters.bayId,
    })
  }

  if (filters.mechanicId !== 'all') {
    activeFilters.push({
      label: 'Mecanico',
      onRemove: () => setFilters((current) => ({ ...current, mechanicId: 'all' })),
      value: mechanics.find((mechanic) => mechanic.id === filters.mechanicId)?.name || filters.mechanicId,
    })
  }

  if (filters.status !== 'all') {
    activeFilters.push({
      label: 'Estado',
      onRemove: () => setFilters((current) => ({ ...current, status: 'all' })),
      value: statusOptions.find((status) => status.value === filters.status)?.label || filters.status,
    })
  }

  return (
    <FilterBar
      activeCount={activeFilters.length}
      activeFilters={activeFilters}
      clearLabel="Limpiar filtros de agenda"
      onClear={resetFilters}
    >
      <Input
        label="Busqueda rapida"
        name="scheduleQuery"
        onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
        placeholder="Caso, patente, operacion o mecanico"
        value={filters.query}
      />
      <Input
        label="Fecha"
        name="scheduleDate"
        onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))}
        type="date"
        value={filters.date}
      />
      <Select
        label="Estacion"
        name="bayId"
        onChange={(event) => setFilters((current) => ({ ...current, bayId: event.target.value }))}
        options={[{ label: 'Todas', value: 'all' }, ...bays.map((bay) => ({ label: bay.name, value: bay.id }))]}
        value={filters.bayId}
      />
      <Select
        label="Mecanico"
        name="mechanicId"
        onChange={(event) => setFilters((current) => ({ ...current, mechanicId: event.target.value }))}
        options={[{ label: 'Todos', value: 'all' }, ...mechanics.map((mechanic) => ({ label: mechanic.name, value: mechanic.id }))]}
        value={filters.mechanicId}
      />
      <Select
        label="Estado"
        name="status"
        onChange={(event) =>
          setFilters((current) => ({ ...current, status: event.target.value as ScheduleEventStatus | 'all' }))
        }
        options={statusOptions}
        value={filters.status}
      />
    </FilterBar>
  )
}
