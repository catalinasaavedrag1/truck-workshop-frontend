import { Card } from '../../../shared/components/Card/Card'
import { EntityLink } from '../../../shared/components/EntityLink'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type { WorkshopCase } from '../types/workshopCase.types'
import { CaseStatusBadges } from './CaseStatusBadges'
import styles from './WorkshopCaseLayout.module.css'

interface CaseSummaryPanelProps {
  workshopCase: WorkshopCase
}

export function CaseSummaryPanel({ workshopCase }: CaseSummaryPanelProps) {
  return (
    <Card>
      <div className={styles.summaryPanel}>
        <div className={styles.summaryHeader}>
          <h2>Resumen del caso</h2>
          <CaseStatusBadges workshopCase={workshopCase} />
        </div>
        <dl className={styles.compactList}>
          <div>
            <dt>Camion</dt>
            <dd>
              <EntityLink id={workshopCase.truckId} type="workshopTruck">
                {workshopCase.truckPlate}
              </EntityLink>
            </dd>
          </div>
          <div>
            <dt>Chofer</dt>
            <dd>
              <EntityLink fallback="Sin chofer" id={workshopCase.driverId} type="driver">
                {workshopCase.driverName}
              </EntityLink>
            </dd>
          </div>
          <div>
            <dt>Cliente</dt>
            <dd>
              {workshopCase.customerId ? (
                <EntityLink id={workshopCase.customerId} type="customer">
                  {workshopCase.customerName || workshopCase.customer}
                </EntityLink>
              ) : (
                workshopCase.customerName || workshopCase.customer || 'Sin cliente'
              )}
            </dd>
          </div>
          <div>
            <dt>Mecanico</dt>
            <dd>
              <EntityLink fallback="Sin asignar" id={workshopCase.mechanicId || workshopCase.assignedMechanicId} type="mechanic">
                {workshopCase.mechanicName}
              </EntityLink>
            </dd>
          </div>
          <div>
            <dt>Bodega</dt>
            <dd>{workshopCase.warehouseManagerName || 'Sin asignar'}</dd>
          </div>
          <div>
            <dt>Entrega</dt>
            <dd>{workshopCase.estimatedDeliveryAt ? formatDate(workshopCase.estimatedDeliveryAt) : 'Por definir'}</dd>
          </div>
          <div>
            <dt>Costo estimado</dt>
            <dd>{formatCurrency(workshopCase.estimatedCost)}</dd>
          </div>
          {workshopCase.closedAt ? (
            <div>
              <dt>Cierre</dt>
              <dd>{formatDate(workshopCase.closedAt)}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </Card>
  )
}
