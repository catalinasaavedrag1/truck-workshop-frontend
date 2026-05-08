import { Card } from '../../../shared/components/Card/Card'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { ownerTypeLabels } from '../constants/fleet.constants'
import type { FleetTruck } from '../types/fleet.types'
import { TruckStatusBadge } from './TruckStatusBadge'

interface TruckOperationalSummaryProps {
  truck: FleetTruck
}

export function TruckOperationalSummary({ truck }: TruckOperationalSummaryProps) {
  return (
    <Card>
      <div className="split-row">
        <div>
          <h2 className="section-title">Resumen operacional</h2>
          <p className="muted-text">{truck.brand} {truck.model} - {truck.bodyType}</p>
        </div>
        <TruckStatusBadge status={truck.operationalStatus} />
      </div>
      <dl className="detail-list">
        <div>
          <dt>Kilometraje actual</dt>
          <dd>{truck.currentOdometer.toLocaleString('es-CL')} km</dd>
        </div>
        <div>
          <dt>Chofer asignado</dt>
          <dd>{truck.assignedDriverName || 'Sin chofer'}</dd>
        </div>
        <div>
          <dt>Capacidad</dt>
          <dd>{truck.loadCapacityKg.toLocaleString('es-CL')} kg</dd>
        </div>
        <div>
          <dt>Propiedad</dt>
          <dd>{ownerTypeLabels[truck.ownerType]}</dd>
        </div>
        <div>
          <dt>Costo adquisicion</dt>
          <dd>{formatCurrency(truck.acquisitionCost)}</dd>
        </div>
        <div>
          <dt>Fecha adquisicion</dt>
          <dd>{formatDate(truck.acquisitionDate)}</dd>
        </div>
        <div>
          <dt>Disponibilidad estimada</dt>
          <dd>{truck.estimatedAvailableAt ? formatDate(truck.estimatedAvailableAt) : 'Hoy'}</dd>
        </div>
        <div>
          <dt>Bloqueo principal</dt>
          <dd>{truck.mainBlocker || 'Sin bloqueo'}</dd>
        </div>
      </dl>
    </Card>
  )
}
