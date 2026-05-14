import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarClock, Gauge, Plus, Tags, UserCheck, Wrench } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { casesMock } from '../../../mocks/cases.mock'
import { mechanicsMock } from '../../../mocks/mechanics.mock'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { Modal } from '../../../shared/components/Modal/Modal'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { scheduleEventsMock } from '../../schedule/mocks/schedule.mock'
import type { ScheduleEvent } from '../../schedule/types/schedule.types'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import { MechanicForm } from '../components/MechanicForm'
import { MechanicTable } from '../components/MechanicTable'
import styles from '../components/MechanicView.module.css'
import type { Mechanic } from '../types/mechanic.types'
import { getMechanicOperationalSummary } from '../utils/mechanicOperations'

type MechanicFilter = 'all' | 'available' | 'at-risk' | 'off-shift' | 'saturated'

export function MechanicsPage() {
  const [savedMechanics, setSavedMechanics] = useState<Mechanic[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<MechanicFilter>('all')
  const { data: mechanicData, isLoading: mechanicsLoading } = useResourceList<Mechanic>('/mechanics', mechanicsMock, {
    sort: 'name',
    order: 'asc',
  })
  const { data: workshopCases, isLoading: casesLoading } = useResourceList<WorkshopCase>('/workshop-cases', casesMock, {
    order: 'desc',
    sort: 'updatedAt',
  })
  const { data: scheduleEvents, isLoading: scheduleLoading } = useResourceList<ScheduleEvent>('/schedule/events', scheduleEventsMock, {
    order: 'asc',
    sort: 'startsAt',
  })

  const mechanics = useMemo(() => {
    const savedById = new Map(savedMechanics.map((mechanic) => [mechanic.id, mechanic]))

    return [
      ...mechanicData.filter((mechanic) => !savedById.has(mechanic.id)),
      ...savedMechanics,
    ].sort((first, second) => first.name.localeCompare(second.name, 'es-CL'))
  }, [mechanicData, savedMechanics])

  const summaryByMechanicId = useMemo(() => {
    return new Map(mechanics.map((mechanic) => [
      mechanic.id,
      getMechanicOperationalSummary(mechanic, workshopCases, scheduleEvents),
    ]))
  }, [mechanics, scheduleEvents, workshopCases])

  const stats = useMemo(() => {
    const summaries = [...summaryByMechanicId.values()]

    return {
      atRisk: summaries.filter((summary) => summary.slaRiskCases > 0 || summary.blockedByParts > 0).length,
      available: mechanics.filter((mechanic) => mechanic.availability === 'available').length,
      capacity: summaries.reduce((total, summary) => total + summary.remainingCapacity, 0),
      scheduledHours: summaries.reduce((total, summary) => total + summary.scheduledHours, 0),
      saturated: summaries.filter((summary) => summary.remainingCapacity <= 0).length,
      total: mechanics.length,
    }
  }, [mechanics, summaryByMechanicId])

  const filteredMechanics = useMemo(() => {
    return mechanics.filter((mechanic) => {
      const summary = summaryByMechanicId.get(mechanic.id)

      if (activeFilter === 'available') {
        return mechanic.availability === 'available' && Boolean(summary?.remainingCapacity)
      }

      if (activeFilter === 'at-risk') {
        return Boolean(summary && (summary.slaRiskCases > 0 || summary.blockedByParts > 0))
      }

      if (activeFilter === 'off-shift') {
        return mechanic.availability === 'off-shift'
      }

      if (activeFilter === 'saturated') {
        return Boolean(summary && summary.remainingCapacity <= 0)
      }

      return true
    })
  }, [activeFilter, mechanics, summaryByMechanicId])

  const filters: Array<{ count: number; key: MechanicFilter; label: string }> = [
    { count: stats.total, key: 'all', label: 'Todos' },
    { count: stats.available, key: 'available', label: 'Disponibles' },
    { count: stats.saturated, key: 'saturated', label: 'Saturados' },
    { count: stats.atRisk, key: 'at-risk', label: 'Con riesgo' },
    {
      count: mechanics.filter((mechanic) => mechanic.availability === 'off-shift').length,
      key: 'off-shift',
      label: 'Fuera de turno',
    },
  ]

  const handleSaved = (mechanic: Mechanic) => {
    setSavedMechanics((current) => [
      mechanic,
      ...current.filter((item) => item.id !== mechanic.id),
    ])
    setIsCreateOpen(false)
  }

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <>
              <Link to={ROUTES.mechanicSpecialties}>
                <Button icon={<Tags size={18} />} variant="secondary">
                  Especialidades
                </Button>
              </Link>
              <Button icon={<Plus size={18} />} onClick={() => setIsCreateOpen(true)}>
                Nuevo mecanico
              </Button>
            </>
          }
          description="Capacidad real del taller, disponibilidad, riesgos SLA, agenda y asignaciones por mecanico."
          title="Mecanicos"
        />

        <div className={styles.summaryGrid}>
          <SummaryItem icon={<Wrench size={18} />} label="Equipo taller" value={stats.total} helper={`${stats.available} disponibles`} />
          <SummaryItem icon={<Gauge size={18} />} label="Capacidad libre" value={stats.capacity} helper="cupos para nuevos casos" />
          <SummaryItem icon={<AlertTriangle size={18} />} label="Con riesgo" value={stats.atRisk} helper="SLA o repuestos bloqueados" />
          <SummaryItem icon={<CalendarClock size={18} />} label="Agenda registrada" value={`${stats.scheduledHours} h`} helper="horas planificadas" />
        </div>

        <div className={styles.filterBar} aria-label="Filtros de mecanicos">
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
              {filter.key === 'available' ? <UserCheck size={15} /> : null}
              <span>{filter.label}</span>
              <span className={styles.filterCount}>{filter.count}</span>
            </button>
          ))}
        </div>

        <Card>
          <MechanicTable
            isLoading={mechanicsLoading || casesLoading || scheduleLoading}
            mechanics={filteredMechanics}
            summaryByMechanicId={summaryByMechanicId}
          />
        </Card>
      </div>

      <Modal onClose={() => setIsCreateOpen(false)} open={isCreateOpen} title="Crear mecanico">
        <MechanicForm onCancel={() => setIsCreateOpen(false)} onSaved={handleSaved} />
      </Modal>
    </PageContainer>
  )
}

interface SummaryItemProps {
  helper: string
  icon: ReactNode
  label: string
  value: number | string
}

function SummaryItem({ helper, icon, label, value }: SummaryItemProps) {
  return (
    <div className={styles.summaryItem}>
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
      <span className={styles.helperText}>{helper}</span>
    </div>
  )
}
