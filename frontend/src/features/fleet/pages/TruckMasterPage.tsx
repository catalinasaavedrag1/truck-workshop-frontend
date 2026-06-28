import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Plus, Truck, Users, Wrench } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { MetricCard } from '../../../shared/components/MetricCard/MetricCard'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { TruckMasterTable } from '../components/TruckMasterTable'
import { fleetTrucksMock } from '../mocks/fleet.mock'
import type { FleetTruck } from '../types/fleet.types'
import styles from '../../trucks/components/TruckModule.module.css'

export function TruckMasterPage() {
  const { data: fleetTrucks } = useResourceList<FleetTruck>('/fleet/trucks', fleetTrucksMock, {
    order: 'asc',
    sort: 'plate',
  })
  const summary = useMemo(
    () => ({
      available: fleetTrucks.filter((truck) => truck.operationalStatus === 'AVAILABLE').length,
      blocked: fleetTrucks.filter((truck) =>
        ['BLOCKED', 'OUT_OF_SERVICE', 'WAITING_PARTS'].includes(truck.operationalStatus),
      ).length,
      inWorkshop: fleetTrucks.filter((truck) => truck.operationalStatus === 'IN_WORKSHOP').length,
      withoutDriver: fleetTrucks.filter((truck) => !truck.assignedDriverId).length,
    }),
    [fleetTrucks],
  )

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            <Link to={ROUTES.truckNew}>
              <Button icon={<Plus size={18} />}>Nuevo camion</Button>
            </Link>
            <Link to={ROUTES.drivers}>
              <Button icon={<Users size={18} />} variant="secondary">
                Choferes
              </Button>
            </Link>
          </div>
        }
        description="Inventario maestro: datos base, propiedad, chofer y estado."
        title="Ficha maestra de camiones"
      />
      <div className={styles.summaryGrid}>
        <MetricCard
          helper={`${summary.available} disponibles para asignacion`}
          icon={<Truck aria-hidden size={18} />}
          label="Unidades registradas"
          to={ROUTES.fleetTrucks}
          value={fleetTrucks.length}
        />
        <MetricCard
          helper="Listas para flete o uso operativo"
          icon={<CheckCircle2 aria-hidden size={18} />}
          label="Disponibles"
          tone="success"
          to={`${ROUTES.fleetTrucks}?status=AVAILABLE`}
          value={summary.available}
        />
        <MetricCard
          helper="Sin conductor operativo vinculado"
          icon={<Users aria-hidden size={18} />}
          label="Sin chofer"
          tone={summary.withoutDriver > 0 ? 'warning' : 'success'}
          to={`${ROUTES.fleetTrucks}?query=sin chofer`}
          value={summary.withoutDriver}
        />
        <MetricCard
          helper={`${summary.inWorkshop} en taller o diagnostico`}
          icon={<AlertTriangle aria-hidden size={18} />}
          label="Con bloqueo"
          tone={summary.blocked > 0 ? 'danger' : 'success'}
          to={`${ROUTES.fleetTrucks}?status=BLOCKED`}
          value={summary.blocked}
        />
      </div>
      <Card>
        <div className="section-heading-row">
          <div>
            <h2 className="section-title">Registro maestro</h2>
            <p className="muted-text">Para fallas, reparaciones y casos activos usa Camiones en taller (seccion Taller).</p>
          </div>
          <Wrench size={20} />
        </div>
        <TruckMasterTable trucks={fleetTrucks} />
      </Card>
    </PageContainer>
  )
}
