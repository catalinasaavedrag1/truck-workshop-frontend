import { FilterBar } from '../../../shared/components/FilterBar/FilterBar'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { driversMock } from '../../drivers/mocks/drivers.mock'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import { fuelDeviationOptions } from '../constants/fuel.constants'
import type { FuelDeviationStatus } from '../types/fuel.types'

export interface FuelReportFilterState {
  driverId: string
  deviation: FuelDeviationStatus | 'all'
  query: string
  truckId: string
}

interface FuelReportFiltersProps {
  filters: FuelReportFilterState
  onChange: (filters: FuelReportFilterState) => void
  onClear: () => void
}

export function FuelReportFilters({ filters, onChange, onClear }: FuelReportFiltersProps) {
  const truckLabel = fleetTrucksMock.find((truck) => truck.id === filters.truckId)?.plate
  const driverLabel = driversMock.find((driver) => driver.id === filters.driverId)?.name
  const deviationLabel = fuelDeviationOptions.find((item) => item.value === filters.deviation)?.label
  const activeCount =
    (filters.query ? 1 : 0) +
    (filters.truckId !== 'all' ? 1 : 0) +
    (filters.driverId !== 'all' ? 1 : 0) +
    (filters.deviation !== 'all' ? 1 : 0)

  return (
    <FilterBar
      activeCount={activeCount}
      activeFilters={[
        ...(filters.query
          ? [
              {
                label: 'Busqueda',
                onRemove: () => onChange({ ...filters, query: '' }),
                value: filters.query,
              },
            ]
          : []),
        ...(filters.truckId !== 'all'
          ? [
              {
                label: 'Camion',
                onRemove: () => onChange({ ...filters, truckId: 'all' }),
                value: truckLabel,
              },
            ]
          : []),
        ...(filters.driverId !== 'all'
          ? [
              {
                label: 'Chofer',
                onRemove: () => onChange({ ...filters, driverId: 'all' }),
                value: driverLabel,
              },
            ]
          : []),
        ...(filters.deviation !== 'all'
          ? [
              {
                label: 'Estado',
                onRemove: () => onChange({ ...filters, deviation: 'all' }),
                value: deviationLabel,
              },
            ]
          : []),
      ]}
      description="Filtra por unidad, chofer, estacion, comprobante o estado de desviacion para aislar cargas a revisar."
      onClear={onClear}
      title="Lectura del reporte"
    >
      <Input
        label="Busqueda"
        name="fuelQuery"
        onChange={(event) => onChange({ ...filters, query: event.target.value })}
        placeholder="Estacion, boleta, nota..."
        value={filters.query}
      />
      <Select
        label="Camion"
        name="truckId"
        onChange={(event) => onChange({ ...filters, truckId: event.target.value })}
        options={[{ label: 'Todos', value: 'all' }, ...fleetTrucksMock.map((truck) => ({ label: truck.plate, value: truck.id }))]}
        value={filters.truckId}
      />
      <Select
        label="Chofer"
        name="driverId"
        onChange={(event) => onChange({ ...filters, driverId: event.target.value })}
        options={[{ label: 'Todos', value: 'all' }, ...driversMock.map((driver) => ({ label: driver.name, value: driver.id }))]}
        value={filters.driverId}
      />
      <Select
        label="Estado operacional"
        name="deviation"
        onChange={(event) => onChange({ ...filters, deviation: event.target.value as FuelDeviationStatus | 'all' })}
        options={fuelDeviationOptions}
        value={filters.deviation}
      />
    </FilterBar>
  )
}
