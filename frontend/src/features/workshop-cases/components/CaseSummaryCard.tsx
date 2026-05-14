import { Card } from '../../../shared/components/Card/Card'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { SlaBadge } from '../../sla/components/SlaBadge'
import type { WorkshopCase } from '../types/workshopCase.types'
import { CasePriorityBadge } from './CasePriorityBadge'
import { CaseStatusBadge } from './CaseStatusBadge'

interface CaseSummaryCardProps {
  workshopCase: WorkshopCase
}

export function CaseSummaryCard({ workshopCase }: CaseSummaryCardProps) {
  return (
    <Card>
      <dl className="detail-list">
        <div>
          <dt>Estado</dt>
          <dd>
            <CaseStatusBadge status={workshopCase.status} />
          </dd>
        </div>
        <div>
          <dt>Prioridad</dt>
          <dd>
            <CasePriorityBadge priority={workshopCase.priority} />
          </dd>
        </div>
        <div>
          <dt>Camion</dt>
          <dd>{workshopCase.truckPlate}</dd>
        </div>
        <div>
          <dt>Chofer</dt>
          <dd>{workshopCase.driverName}</dd>
        </div>
        <div>
          <dt>Operacion</dt>
          <dd>{workshopCase.customerName}</dd>
        </div>
        <div>
          <dt>Mecanico</dt>
          <dd>{workshopCase.mechanicName || 'Sin asignar'}</dd>
        </div>
        <div>
          <dt>Bodega</dt>
          <dd>{workshopCase.warehouseManagerName || 'Sin asignar'}</dd>
        </div>
        <div>
          <dt>SLA</dt>
          <dd>
            <SlaBadge status={workshopCase.slaStatus} />
          </dd>
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
        {workshopCase.closedBy ? (
          <div>
            <dt>Cerrado por</dt>
            <dd>{workshopCase.closedBy}</dd>
          </div>
        ) : null}
        {workshopCase.closureSummary ? (
          <div>
            <dt>Resumen cierre</dt>
            <dd>{workshopCase.closureSummary}</dd>
          </div>
        ) : null}
      </dl>
    </Card>
  )
}
