import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Hash, Truck as TruckIcon, Wrench } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { trucksMock } from '../../../mocks/trucks.mock'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceItem } from '../../../shared/hooks/useResourceItem'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import { formatDate } from '../../../shared/utils/formatDate'
import { TruckHistory } from '../components/TruckHistory'
import styles from '../components/TruckModule.module.css'
import { TruckStatusBadge } from '../components/TruckStatusBadge'
import { getShortVin, getTruckServiceRisk } from '../utils/truckMaintenance'

export function TruckDetailPage() {
  const { truckId } = useParams()
  const { data: truck } = useResourceItem('/trucks', truckId, trucksMock)
  const { data: fleetTrucks } = useResourceList<FleetTruck>('/fleet/trucks', fleetTrucksMock, {
    order: 'asc',
    sort: 'plate',
  })

  if (!truck) {
    return (
      <PageContainer>
        <EmptyState icon={<AlertCircle size={22} />} title="Camion no encontrado" />
      </PageContainer>
    )
  }

  const serviceRisk = getTruckServiceRisk(truck.lastServiceAt)
  const fleetTruck = fleetTrucks.find((item) => item.plate === truck.plate)

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            <Link to={ROUTES.trucks}>
              <Button icon={<ArrowLeft size={18} />} size="sm" variant="secondary">
                Volver
              </Button>
            </Link>
            {fleetTruck ? (
              <Link to={ROUTES.fleetTruckDetail(fleetTruck.id)}>
                <Button icon={<TruckIcon size={18} />} size="sm" variant="secondary">
                  Ficha de flota
                </Button>
              </Link>
            ) : null}
          </div>
        }
        description={`${truck.brand} ${truck.model} - ano ${truck.year}. Vista de mantenimiento; la ficha maestra vive en Flota.`}
        title={`Taller camion ${truck.plate}`}
      />
      <Card className={styles.detailHero}>
        <div className={styles.heroTop}>
          <div className={styles.plateBlock}>
            <span className={styles.eyebrow}>Patente</span>
            <strong>{truck.plate}</strong>
            <span className={styles.detailMeta}>
              {truck.brand} {truck.model}
            </span>
          </div>
          <TruckStatusBadge status={truck.status} />
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span>Kilometraje</span>
            <strong>{truck.odometer.toLocaleString('es-CL')} km</strong>
          </div>
          <div className={styles.heroStat}>
            <span>Ultimo servicio</span>
            <strong>{formatDate(truck.lastServiceAt)}</strong>
          </div>
          <div className={styles.heroStat}>
            <span>Antiguedad servicio</span>
            <strong>{serviceRisk.daysSinceService} dias</strong>
          </div>
          <div className={styles.heroStat}>
            <span>VIN corto</span>
            <strong>...{getShortVin(truck.vin)}</strong>
          </div>
        </div>
      </Card>
      <div className={styles.detailGrid}>
        <div className="stack">
          <Card className={styles.detailCard}>
            <div className={styles.detailHeader}>
              <span className={styles.detailIcon}>
                <Hash aria-hidden size={18} />
              </span>
              <div>
                <h2>Datos tecnicos</h2>
                <p className={styles.detailMeta}>Identificacion y lectura base para taller.</p>
              </div>
            </div>
            <dl className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <dt>VIN completo</dt>
                <dd>{truck.vin}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Ano</dt>
                <dd>{truck.year}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Marca</dt>
                <dd>{truck.brand}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Modelo</dt>
                <dd>{truck.model}</dd>
              </div>
            </dl>
          </Card>
          <Card className={styles.detailCard}>
            <div className={styles.detailHeader}>
              <span className={styles.detailIcon}>
                <Wrench aria-hidden size={18} />
              </span>
              <div>
                <h2>Control de mantencion</h2>
                <p className={styles.detailMeta}>Estado calculado desde la ultima fecha de servicio registrada.</p>
              </div>
            </div>
            <div className={styles.servicePanel}>
              <div className={styles.serviceRow}>
                <div>
                  <strong>{serviceRisk.label}</strong>
                  <p className={styles.serviceHelper}>{serviceRisk.helper}</p>
                </div>
                <Badge tone={serviceRisk.tone}>{serviceRisk.daysSinceService} dias</Badge>
              </div>
              <div aria-label="Avance referencial de ciclo de servicio" className={styles.progressTrack}>
                <span style={{ width: `${serviceRisk.progress}%` }} />
              </div>
              <p className={styles.serviceHelper}>
                Referencia visual: desde 30 dias conviene agendar revision, sobre 45 dias se marca como vencido.
              </p>
            </div>
          </Card>
        </div>
        <TruckHistory lastServiceAt={truck.lastServiceAt} />
      </div>
    </PageContainer>
  )
}
