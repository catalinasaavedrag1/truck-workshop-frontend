import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { CARGO_TYPE_OPTIONS } from '../constants/cargoType.constants'
import type { CargoType, FreightRequestStatus } from '../types/freight.types'
import { FREIGHT_FLOW_STEPS, type FreightFlowStage } from '../utils/freightOperations'
import styles from './FreightModule.module.css'

export type FreightRiskFilter = 'all' | 'critical' | 'attention' | 'normal'
export type FreightAssignmentFilter = 'all' | 'assigned' | 'unassigned'

interface FreightFiltersProps {
  assignmentFilter: FreightAssignmentFilter
  cargoFilter: CargoType | 'all'
  onAssignmentFilterChange: (value: FreightAssignmentFilter) => void
  onCargoFilterChange: (value: CargoType | 'all') => void
  onQueryChange: (value: string) => void
  onReset: () => void
  onRiskFilterChange: (value: FreightRiskFilter) => void
  onStageFilterChange: (value: FreightFlowStage | 'all') => void
  onStatusFilterChange: (value: FreightRequestStatus | 'all') => void
  query: string
  resultCount: number
  riskFilter: FreightRiskFilter
  stageFilter: FreightFlowStage | 'all'
  statusFilter: FreightRequestStatus | 'all'
  totalCount: number
}

const statusOptions: Array<{ label: string; value: FreightRequestStatus | 'all' }> = [
  { label: 'Todos los estados', value: 'all' },
  { label: 'Ingresada', value: 'NEW' },
  { label: 'En cotizacion', value: 'QUOTING' },
  { label: 'Pendiente aprobacion', value: 'QUOTE_SENT' },
  { label: 'Aprobada', value: 'APPROVED' },
  { label: 'Camion asignado', value: 'ASSIGNED' },
  { label: 'En ruta', value: 'IN_TRANSIT' },
  { label: 'Entregada', value: 'DELIVERED' },
  { label: 'Cancelada', value: 'CANCELLED' },
]

export function FreightFilters({
  assignmentFilter,
  cargoFilter,
  onAssignmentFilterChange,
  onCargoFilterChange,
  onQueryChange,
  onReset,
  onRiskFilterChange,
  onStageFilterChange,
  onStatusFilterChange,
  query,
  resultCount,
  riskFilter,
  stageFilter,
  statusFilter,
  totalCount,
}: FreightFiltersProps) {
  const hasFilters =
    query ||
    stageFilter !== 'all' ||
    statusFilter !== 'all' ||
    riskFilter !== 'all' ||
    cargoFilter !== 'all' ||
    assignmentFilter !== 'all'

  return (
    <section className={styles.filterPanel} aria-label="Filtros de solicitudes de flete">
      <label className={styles.freightSearch}>
        <Search aria-hidden size={17} />
        <span>Buscar solicitud</span>
        <input
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Codigo, cliente, origen, destino, chofer, camion, carga o estado"
          type="search"
          value={query}
        />
        {query ? (
          <button aria-label="Limpiar busqueda" onClick={() => onQueryChange('')} type="button">
            <X aria-hidden size={15} />
          </button>
        ) : null}
      </label>
      <div className={styles.filterControls}>
        <label>
          <span>Etapa</span>
          <select onChange={(event) => onStageFilterChange(event.target.value as FreightFlowStage | 'all')} value={stageFilter}>
            <option value="all">Todas</option>
            {FREIGHT_FLOW_STEPS.map((stage) => (
              <option key={stage.key} value={stage.key}>
                {stage.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Estado</span>
          <select onChange={(event) => onStatusFilterChange(event.target.value as FreightRequestStatus | 'all')} value={statusFilter}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Riesgo</span>
          <select onChange={(event) => onRiskFilterChange(event.target.value as FreightRiskFilter)} value={riskFilter}>
            <option value="all">Todos</option>
            <option value="critical">Critico</option>
            <option value="attention">Atencion</option>
            <option value="normal">En control</option>
          </select>
        </label>
        <label>
          <span>Carga</span>
          <select onChange={(event) => onCargoFilterChange(event.target.value as CargoType | 'all')} value={cargoFilter}>
            <option value="all">Todas</option>
            {CARGO_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Asignacion</span>
          <select
            onChange={(event) => onAssignmentFilterChange(event.target.value as FreightAssignmentFilter)}
            value={assignmentFilter}
          >
            <option value="all">Todas</option>
            <option value="assigned">Con camion</option>
            <option value="unassigned">Sin camion</option>
          </select>
        </label>
      </div>
      <div className={styles.filterFooter}>
        <div className={styles.filterResult}>
          <SlidersHorizontal aria-hidden size={15} />
          <strong>{resultCount}</strong>
          <span>de {totalCount} solicitudes</span>
        </div>
        {hasFilters ? (
          <Button onClick={onReset} size="sm" variant="ghost">
            Limpiar filtros
          </Button>
        ) : null}
      </div>
    </section>
  )
}
