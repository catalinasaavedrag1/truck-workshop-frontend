import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CalendarClock, ClipboardList } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { casesMock } from '../../../mocks/cases.mock'
import { mechanicsMock } from '../../../mocks/mechanics.mock'
import { Button } from '../../../shared/components/Button/Button'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceItem } from '../../../shared/hooks/useResourceItem'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { scheduleEventsMock } from '../../schedule/mocks/schedule.mock'
import type { ScheduleEvent } from '../../schedule/types/schedule.types'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import { MechanicCasesList } from '../components/MechanicCasesList'
import { MechanicOperationalPanel } from '../components/MechanicOperationalPanel'
import { MechanicSchedulePanel } from '../components/MechanicSchedulePanel'
import styles from '../components/MechanicView.module.css'
import { getMechanicOperationalSummary } from '../utils/mechanicOperations'

export function MechanicDetailPage() {
  const { mechanicId } = useParams()
  const { data: mechanic } = useResourceItem('/mechanics', mechanicId, mechanicsMock)
  const { data: workshopCases, isLoading: casesLoading } = useResourceList<WorkshopCase>('/workshop-cases', casesMock, {
    order: 'desc',
    sort: 'updatedAt',
  })
  const { data: scheduleEvents } = useResourceList<ScheduleEvent>('/schedule/events', scheduleEventsMock, {
    order: 'asc',
    sort: 'startsAt',
  })

  const summary = useMemo(() => {
    return mechanic ? getMechanicOperationalSummary(mechanic, workshopCases, scheduleEvents) : undefined
  }, [mechanic, scheduleEvents, workshopCases])

  if (!mechanic || !summary) {
    return (
      <PageContainer>
        <EmptyState icon={<AlertCircle size={22} />} title="Mecanico no encontrado" />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <>
              <Link to={ROUTES.mechanics}>
                <Button icon={<ArrowLeft size={18} />} variant="secondary">
                  Volver
                </Button>
              </Link>
              <Link to={ROUTES.assignments}>
                <Button icon={<ClipboardList size={18} />} variant="secondary">
                  Asignar casos
                </Button>
              </Link>
              <Link to={ROUTES.schedule}>
                <Button icon={<CalendarClock size={18} />}>
                  Ver agenda
                </Button>
              </Link>
            </>
          }
          description={`${mechanic.specialty || 'Sin especialidad'} - ${summary.decision.helper}`}
          title={mechanic.name}
        />

        <div className={styles.detailGrid}>
          <div className={styles.detailMain}>
            <MechanicOperationalPanel mechanic={mechanic} summary={summary} />
            <MechanicCasesList cases={workshopCases} isLoading={casesLoading} mechanicId={mechanic.id} />
          </div>
          <div className={styles.detailSide}>
            <MechanicSchedulePanel events={summary.scheduleEvents} />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
