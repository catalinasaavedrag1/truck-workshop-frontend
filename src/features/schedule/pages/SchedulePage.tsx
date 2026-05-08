import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarPlus } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { mechanicsMock } from '../../../mocks/mechanics.mock'
import type { Mechanic } from '../../mechanics/types/mechanic.types'
import { workshopBaysMock } from '../../workshop-bays/mocks/workshopBays.mock'
import type { WorkshopBay } from '../../workshop-bays/types/workshopBay.types'
import { BayAvailabilityPanel } from '../components/BayAvailabilityPanel'
import { PlanCaseModal } from '../components/PlanCaseModal'
import { ScheduleCapacityCards } from '../components/ScheduleCapacityCards'
import { ScheduleFilters } from '../components/ScheduleFilters'
import { WaitingQueueList } from '../components/WaitingQueueList'
import { WorkshopScheduleTimeline } from '../components/WorkshopScheduleTimeline'
import { scheduleEventsMock, waitingQueueMock } from '../mocks/schedule.mock'
import type {
  ScheduleEvent,
  ScheduleFilters as ScheduleFiltersModel,
  SchedulePlanResponse,
  WaitingQueueItem,
} from '../types/schedule.types'
import { getDateKey } from '../utils/scheduleTime'

const todayKey = new Date().toISOString().slice(0, 10)
const initialFilters: ScheduleFiltersModel = {
  bayId: 'all',
  date: todayKey,
  mechanicId: 'all',
  query: '',
  status: 'all',
  viewMode: 'day',
}

export function SchedulePage() {
  const [filters, setFilters] = useState(initialFilters)
  const [plannedEvents, setPlannedEvents] = useState<ScheduleEvent[]>([])
  const [removedQueueIds, setRemovedQueueIds] = useState<string[]>([])
  const [selectedQueueItem, setSelectedQueueItem] = useState<WaitingQueueItem | null>(null)
  const { data: scheduleEventsData } = useResourceList<ScheduleEvent>('/schedule/events', scheduleEventsMock, {
    order: 'asc',
    sort: 'startsAt',
  })
  const { data: waitingQueueData } = useResourceList<WaitingQueueItem>('/schedule/waiting-queue', waitingQueueMock, {
    order: 'asc',
    sort: 'requestedAt',
  })
  const { data: mechanics } = useResourceList<Mechanic>('/mechanics', mechanicsMock, {
    order: 'asc',
    sort: 'name',
  })
  const { data: bays } = useResourceList<WorkshopBay>('/bays', workshopBaysMock, {
    order: 'asc',
    sort: 'name',
  })

  const scheduleEvents = useMemo(() => {
    const plannedById = new Map(plannedEvents.map((event) => [event.id, event]))

    return [
      ...scheduleEventsData.filter((event) => !plannedById.has(event.id)),
      ...plannedEvents,
    ]
  }, [plannedEvents, scheduleEventsData])

  const waitingQueue = useMemo(
    () => waitingQueueData.filter((item) => !removedQueueIds.includes(item.id)),
    [removedQueueIds, waitingQueueData],
  )

  const visibleEvents = useMemo(() => {
    const query = filters.query.trim().toLowerCase()

    return scheduleEvents.filter((event) => {
      const matchesDate = getDateKey(event.date) === filters.date
      const matchesBay = filters.bayId === 'all' || event.bayId === filters.bayId
      const matchesMechanic = filters.mechanicId === 'all' || event.mechanicId === filters.mechanicId
      const matchesStatus = filters.status === 'all' || event.status === filters.status
      const matchesQuery =
        !query ||
        event.caseNumber.toLowerCase().includes(query) ||
        event.customerName.toLowerCase().includes(query) ||
        event.truckPlate.toLowerCase().includes(query) ||
        event.mechanicName.toLowerCase().includes(query) ||
        event.title.toLowerCase().includes(query)

      return matchesDate && matchesBay && matchesMechanic && matchesStatus && matchesQuery
    })
  }, [filters, scheduleEvents])

  const visibleQueue = useMemo(() => {
    const query = filters.query.trim().toLowerCase()

    return waitingQueue.filter((item) => {
      if (!query) {
        return true
      }

      return (
        item.caseNumber.toLowerCase().includes(query) ||
        item.customerName.toLowerCase().includes(query) ||
        item.truckPlate.toLowerCase().includes(query) ||
        item.reason.toLowerCase().includes(query)
      )
    })
  }, [filters.query, waitingQueue])

  const handleScheduled = (response: SchedulePlanResponse) => {
    setPlannedEvents((current) => [
      response.scheduleEvent,
      ...current.filter((event) => event.id !== response.scheduleEvent.id),
    ])

    if (response.removedQueueItem?.id) {
      setRemovedQueueIds((current) => Array.from(new Set([...current, response.removedQueueItem!.id])))
    }
  }

  return (
    <PageContainer>
      <PageHeader
        actions={
          <Link to={ROUTES.caseNew}>
            <Button icon={<CalendarPlus size={18} />}>Nuevo caso</Button>
          </Link>
        }
        description="Planificador diario por estacion de trabajo, horario, mecanico, SLA, repuestos y cola de espera."
        title="Agenda del taller"
      >
        <ScheduleFilters bays={bays} filters={filters} mechanics={mechanics} setFilters={setFilters} />
      </PageHeader>
      <ScheduleCapacityCards bays={bays} events={visibleEvents} queue={visibleQueue} />
      <div className="two-column-grid schedule-planner-grid">
        <Card>
          <SectionHeader
            actions={<span className="muted-text">08:00 - 19:00</span>}
            description={`${visibleEvents.length} trabajos visibles para ${filters.date}. Cada fila representa una estacion.`}
            title="Planificador diario"
          />
          <WorkshopScheduleTimeline bayId={filters.bayId} bays={bays} events={visibleEvents} />
        </Card>
        <div className="stack">
          <Card>
            <SectionHeader
              actions={<strong>{visibleQueue.length}</strong>}
              description="Casos pendientes de ubicar en una estacion."
              title="Cola priorizada"
            />
            <WaitingQueueList onPlan={setSelectedQueueItem} queue={visibleQueue} />
          </Card>
          <Card>
            <div className="stack">
              <h2 className="section-title">Estado de estaciones</h2>
              <BayAvailabilityPanel bays={bays} />
            </div>
          </Card>
        </div>
      </div>
      <PlanCaseModal
        bays={bays}
        defaultDate={filters.date}
        events={scheduleEvents}
        mechanics={mechanics}
        onClose={() => setSelectedQueueItem(null)}
        onScheduled={handleScheduled}
        queueItem={selectedQueueItem}
      />
    </PageContainer>
  )
}
