import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { trucksMock } from '../../../mocks/trucks.mock'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ConfirmModal } from '../../../shared/components/ConfirmModal/ConfirmModal'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { FilterBar } from '../../../shared/components/FilterBar/FilterBar'
import { Input } from '../../../shared/components/Input/Input'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { Select } from '../../../shared/components/Select/Select'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { driversMock } from '../../drivers/mocks/drivers.mock'
import type { Driver } from '../../drivers/types/driver.types'
import { freightAssignmentsMock, freightQuotesMock, freightRequestsMock } from '../../freight/mocks/freight.mock'
import type { FreightAssignment, FreightQuote, FreightRequest } from '../../freight/types/freight.types'
import type { Truck } from '../../trucks/types/truck.types'
import { DriverTripSheetForm } from '../components/DriverTripSheetForm'
import { DriverTripSheetSummary } from '../components/DriverTripSheetSummary'
import { DriverTripSheetTable } from '../components/DriverTripSheetTable'
import styles from '../components/DriverTripSheets.module.css'
import { driverTripSheetStatusLabels } from '../constants/driverTripSheetStatus.constants'
import { driverTripSheetsMock } from '../mocks/driverTripSheets.mock'
import { deleteDriverTripSheet } from '../services/driverTripSheets.service'
import type { DriverTripSheet, DriverTripSheetStatus } from '../types/driverTripSheet.types'

const allStatusOptions = [
  { label: 'Todos', value: 'all' },
  ...Object.entries(driverTripSheetStatusLabels).map(([value, label]) => ({ label, value })),
]

