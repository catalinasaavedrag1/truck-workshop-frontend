import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { EntityLink } from '../../../shared/components/EntityLink'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import {
  TIRE_REMOVAL_REASON_LABELS,
  TIRE_TYPE_LABELS,
  TIRE_USAGE_LABELS,
  getTireResult,
} from '../constants/tirePerformance.constants'
import type { TireLifecycle } from '../types/tirePerformance.types'
import { TirePositionBadge } from './TirePositionBadge'
import { TireProfitabilityBadge } from './TireProfitabilityBadge'
import { TireStatusBadge } from './TireStatusBadge'

interface TirePerformanceTableProps {
  isLoading?: boolean
  tires: TireLifecycle[]
}

function formatKm(value: number | undefined) {
  return value === undefined ? 'Pendiente' : `${value.toLocaleString('es-CL')} km`
}

function formatCostPerKm(value: number | undefined) {
  return value === undefined ? 'Pendiente' : `$${value.toFixed(2)}/km`
}

function formatOptionalDate(value: string | undefined) {
  return value ? formatDate(value) : 'Pendiente'
}

function getRecommendation(item: TireLifecycle) {
  const result = getTireResult(item)

  if (result === 'Excelente') return 'Priorizar compra'
  if (result === 'Bueno') return 'Mantener monitoreo'
  if (result === 'Regular') return 'Comparar proveedor'
  if (result === 'Malo') return 'Revisar contrato'
  if (result === 'Advertencia') return 'Corregir km'
  return 'Esperar retiro'
}

function getAction(item: TireLifecycle) {
  if (item.status === 'PURCHASED' || item.status === 'IN_STOCK') {
    return {
      label: 'Instalar',
      to: `${ROUTES.tirePerformanceInstall}?tireId=${item.id}`,
    }
  }

  if (item.status === 'INSTALLED') {
    return {
      label: 'Retirar',
      to: `${ROUTES.tirePerformanceRemove}?tireId=${item.id}`,
    }
  }

  return {
    label: 'Comparar',
    to: ROUTES.tirePerformanceComparison,
  }
}

export function TirePerformanceTable({ isLoading, tires }: TirePerformanceTableProps) {
  const columns: TableColumn<TireLifecycle>[] = [
    {
      header: 'Neumatico',
      key: 'sku',
      render: (item) => (
        <div>
          <EntityLink id={item.skuId} type="part">
            {item.skuCode}
          </EntityLink>
          <p className="muted-text">
            {item.brand} {item.model || item.tireSize}
          </p>
        </div>
      ),
      searchableValue: (item) => `${item.skuCode} ${item.skuName} ${item.brand} ${item.model || ''}`,
    },
    {
      header: 'Etapa',
      key: 'status',
      render: (item) => (
        <div className="stack-tight">
          <TireStatusBadge status={item.status} />
          <TireProfitabilityBadge result={getTireResult(item)} />
        </div>
      ),
      searchableValue: (item) => `${item.status} ${getTireResult(item)}`,
    },
    {
      header: 'Camion / posicion',
      key: 'truckPlate',
      render: (item) => (
        <div>
          {item.truckId ? (
            <EntityLink id={item.truckId} type="truck">
              {item.truckPlate || item.truckId}
            </EntityLink>
          ) : (
            <strong>En bodega</strong>
          )}
          <p className="muted-text">
            {TIRE_TYPE_LABELS[item.tireType]} - {TIRE_USAGE_LABELS[item.usageType]}
          </p>
          <TirePositionBadge position={item.tirePosition} />
        </div>
      ),
      searchableValue: (item) => `${item.truckPlate || ''} ${item.tirePosition || ''} ${item.tireType} ${item.usageType}`,
    },
    {
      header: 'Compra',
      key: 'purchaseDate',
      render: (item) => (
        <div>
          <strong>{formatCurrency(item.purchaseCost)}</strong>
          <p className="muted-text">
            {item.supplierId ? (
              <EntityLink id={item.supplierId} type="supplier" variant="subtle">
                {item.supplierName}
              </EntityLink>
            ) : (
              item.supplierName
            )}
          </p>
          <p className="muted-text">{formatDate(item.purchaseDate)}</p>
        </div>
      ),
      sortValue: (item) => new Date(item.purchaseDate),
    },
    {
      header: 'Instalacion',
      key: 'installedAt',
      render: (item) => (
        <div>
          <strong>{formatOptionalDate(item.installedAt)}</strong>
          <p className="muted-text">{formatKm(item.odometerAtInstall)}</p>
        </div>
      ),
      sortValue: (item) => (item.installedAt ? new Date(item.installedAt) : undefined),
    },
    {
      header: 'Retiro',
      key: 'removedAt',
      render: (item) => (
        <div>
          <strong>{formatOptionalDate(item.removedAt)}</strong>
          <p className="muted-text">{formatKm(item.odometerAtRemoval)}</p>
          <p className="muted-text">
            {item.removalReason ? TIRE_REMOVAL_REASON_LABELS[item.removalReason] : 'Sin motivo'}
          </p>
        </div>
      ),
      sortValue: (item) => (item.removedAt ? new Date(item.removedAt) : undefined),
    },
    {
      align: 'right',
      header: 'Rendimiento',
      key: 'costPerKm',
      render: (item) => (
        <div>
          <strong>{formatCostPerKm(item.costPerKm)}</strong>
          <p className="muted-text">{formatKm(item.kmUsed)}</p>
        </div>
      ),
      sortValue: (item) => item.costPerKm,
    },
    {
      header: 'Siguiente accion',
      key: 'recommendation',
      render: (item) => <strong>{getRecommendation(item)}</strong>,
      searchableValue: (item) => getRecommendation(item),
    },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => {
        const action = getAction(item)

        return (
          <Link className="text-link" to={action.to}>
            {action.label}
          </Link>
        )
      },
      sortable: false,
    },
  ]

  return (
    <Table
      columns={columns}
      data={tires}
      density="compact"
      enableSearch
      emptyDescription="Prueba con otro proveedor, marca, estado o rango de fechas."
      emptyLabel="No hay neumaticos con estos filtros"
      getRowKey={(item) => item.id}
      getSearchText={(item) =>
        `${item.skuCode} ${item.skuName} ${item.brand} ${item.model || ''} ${item.supplierName} ${item.truckPlate || ''}`
      }
      isLoading={isLoading}
      pageSize={10}
      searchPlaceholder="Buscar SKU, marca, proveedor, camion, posicion o resultado"
    />
  )
}
