import type { Dispatch, SetStateAction } from 'react'
import { FilterBar } from '../../../shared/components/FilterBar/FilterBar'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { CASE_PRIORITY_OPTIONS } from '../constants/casePriority.constants'
import { CASE_STATUS_OPTIONS } from '../constants/caseStatus.constants'
import type { SlaStatus } from '../../sla/types/sla.types'
import type {
  WorkshopCaseFilters,
  WorkshopCasePriority,
  WorkshopCaseStatus,
} from '../types/workshopCase.types'

interface CaseFiltersProps {
  filters: WorkshopCaseFilters
  setFilters: Dispatch<SetStateAction<WorkshopCaseFilters>>
}

export function CaseFilters({ filters, setFilters }: CaseFiltersProps) {
  const priorityLabel = CASE_PRIORITY_OPTIONS.find((item) => item.value === filters.priority)?.label
  const statusLabel = CASE_STATUS_OPTIONS.find((item) => item.value === filters.status)?.label
  const slaOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'OK', value: 'OK' },
    { label: 'En riesgo', value: 'AT_RISK' },
    { label: 'Vencido', value: 'BREACHED' },
  ]
  const slaLabel = slaOptions.find((item) => item.value === filters.slaStatus)?.label
  const activeCount = [
    filters.query,
    filters.status !== 'all' ? filters.status : '',
    filters.priority !== 'all' ? filters.priority : '',
    filters.slaStatus !== 'all' ? filters.slaStatus : '',
  ].filter(Boolean).length

  return (
    <FilterBar
      activeCount={activeCount}
      activeFilters={[
        ...(filters.query
          ? [
              {
                label: 'Busqueda',
                onRemove: () => setFilters((current) => ({ ...current, query: '' })),
                value: filters.query,
              },
            ]
          : []),
        ...(filters.priority !== 'all'
          ? [
              {
                label: 'Prioridad',
                onRemove: () => setFilters((current) => ({ ...current, priority: 'all' })),
                value: priorityLabel,
              },
            ]
          : []),
        ...(filters.status !== 'all'
          ? [
              {
                label: 'Estado',
                onRemove: () => setFilters((current) => ({ ...current, status: 'all' })),
                value: statusLabel,
              },
            ]
          : []),
        ...(filters.slaStatus !== 'all'
          ? [
              {
                label: 'SLA',
                onRemove: () => setFilters((current) => ({ ...current, slaStatus: 'all' })),
                value: slaLabel,
              },
            ]
          : []),
      ]}
      description="Busca por caso, patente, operacion o chofer. Los filtros criticos quedan visibles."
      onClear={() =>
        setFilters({
          priority: 'all',
          query: '',
          slaStatus: 'all',
          status: 'all',
        })
      }
      title="Filtros de casos"
    >
      <Input
        label="Buscar"
        name="query"
        onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
        placeholder="Caso, patente, operacion o chofer"
        value={filters.query}
      />
      <Select
        label="Prioridad"
        name="priority"
        onChange={(event) =>
          setFilters((current) => ({
            ...current,
            priority: event.target.value as WorkshopCasePriority | 'all',
          }))
        }
        options={CASE_PRIORITY_OPTIONS}
        value={filters.priority}
      />
      <Select
        label="Estado"
        name="status"
        onChange={(event) =>
          setFilters((current) => ({
            ...current,
            status: event.target.value as WorkshopCaseStatus | 'all',
          }))
        }
        options={CASE_STATUS_OPTIONS}
        value={filters.status}
      />
      <Select
        label="SLA"
        name="slaStatus"
        onChange={(event) =>
          setFilters((current) => ({
            ...current,
            slaStatus: event.target.value as SlaStatus | 'all',
          }))
        }
        options={slaOptions}
        value={filters.slaStatus}
      />
    </FilterBar>
  )
}
