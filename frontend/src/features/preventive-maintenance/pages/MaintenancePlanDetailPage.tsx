import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ClipboardPlus, Truck as TruckIcon } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceItem } from '../../../shared/hooks/useResourceItem'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { formatDate } from '../../../shared/utils/formatDate'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import { maintenanceTypeLabels } from '../constants/preventiveMaintenance.constants'
import { MaintenanceDueBadge } from '../components/MaintenanceDueBadge'
import { MaintenanceTruckContextPanel } from '../components/MaintenanceTruckContextPanel'
import styles from '../components/PreventiveMaintenance.module.css'
import { preventiveMaintenanceMock } from '../mocks/preventiveMaintenance.mock'
import type { PreventiveMaintenancePlan } from '../types/preventiveMaintenance.types'
import { getMaintenancePlanSnapshot } from '../utils/preventiveMaintenanceOperations'

export function MaintenancePlanDetailPage() {
  const { planId } = useParams()
  const { data: plan } = useResourceItem('/preventive-maintenance/plans', planId, preventiveMaintenanceMock)
  const { data: fleetTrucks } = useResourceList<FleetTruck>('/fleet/trucks', fleetTrucksMock, {
    order: 'asc',
    sort: 'plate',
  })
  const { data: allPlans } = useResourceList<PreventiveMaintenancePlan>(
    '/preventive-maintenance/plans',
    preventiveMaintenanceMock,
    { order: 'asc', sort: 'nextDueAt' },
  )

  if (!plan) {
    return (
      <PageContainer>
        <EmptyState icon={<AlertCircle size={22} />} title="Plan no encontrado" />
      </PageContainer>
    )
  }

  const truck = fleetTrucks.find((item) => item.id === plan.truckId)
  const truckPlans = allPlans.filter((item) => item.truckId === plan.truckId)
  const snapshot = getMaintenancePlanSnapshot(plan, truck)

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <>
              <Link to={ROUTES.preventiveMaintenance}>
                <Button icon={<ArrowLeft size={18} />} variant="secondary">
                  Volver
                </Button>
              </Link>
              {truck ? (
                <Link to={ROUTES.fleetTruckDetail(truck.id)}>
                  <Button icon={<TruckIcon size={18} />} variant="secondary">
                    Ver camion
                  </Button>
                </Link>
              ) : null}
              <Link to={ROUTES.caseNew}>
                <Button icon={<ClipboardPlus size={18} />}>Caso taller</Button>
              </Link>
            </>
          }
          description={`${truck?.plate || plan.truckId} - ${maintenanceTypeLabels[plan.maintenanceType]} - ${snapshot.decisionLabel}`}
          title="Detalle mantencion preventiva"
        />

        <div className={styles.detailGrid}>
          <div className={styles.detailMain}>
            <Card className={styles.detailPanel}>
              <div className={styles.heroPanel}>
                <div className={styles.decisionHeader}>
                  <div>
                    <h2>{maintenanceTypeLabels[plan.maintenanceType]}</h2>
                    <p className={styles.helperText}>{plan.description}</p>
                  </div>
                  <span className={styles.badgeLine}>
                    <MaintenanceDueBadge status={snapshot.effectiveRisk} />
                    <Badge tone={snapshot.tone}>{snapshot.decisionLabel}</Badge>
                  </span>
                </div>
                <div className={styles.progressTrack} aria-label="Avance del ciclo preventivo">
                  <span style={{ width: `${snapshot.progress}%` }} />
                </div>
                <p className={styles.helperText}>{snapshot.decisionHelper}</p>
              </div>

              <div className={styles.metricGrid}>
                <Metric label="Proximo hito" tone={snapshot.tone} value={snapshot.dueLabel} />
                <Metric label="Frecuencia" tone="info" value={snapshot.frequencyLabel} />
                <Metric label="Responsable" tone="neutral" value={plan.assignedTo || 'Taller'} />
              </div>

              <dl className="detail-list">
                <div>
                  <dt>Ultima fecha</dt>
                  <dd>{plan.lastDoneAt ? formatDate(plan.lastDoneAt) : '-'}</dd>
                </div>
                <div>
                  <dt>Ultimo odometro</dt>
                  <dd>{plan.lastDoneOdometer ? `${plan.lastDoneOdometer.toLocaleString('es-CL')} km` : '-'}</dd>
                </div>
                <div>
                  <dt>Proxima fecha</dt>
                  <dd>{plan.nextDueAt ? formatDate(plan.nextDueAt) : '-'}</dd>
                </div>
                <div>
                  <dt>Proximo odometro</dt>
                  <dd>{plan.nextDueOdometer ? `${plan.nextDueOdometer.toLocaleString('es-CL')} km` : '-'}</dd>
                </div>
                <div>
                  <dt>Notas</dt>
                  <dd>{plan.notes || 'Sin notas'}</dd>
                </div>
              </dl>
            </Card>

            <Card className={styles.panel}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2>Otros planes del camion</h2>
                  <p>Vista cruzada para no revisar la unidad plan por plan.</p>
                </div>
                <Badge tone="info">{truckPlans.length} planes</Badge>
              </div>
              <div className={styles.timelineList}>
                {truckPlans.map((truckPlan, index) => {
                  const planSnapshot = getMaintenancePlanSnapshot(truckPlan, truck)

                  return (
                    <Link className={styles.timelineRow} key={truckPlan.id} to={ROUTES.preventiveMaintenanceDetail(truckPlan.id)}>
                      <span className={styles.timelineDot}>{index + 1}</span>
                      <div className={styles.timelineBody}>
                        <strong>{maintenanceTypeLabels[truckPlan.maintenanceType]}</strong>
                        <span>{truckPlan.description} - {planSnapshot.dueLabel}</span>
                      </div>
                      <MaintenanceDueBadge status={planSnapshot.effectiveRisk} />
                    </Link>
                  )
                })}
              </div>
            </Card>
          </div>

          <div className={styles.detailSide}>
            <MaintenanceTruckContextPanel activePlan={plan} plans={truckPlans} truck={truck} />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

interface MetricProps {
  label: string
  tone: 'danger' | 'info' | 'neutral' | 'success' | 'warning'
  value: string
}

function Metric({ label, tone, value }: MetricProps) {
  return (
    <div className={[styles.metricItem, styles[tone]].join(' ')}>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  )
}
