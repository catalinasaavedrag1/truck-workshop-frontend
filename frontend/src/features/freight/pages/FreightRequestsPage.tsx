import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MoreHorizontal, Plus } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { normalizeOperationalSearch } from '../../../shared/navigation/operationalSearch'
import { FreightAlertCards } from '../components/FreightAlertCards'
import { FreightFilters, type FreightAssignmentFilter, type FreightRiskFilter } from '../components/FreightFilters'
import { FreightKanbanBoard } from '../components/FreightKanbanBoard'
import { FreightRequestDrawer } from '../components/FreightRequestDrawer'
import { FreightRequestTable } from '../components/FreightRequestTable'
import { FreightStagePipeline } from '../components/FreightStagePipeline'
import { freightAssignmentsMock, freightQuotesMock, freightRequestsMock } from '../mocks/freight.mock'
import type { FreightAssignment, FreightQuote, FreightRequest } from '../types/freight.types'
import type { CargoType, FreightRequestStatus } from '../types/freight.types'
import {
  type FreightAttentionFilter,
  type FreightFlowStage,
  getFreightRequestOperation,
  getFreightRequestSearchText,
  matchesFreightAttentionFilter,
} from '../utils/freightOperations'
import styles from '../components/FreightModule.module.css'

type FreightViewMode = 'inbox' | 'tower'