function normalizeSearchText(value: unknown) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function DriverTripSheetsPage() {
  const [savedSheets, setSavedSheets] = useState<DriverTripSheet[]>([])
  const [deletedSheetIds, setDeletedSheetIds] = useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = useState<DriverTripSheet | null>(null)
  const [sheetPendingDeletion, setSheetPendingDeletion] = useState<DriverTripSheet | null>(null)
  const [quickAssignmentKey, setQuickAssignmentKey] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | DriverTripSheetStatus>('all')
  const [driverFilter, setDriverFilter] = useState('all')
  const [errorMessage, setErrorMessage] = useState('')
  const { data: drivers } = useResourceList<Driver>('/drivers', driversMock, { order: 'asc', sort: 'name' })
  const { data: trucks } = useResourceList<Truck>('/trucks', trucksMock, { order: 'asc', sort: 'plate' })
  const { data: assignments } = useResourceList<FreightAssignment>('/freight/assignments', freightAssignmentsMock, {
    order: 'desc',
    sort: 'pickupDate',
  })
  const { data: freightRequests } = useResourceList<FreightRequest>('/freight/requests', freightRequestsMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: freightQuotes } = useResourceList<FreightQuote>('/freight/quotes', freightQuotesMock, {
    order: 'desc',
    sort: 'validUntil',
  })
  const { data: loadedSheets, isLoading } = useResourceList<DriverTripSheet>('/driver-trip-sheets', driverTripSheetsMock, {
    order: 'desc',
    sort: 'tripDate',
  })

  const sheets = useMemo(() => {
    const savedById = new Map(savedSheets.map((sheet) => [sheet.id, sheet]))
    const deleted = new Set(deletedSheetIds)

    return [...loadedSheets.filter((sheet) => !savedById.has(sheet.id) && !deleted.has(sheet.id)), ...savedSheets]
      .filter((sheet) => !deleted.has(sheet.id))
      .sort((first, second) => new Date(second.tripDate).getTime() - new Date(first.tripDate).getTime())
  }, [deletedSheetIds, loadedSheets, savedSheets])

  const filteredSheets = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query)

    return sheets.filter((sheet) => {
      const matchesStatus = statusFilter === 'all' || sheet.status === statusFilter
      const matchesDriver = driverFilter === 'all' || sheet.driverId === driverFilter
      const matchesQuery =
        !normalizedQuery ||
        normalizeSearchText(
          `${sheet.sheetNumber} ${sheet.driverName} ${sheet.truckPlate} ${sheet.customerName} ${sheet.originAddress} ${sheet.destinationAddress} ${sheet.status}`,
        ).includes(normalizedQuery)

      return matchesStatus && matchesDriver && matchesQuery
    })
  }, [driverFilter, query, sheets, statusFilter])

  const pendingAssignments = useMemo(
    () =>
      assignments
        .filter((assignment) => !sheets.some((sheet) => sheet.assignmentId === assignment.id))
        .slice(0, 4),
    [assignments, sheets],
  )

  const nextSheetNumber = useMemo(() => {
    const maxNumber = sheets.reduce((max, sheet) => {
      const match = sheet.sheetNumber.match(/(\d+)$/)
      const number = match ? Number(match[1]) : 0

      return Math.max(max, number)
    }, 0)

    return `PLAN-2026-${String(maxNumber + 1).padStart(3, '0')}`
  }, [sheets])

  const driverOptions = [
    { label: 'Todos', value: 'all' },
    ...drivers.map((driver) => ({ label: driver.name, value: driver.id })),
  ]
  const activeCount = (query ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0) + (driverFilter !== 'all' ? 1 : 0)
  const selectedDriverName = drivers.find((driver) => driver.id === driverFilter)?.name

  const resetFilters = () => {
    setQuery('')
    setStatusFilter('all')
    setDriverFilter('all')
  }

  const handleSaved = (sheet: DriverTripSheet) => {
    setSavedSheets((current) => [sheet, ...current.filter((item) => item.id !== sheet.id)])
    setDeletedSheetIds((current) => current.filter((item) => item !== sheet.id))
    setSelectedSheet(null)
    setQuickAssignmentKey('')
  }

  const handleDelete = async (sheet: DriverTripSheet) => {
    setSheetPendingDeletion(sheet)
  }

  const confirmDelete = async () => {
    if (!sheetPendingDeletion) {
      return
    }

    setErrorMessage('')

    try {
      await deleteDriverTripSheet(sheetPendingDeletion.id)
      setDeletedSheetIds((current) => Array.from(new Set([...current, sheetPendingDeletion.id])))
      setSavedSheets((current) => current.filter((item) => item.id !== sheetPendingDeletion.id))

      if (selectedSheet?.id === sheetPendingDeletion.id) {
        setSelectedSheet(null)
      }

      setSheetPendingDeletion(null)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    }
  }

  return (
    <PageContainer>
      <PageHeader
        actions={
          <>
            <Link to={ROUTES.freightAssignments}>
              <Button size="sm" variant="secondary">
                Ver asignaciones
              </Button>
            </Link>
            <Link to={ROUTES.reports}>
              <Button size="sm" variant="secondary">
                Reporteria
              </Button>
            </Link>
            <Link to={ROUTES.driverPerformanceReport}>
              <Button size="sm" variant="secondary">
                Rendimiento choferes
              </Button>
            </Link>
          </>
        }
        description="Rendicion operacional por viaje: peajes, viaticos, propinas, estacionamiento, espera, margen y rendimiento del chofer."
        title="Planillas de choferes"
      />

      <DriverTripSheetSummary sheets={filteredSheets} />
      {errorMessage ? <ErrorState description={errorMessage} title="No se pudo eliminar la planilla" /> : null}

      <Card>
        <div className={styles.miniFlow}>
          <div className={styles.miniFlowItem}>
            <strong>1. Asignacion</strong>
            <span>Viene desde fletes aprobados con camion y chofer.</span>
          </div>
          <div className={styles.miniFlowItem}>
            <strong>2. Viaje</strong>
            <span>Se confirma km real, entrega y espera operacional.</span>
          </div>
          <div className={styles.miniFlowItem}>
            <strong>3. Rendicion</strong>
            <span>Peajes, comida, propina, estacionamiento y otros gastos.</span>
          </div>
          <div className={styles.miniFlowItem}>
            <strong>4. Revision</strong>
            <span>Administracion aprueba, observa o marca como pagada.</span>
          </div>
        </div>
      </Card>

      {pendingAssignments.length > 0 ? (
        <Card>
          <div className={styles.assignmentQueue}>
            <div className={styles.queueHeader}>
              <div>
                <h2 className="section-title">Viajes por rendir</h2>
                <p className="muted-text">Atajos desde asignaciones de flete sin planilla asociada.</p>
              </div>
              <Badge tone="warning">{pendingAssignments.length} pendientes</Badge>
            </div>
            <div className={styles.queueGrid}>
              {pendingAssignments.map((assignment) => {
                const request = freightRequests.find((item) => item.id === assignment.requestId)
                const driver = drivers.find((item) => item.id === assignment.driverId)
                const truck = trucks.find((item) => item.id === assignment.truckId)

                return (
                  <button
                    className={styles.queueItem}
                    key={assignment.id}
                    onClick={() => {
                      setSelectedSheet(null)
                      setQuickAssignmentKey(`${assignment.id}::${Date.now()}`)
                    }}
                    type="button"
                  >
                    <strong>{request?.requestNumber || assignment.requestId}</strong>
                    <span>{driver?.name || assignment.driverId} / {truck?.plate || assignment.truckId}</span>
                    <small>{request?.originAddress || 'Origen'} a {request?.destinationAddress || 'destino'}</small>
                  </button>
                )
              })}
            </div>
          </div>
        </Card>
      ) : null}

      <FilterBar
        activeCount={activeCount}
        activeFilters={[
          ...(query ? [{ label: 'Busqueda', onRemove: () => setQuery(''), value: query }] : []),
          ...(statusFilter !== 'all'
            ? [
                {
                  label: 'Estado',
                  onRemove: () => setStatusFilter('all'),
                  value: driverTripSheetStatusLabels[statusFilter],
                },
              ]
            : []),
          ...(driverFilter !== 'all'
            ? [{ label: 'Chofer', onRemove: () => setDriverFilter('all'), value: selectedDriverName || driverFilter }]
            : []),
        ]}
        description="Filtra por chofer, estado o texto operativo para encontrar una rendicion en segundos."
        onClear={resetFilters}
        title="Control operacional"
      >
        <Input
          label="Buscar"
          name="tripSheetSearch"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Planilla, chofer, patente, cliente, ruta..."
          value={query}
        />
        <Select
          label="Estado"
          name="tripSheetStatus"
          onChange={(event) => setStatusFilter(event.target.value as 'all' | DriverTripSheetStatus)}
          options={allStatusOptions}
          value={statusFilter}
        />
        <Select
          label="Chofer"
          name="tripSheetDriver"
          onChange={(event) => setDriverFilter(event.target.value)}
          options={driverOptions}
          value={driverFilter}
        />
      </FilterBar>

      <div className={styles.workbench}>
        <Card>
          <div className="stack">
            <div className="split-row">
              <div>
                <h2 className="section-title">Rendiciones de viajes</h2>
                <p className="muted-text">Click en una fila abre el flete; los botones editan o eliminan la planilla.</p>
              </div>
              <Badge tone="info">{filteredSheets.length} visibles</Badge>
            </div>
            <DriverTripSheetTable
              isLoading={isLoading}
              onDelete={handleDelete}
              onEdit={setSelectedSheet}
              sheets={filteredSheets}
            />
          </div>
        </Card>
        <DriverTripSheetForm
          assignments={assignments}
          drivers={drivers}
          freightQuotes={freightQuotes}
          freightRequests={freightRequests}
          key={selectedSheet?.id || quickAssignmentKey || nextSheetNumber}
          nextSheetNumber={nextSheetNumber}
          onCancel={() => setSelectedSheet(null)}
          onSaved={handleSaved}
          quickAssignmentKey={quickAssignmentKey}
          sheet={selectedSheet}
          trucks={trucks}
        />
      </div>
      <ConfirmModal
        confirmLabel="Eliminar planilla"
        description={
          sheetPendingDeletion
            ? `La planilla ${sheetPendingDeletion.sheetNumber} se retirara del control operativo.`
            : undefined
        }
        onCancel={() => setSheetPendingDeletion(null)}
        onConfirm={confirmDelete}
        open={Boolean(sheetPendingDeletion)}
        title="Eliminar planilla"
        tone="danger"
      />
    </PageContainer>
  )
}
