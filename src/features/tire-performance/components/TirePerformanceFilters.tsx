import type { Dispatch, SetStateAction } from 'react'
import { FilterBar } from '../../../shared/components/FilterBar/FilterBar'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import {
  TIRE_POSITION_OPTIONS,
  TIRE_REMOVAL_REASON_OPTIONS,
  TIRE_STATUS_OPTIONS,
  TIRE_TYPE_OPTIONS,
  TIRE_USAGE_OPTIONS,
} from '../constants/tirePerformance.constants'
import type {
  TireLifecycle,
  TirePerformanceFilters as TirePerformanceFiltersModel,
  TireLifecycleStatus,
  TirePosition,
  TireRemovalReason,
  TireType,
  TireUsageType,
} from '../types/tirePerformance.types'

interface TirePerformanceFiltersProps {
  filters: TirePerformanceFiltersModel
  onReset: () => void
  setFilters: Dispatch<SetStateAction<TirePerformanceFiltersModel>>
  tires: TireLifecycle[]
}

export function TirePerformanceFilters({ filters, onReset, setFilters, tires }: TirePerformanceFiltersProps) {
  const suppliers = Array.from(new Set(tires.map((tire) => tire.supplierName))).sort()
  const brands = Array.from(new Set(tires.map((tire) => tire.brand))).sort()
  const truckOptions = [
    { label: 'Todos', value: 'all' },
    ...Array.from(
      new Map(
        tires
          .filter((tire) => tire.truckId)
          .map((tire) => [tire.truckId, { label: tire.truckPlate || tire.truckId || 'Sin patente', value: tire.truckId || '' }]),
      ).values(),
    ).sort((first, second) => first.label.localeCompare(second.label, 'es-CL')),
  ]
  const activeCount = Object.values(filters).filter((value) => value && value !== 'all').length
  const optionLabel = (options: { label: string; value: string }[], value: string) =>
    options.find((option) => option.value === value)?.label || value

  return (
    <FilterBar
      activeCount={activeCount}
      activeFilters={[
        ...(filters.tireType !== 'all'
          ? [
              {
                label: 'Tipo',
                onRemove: () => setFilters((current) => ({ ...current, tireType: 'all' })),
                value: optionLabel(TIRE_TYPE_OPTIONS, filters.tireType),
              },
            ]
          : []),
        ...(filters.supplierName !== 'all'
          ? [
              {
                label: 'Proveedor',
                onRemove: () => setFilters((current) => ({ ...current, supplierName: 'all' })),
                value: filters.supplierName,
              },
            ]
          : []),
        ...(filters.brand !== 'all'
          ? [
              {
                label: 'Marca',
                onRemove: () => setFilters((current) => ({ ...current, brand: 'all' })),
                value: filters.brand,
              },
            ]
          : []),
        ...(filters.truckId !== 'all'
          ? [
              {
                label: 'Camion',
                onRemove: () => setFilters((current) => ({ ...current, truckId: 'all' })),
                value: optionLabel(truckOptions, filters.truckId),
              },
            ]
          : []),
        ...(filters.tirePosition !== 'all'
          ? [
              {
                label: 'Posicion',
                onRemove: () => setFilters((current) => ({ ...current, tirePosition: 'all' })),
                value: optionLabel(TIRE_POSITION_OPTIONS, filters.tirePosition),
              },
            ]
          : []),
        ...(filters.usageType !== 'all'
          ? [
              {
                label: 'Uso',
                onRemove: () => setFilters((current) => ({ ...current, usageType: 'all' })),
                value: optionLabel(TIRE_USAGE_OPTIONS, filters.usageType),
              },
            ]
          : []),
        ...(filters.status !== 'all'
          ? [
              {
                label: 'Estado',
                onRemove: () => setFilters((current) => ({ ...current, status: 'all' })),
                value: optionLabel(TIRE_STATUS_OPTIONS, filters.status),
              },
            ]
          : []),
        ...(filters.removalReason !== 'all'
          ? [
              {
                label: 'Retiro',
                onRemove: () => setFilters((current) => ({ ...current, removalReason: 'all' })),
                value: optionLabel(TIRE_REMOVAL_REASON_OPTIONS, filters.removalReason),
              },
            ]
          : []),
        ...(filters.fromDate
          ? [
              {
                label: 'Desde',
                onRemove: () => setFilters((current) => ({ ...current, fromDate: '' })),
                value: filters.fromDate,
              },
            ]
          : []),
        ...(filters.toDate
          ? [
              {
                label: 'Hasta',
                onRemove: () => setFilters((current) => ({ ...current, toDate: '' })),
                value: filters.toDate,
              },
            ]
          : []),
      ]}
      description="Deja visibles los filtros usados a diario y mueve el resto a filtros avanzados."
      onClear={onReset}
      title="Filtros de rendimiento"
      secondary={
        <>
          <Select
            label="Posicion"
            name="tirePosition"
            onChange={(event) =>
              setFilters((current) => ({ ...current, tirePosition: event.target.value as TirePosition | 'all' }))
            }
            options={TIRE_POSITION_OPTIONS}
            value={filters.tirePosition}
          />
          <Select
            label="Uso"
            name="usageType"
            onChange={(event) =>
              setFilters((current) => ({ ...current, usageType: event.target.value as TireUsageType | 'all' }))
            }
            options={TIRE_USAGE_OPTIONS}
            value={filters.usageType}
          />
          <Select
            label="Estado"
            name="status"
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value as TireLifecycleStatus | 'all' }))
            }
            options={TIRE_STATUS_OPTIONS}
            value={filters.status}
          />
          <Select
            label="Motivo retiro"
            name="removalReason"
            onChange={(event) =>
              setFilters((current) => ({ ...current, removalReason: event.target.value as TireRemovalReason | 'all' }))
            }
            options={TIRE_REMOVAL_REASON_OPTIONS}
            value={filters.removalReason}
          />
          <Input
            label="Desde compra"
            name="fromDate"
            onChange={(event) => setFilters((current) => ({ ...current, fromDate: event.target.value }))}
            type="date"
            value={filters.fromDate}
          />
          <Input
            label="Hasta compra"
            name="toDate"
            onChange={(event) => setFilters((current) => ({ ...current, toDate: event.target.value }))}
            type="date"
            value={filters.toDate}
          />
        </>
      }
    >
        <Select
          label="Tipo"
          name="tireType"
          onChange={(event) => setFilters((current) => ({ ...current, tireType: event.target.value as TireType | 'all' }))}
          options={TIRE_TYPE_OPTIONS}
          value={filters.tireType}
        />
        <Select
          label="Proveedor"
          name="supplierName"
          onChange={(event) => setFilters((current) => ({ ...current, supplierName: event.target.value }))}
          options={[{ label: 'Todos', value: 'all' }, ...suppliers.map((supplier) => ({ label: supplier, value: supplier }))]}
          value={filters.supplierName}
        />
        <Select
          label="Marca"
          name="brand"
          onChange={(event) => setFilters((current) => ({ ...current, brand: event.target.value }))}
          options={[{ label: 'Todas', value: 'all' }, ...brands.map((brand) => ({ label: brand, value: brand }))]}
          value={filters.brand}
        />
        <Select
          label="Camion"
          name="truckId"
          onChange={(event) => setFilters((current) => ({ ...current, truckId: event.target.value }))}
          options={truckOptions}
          value={filters.truckId}
        />
    </FilterBar>
  )
}