export function FreightRequestsPage() {
  const [activeAttentionFilter, setActiveAttentionFilter] = useState<FreightAttentionFilter>('all')
  const [assignmentFilter, setAssignmentFilter] = useState<FreightAssignmentFilter>('all')
  const [cargoFilter, setCargoFilter] = useState<CargoType | 'all'>('all')
  const [query, setQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState<FreightRiskFilter>('all')
  const [selectedRequestId, setSelectedRequestId] = useState<string>()
  const [stageFilter, setStageFilter] = useState<FreightFlowStage | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<FreightRequestStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<FreightViewMode>('inbox')
  const { data: freightRequests } = useResourceList<FreightRequest>('/freight/requests', freightRequestsMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: freightQuotes } = useResourceList<FreightQuote>('/freight/quotes', freightQuotesMock, {
    order: 'desc',
    sort: 'validUntil',
  })
  const { data: freightAssignments } = useResourceList<FreightAssignment>(
    '/freight/assignments',
    freightAssignmentsMock,
    { order: 'asc', sort: 'pickupDate' },
  )

  const operations = useMemo(
    () => freightRequests.map((request) => getFreightRequestOperation(request, freightQuotes, freightAssignments)),
    [freightAssignments, freightQuotes, freightRequests],
  )

  const filteredOperations = useMemo(() => {
    const normalizedQuery = normalizeOperationalSearch(query)

    return operations.filter((operation) => {
      const request = operation.request
      const matchesQuery = normalizedQuery
        ? normalizeOperationalSearch(getFreightRequestSearchText(request, operation.quote, operation.assignment)).includes(
            normalizedQuery,
          )
        : true
      const matchesAttention = matchesFreightAttentionFilter(
        activeAttentionFilter,
        request,
        freightQuotes,
        freightAssignments,
      )
      const matchesStage = stageFilter === 'all' || operation.stage === stageFilter
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter
      const matchesRisk = riskFilter === 'all' || operation.risk.level === riskFilter
      const matchesCargo = cargoFilter === 'all' || request.cargoType === cargoFilter
      const hasAssignment = Boolean(operation.assignment || request.assignedTruckId)
      const matchesAssignment =
        assignmentFilter === 'all' ||
        (assignmentFilter === 'assigned' && hasAssignment) ||
        (assignmentFilter === 'unassigned' && !hasAssignment)

      return (
        matchesQuery &&
        matchesAttention &&
        matchesStage &&
        matchesStatus &&
        matchesRisk &&
        matchesCargo &&
        matchesAssignment
      )
    })
  }, [
    activeAttentionFilter,
    assignmentFilter,
    cargoFilter,
    freightAssignments,
    freightQuotes,
    operations,
    query,
    riskFilter,
    stageFilter,
    statusFilter,
  ])

  const filteredRequests = filteredOperations.map((operation) => operation.request)
  const selectedOperation =
    filteredOperations.find((operation) => operation.request.id === selectedRequestId) ?? filteredOperations[0]

  const handleResetFilters = () => {
    setActiveAttentionFilter('all')
    setAssignmentFilter('all')
    setCargoFilter('all')
    setQuery('')
    setRiskFilter('all')
    setStageFilter('all')
    setStatusFilter('all')
  }

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            <Link to={ROUTES.customers}>
              <Button size="sm" variant="secondary">
                Clientes
              </Button>
            </Link>
            <Link to={ROUTES.freightRequestNew}>
              <Button icon={<Plus size={18} />}>Nueva solicitud</Button>
            </Link>
            <Link to={ROUTES.freightQuotes}>
              <Button icon={<MoreHorizontal size={17} />} size="sm" variant="ghost">
                Mas acciones
              </Button>
            </Link>
          </div>
        }
        description="Control operacional de solicitudes desde ingreso hasta cierre."
        title="Solicitudes de flete"
      />
      <FreightAlertCards
        activeFilter={activeAttentionFilter}
        assignments={freightAssignments}
        onFilterChange={setActiveAttentionFilter}
        quotes={freightQuotes}
        requests={freightRequests}
      />
      <FreightStagePipeline
        activeStage={stageFilter}
        assignments={freightAssignments}
        onStageChange={setStageFilter}
        quotes={freightQuotes}
        requests={freightRequests}
      />
      <FreightFilters
        assignmentFilter={assignmentFilter}
        cargoFilter={cargoFilter}
        onAssignmentFilterChange={setAssignmentFilter}
        onCargoFilterChange={setCargoFilter}
        onQueryChange={setQuery}
        onReset={handleResetFilters}
        onRiskFilterChange={setRiskFilter}
        onStageFilterChange={setStageFilter}
        onStatusFilterChange={setStatusFilter}
        query={query}
        resultCount={filteredRequests.length}
        riskFilter={riskFilter}
        stageFilter={stageFilter}
        statusFilter={statusFilter}
        totalCount={freightRequests.length}
      />

      <div className={styles.controlTowerLayout}>
        <section className={styles.workQueuePanel}>
          <div className={styles.workQueueHeader}>
            <div>
              <h2>Bandeja operacional</h2>
              <p>{filteredRequests.length} solicitudes priorizadas por SLA, etapa, responsable y bloqueo.</p>
            </div>
            <div className={styles.viewSwitch} aria-label="Cambiar vista de solicitudes">
              <button
                className={viewMode === 'inbox' ? styles.viewSwitchActive : ''}
                onClick={() => setViewMode('inbox')}
                type="button"
              >
                Bandeja
              </button>
              <button
                className={viewMode === 'tower' ? styles.viewSwitchActive : ''}
                onClick={() => setViewMode('tower')}
                type="button"
              >
                Control tower
              </button>
            </div>
          </div>
          {viewMode === 'inbox' ? (
            <FreightRequestTable
              assignments={freightAssignments}
              emptyDescription="Todo esta al dia para este filtro. Ajusta filtros o crea una nueva solicitud."
              emptyLabel={activeAttentionFilter === 'overdue' ? 'No hay solicitudes vencidas' : 'Sin solicitudes para revisar'}
              enableSearch={false}
              onSelectRequest={setSelectedRequestId}
              quotes={freightQuotes}
              requests={filteredRequests}
              selectedRequestId={selectedOperation?.request.id}
            />
          ) : (
            <FreightKanbanBoard
              onSelectRequest={setSelectedRequestId}
              operations={filteredOperations}
              selectedRequestId={selectedOperation?.request.id}
            />
          )}
        </section>
        <FreightRequestDrawer operation={selectedOperation} />
      </div>
    </PageContainer>
  )
}
