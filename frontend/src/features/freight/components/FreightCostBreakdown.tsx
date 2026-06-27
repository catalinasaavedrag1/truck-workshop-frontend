import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type { FreightFuelPriceSource } from '../types/freight.types'

interface FreightCostBreakdownProps {
  baseRate: number
  cargoTypeSurcharge: number
  dieselPricePerLiter?: number
  estimatedKm: number
  fuelCost?: number
  fuelLiters?: number
  fuelPriceSource?: FreightFuelPriceSource
  kmRate: number
  loadingCost: number
  marginAmount?: number
  operationCost?: number
  operationCostPerKm?: number
  subtotal: number
  taxAmount: number
  tollCost?: number
  total: number
  unloadingCost: number
  waitingCost: number
}

export function FreightCostBreakdown({
  baseRate,
  cargoTypeSurcharge,
  dieselPricePerLiter,
  estimatedKm,
  fuelCost,
  fuelLiters,
  fuelPriceSource,
  kmRate,
  loadingCost,
  marginAmount,
  operationCost,
  operationCostPerKm,
  subtotal,
  taxAmount,
  tollCost,
  total,
  unloadingCost,
  waitingCost,
}: FreightCostBreakdownProps) {
  return (
    <dl className="detail-list">
      <div>
        <dt>Tarifa base</dt>
        <dd>{formatCurrency(baseRate)}</dd>
      </div>
      <div>
        <dt>Kilometraje</dt>
        <dd>{formatCurrency(estimatedKm * kmRate)}</dd>
      </div>
      {fuelCost !== undefined ? (
        <div>
          <dt>Petroleo</dt>
          <dd>
            {formatCurrency(fuelCost)}
            {fuelLiters ? ` (${fuelLiters.toLocaleString('es-CL')} L x ${formatCurrency(dieselPricePerLiter || 0)})` : ''}
            {fuelPriceSource ? (
              <small className="muted-text">
                {fuelPriceSource.status === 'OK' ? ` ${fuelPriceSource.source}` : ' Fallback local'}
                {fuelPriceSource.lastFetchedAt ? `, ${formatDate(fuelPriceSource.lastFetchedAt)}` : ''}
              </small>
            ) : null}
          </dd>
        </div>
      ) : null}
      {operationCost !== undefined ? (
        <div>
          <dt>Operacion km</dt>
          <dd>
            {formatCurrency(operationCost)}
            {operationCostPerKm ? ` (${formatCurrency(operationCostPerKm)} / km)` : ''}
          </dd>
        </div>
      ) : null}
      {tollCost !== undefined ? (
        <div>
          <dt>Peajes ruta</dt>
          <dd>{formatCurrency(tollCost)}</dd>
        </div>
      ) : null}
      <div>
        <dt>Recargo carga</dt>
        <dd>{formatCurrency(cargoTypeSurcharge)}</dd>
      </div>
      <div>
        <dt>Espera</dt>
        <dd>{formatCurrency(waitingCost)}</dd>
      </div>
      <div>
        <dt>Ayuda carga</dt>
        <dd>{formatCurrency(loadingCost)}</dd>
      </div>
      <div>
        <dt>Ayuda descarga</dt>
        <dd>{formatCurrency(unloadingCost)}</dd>
      </div>
      {marginAmount !== undefined ? (
        <div>
          <dt>Margen operacional</dt>
          <dd>{formatCurrency(marginAmount)}</dd>
        </div>
      ) : null}
      <div>
        <dt>Subtotal</dt>
        <dd>{formatCurrency(subtotal)}</dd>
      </div>
      <div>
        <dt>IVA</dt>
        <dd>{formatCurrency(taxAmount)}</dd>
      </div>
      <div>
        <dt>Total</dt>
        <dd>{formatCurrency(total)}</dd>
      </div>
    </dl>
  )
}
