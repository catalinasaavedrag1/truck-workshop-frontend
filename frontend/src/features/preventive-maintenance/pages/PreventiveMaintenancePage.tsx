import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarClock, ClipboardCheck, Plus, ShieldCheck, Truck } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import { MaintenanceCoverageBoard } from '../components/MaintenanceCoverageBoard'
import { MaintenancePlanTable } from '../components/MaintenancePlanTable'
import styles from '../components/PreventiveMaintenance.module.css'
import { preventiveMaintenanceMock } from '../mocks/preventiveMaintenance.mock'
import type { PreventiveMaintenancePlan } from '../types/preventiveMaintenance.types'
import {
  getMaintenancePlanSnapshot,
  getTruckPreventiveSummary,
} from '../utils/preventiveMaintenanceOperations'

type MaintenanceFilter = 'all' | 'blocked' | 'warning' | 'ok' | 'without-plan'

export function PreventiveMaintenancePage() {
  const [activeFilter, setActiveFilter] = useState<MaintenanceFilter>('all')
  const { data: preventiveMaintenance, isLoading: plansLoading } = useResourceList<PreventiveMaintenancePlan>(
    '/preventive-maintenance/plans',
    preventiveMaintenanceMock,
    { order: 'asc', sort: 'nextDueAt' },
  )
  const { data: fleetTrucks, isLoading: trucksLoading } = useResourceList<FleetTruck>('/fleet/trucks', fleetTrucksMock, {
    order: 'asc',
    sort: 'plate',
  })
  const trucksById = useMemo(() => new Map(fleetTrucks.map((truck) => [truck.id, truck])), [fleetTrucks])

  const planSnapshots = useMemo(() => {
    return preventiveMaintenance.map((plan) => ({
      plan,
      snapshot: getMaintenancePlanSnapshot(plan, trucksById.get(plan.truckId)),
    }))
  }, [preventiveMaintenance, trucksById])

  const stats = useMemo(() => {
    const blocked = planSnapshots.filter(({ snapshot }) => snapshot.effectiveRisk === 'OVERDUE' || snapshot.effectiveRisk === 'CRITICAL').length
    const warning = planSnapshots.filter(({ snapshot }) => snapshot.effectiveRisk === 'WARNING').length
    const trucksWithPlan = new Set(preventiveMaintenance.map((plan) => plan.truckId)).size
    const trucksWithoutPlan = Math.max(0, fleetTrucks.length - trucksWithPlan)
    const nextSevenDays = planSnapshots.filter(({ snapshot }) => snapshot.daysRemaining !== undefined && snapshot.daysRemaining >= 0 && snapshot.daysRemaining <= 7).length

    return {
      blocked,
      nextSevenDays,
      ok: planSnapshots.filter(({ snapshot }) => snapshot.effectiveRisk === 'OK').length,
      totalPlans: preventiveMaintenance.length,
      trucksWithPlan,
      trucksWithoutPlan,
      warning,
    }
  }, [fleetTrucks.length, planSnapshots, preventiveMaintenance])

  const filteredPlans = useMemo(() => {
    if (activeFilter === 'without-plan') {
      return []
    }

    return preventiveMaintenance.filter((plan) => {
      const snapshot = getMaintenancePlanSnapshot(plan, trucksById.get(plan.truckId))

      if (activeFilter === 'blocked') {
        return snapshot.effectiveRisk === 'OVERDUE' || snapshot.effectiveRisk === 'CRITICAL'
      }

      if (activeFilter === 'warning') {
        return snapshot.effectiveRisk === 'WARNING'
      }

      if (activeFilter === 'ok') {
        return snapshot.effectiveRisk === 'OK'
      }

      return true
    })
  }, [activeFilter, preventiveMaintenance, trucksById])

  const trucksWithoutPlan = useMemo(() => {
    const plannedTruckIds = new Set(preventiveMaintenance.map((plan) => plan.truckId))
    return fleetTrucks.filter((truck) => !plannedTruckIds.has(truck.id))
  }, [fleetTrucks, preventiveMaintenance])

  const filters: Array<{ count: number; key: MaintenanceFilter; label: string }> = [
    { count: stats.totalPlans, key: 'all', label: 'Todos' },
    { count: stats.blocked, key: 'blocked', label: 'Bloquean salida' },
    { count: stats.warning, key: 'warning', label: 'Por agendar' },
    { count: stats.ok, key: 'ok', label: 'Al dia' },
    { count: stats.trucksWithoutPlan, key: 'without-plan', label: 'Sin plan' },
  ]

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <Link to={ROUTES.preventiveMaintenanceNew}>
              <Button icon={<Plus size={18} />}>Nuevo plan</Button>
            </Link>
          }
          description="Planifica mantenciones por camion, odometro, fecha, disponibilidad y riesgo antes de liberar unidades a ruta."
          title="Mantenimiento preventivo"
        />

        <div className={styles.summaryGrid}>
          <SummaryItem icon={<ClipboardCheck size={18} />} label="Planes activos" value={stats.totalPlans} helper={`${stats.trucksWithPlan} camiones cubiertos`} />
          <SummaryItem icon={<AlertTriangle size={18} />} label="Bloquean salida" value={stats.blocked} helper="vencidos o criticos" />
          <SummaryItem icon={<CalendarClock size={18} />} label="Proximos 7 dias" value={stats.nextSevenDays} helper="requieren agenda cercana" />
          <SummaryItem icon={<Truck size={18} />} label="Camiones sin plan" value={stats.trucksWithoutPlan} helper="sin cobertura preventiva" />
        </div>

        <div className={styles.filterBar} aria-label="Filtros de mantenimiento preventivo">
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
              {filter.key === 'ok' ? <ShieldCheck size={15} /> : null}
              <span>{filter.label}</span>
              <span className={styles.filterCount}>{filter.count}</span>
            </button>
          ))}
        </div>

        <MaintenanceCoverageBoard plans={preventiveMaintenance} trucks={fleetTrucks} />

        {activeFilter === 'without-plan' ? (
          <Card className={styles.panel}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Camiones sin plan preventivo</h2>
                <p>Unidades que no tienen reglas por fecha ni kilometraje.</p>
              </div>
            </div>
            <div className={styles.coverageGrid}>
              {trucksWithoutPlan.map((truck) => {
                const summary = getTruckPreventiveSummary(truck, preventiveMaintenance)

                return (
                  <Link className={styles.truckCard} key={truck.id} to={ROUTES.preventiveMaintenanceNew}>
                    <div className={styles.truckCell}>
                      <strong>{truck.plate}</strong>
                      <span className={styles.truckMeta}>{truck.brand} {truck.model}</span>
                    </div>
                    <span className={styles.badgeLine}>
                      <span className={styles.filterCount}>{summary.plans.length}</span>
                      <span className={styles.truckMeta}>Crear cobertura preventiva</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </Card>
        ) : (
          <Card className={styles.tableShell}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Planes conectados a camiones</h2>
                <p>
                  {plansLoading || trucksLoading
                    ? 'Cargando planes y unidades.'
                    : `${filteredPlans.length} de ${preventiveMaintenance.length} planes visibles.`}
                </p>
              </div>
            </div>
            <MaintenancePlanTable plans={filteredPlans} trucks={fleetTrucks} />
          </Card>
        )}
      </div>
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
