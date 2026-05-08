import { ROUTES } from '../../../config/routes'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type { TruckCostPeriodMode, TruckCostTruckAnalytics } from '../types/truckCosts.types'
import { TruckProfitabilityBadge } from './TruckProfitabilityBadge'
import styles from './TruckCostsModule.module.css'

interface TruckCostFleetTableProps {
  period: TruckCostPeriodMode
  trucks: TruckCostTruckAnalytics[]
}

export function TruckCostFleetTable({ period, trucks }: TruckCostFleetTableProps) {
  const columns: TableColumn<TruckCostTruckAnalytics>[] = [
    {
      header: 'Camion',
      key: 'truck',
      render: (item) => (
        <div className={styles.fleetCell}>
          <strong>{item.plate}</strong>
          <span>{item.truckLabel.replace(item.plate, '').replace(' - ', '') || item.truckId}</span>
        </div>
      ),
      searchableValue: (item) => `${item.plate} ${item.truckLabel}`,
    },
    {
      align: 'right',
      header: period === 'annual' ? 'Costo anual' : 'Costo mensual',
      key: 'totalCost',
      render: (item) => (
        <div className={styles.costValue}>
          <strong>{formatCurrency(item.totalCost)}</strong>
          <span>{period === 'annual' ? `${formatCurrency(item.monthlyCost)} / mes` : `${formatCurrency(item.annualCost)} anualizado`}</span>
        </div>
      ),
      sortValue: (item) => item.totalCost,
    },
    {
      align: 'right',
      header: 'Costo/km',
      key: 'costPerKm',
      render: (item) => (
        <div className={styles.costValue}>
          <strong>{item.km > 0 ? formatCurrency(item.costPerKm) : 'Sin km'}</strong>
          <span>{item.km > 0 ? `${item.km.toLocaleString('es-CL')} km` : 'Sin kilometraje conectado'}</span>
        </div>
      ),
      sortValue: (item) => item.costPerKm,
    },
    {
      header: 'Mayor impacto',
      key: 'topCategory',
      render: (item) => (
        <div className={styles.categoryPills}>
          {item.categories.slice(0, 3).map((category) => (
            <span className={styles.categoryPill} key={category.type}>
              {category.label}: {formatCurrency(category.amount)}
            </span>
          ))}
          {item.categories.length === 0 ? <span className="muted-text">Sin costos</span> : null}
        </div>
      ),
      searchableValue: (item) => item.categories.map((category) => category.label).join(' '),
      sortable: false,
    },
    {
      align: 'right',
      header: 'Margen fletes',
      key: 'netMargin',
      render: (item) => (
        <div className={styles.costValue}>
          <strong>{formatCurrency(item.netMargin)}</strong>
          <span>{item.freightCount} fletes</span>
        </div>
      ),
      sortValue: (item) => item.netMargin,
    },
    {
      header: 'Estado',
      key: 'status',
      render: (item) => (
        <div className={styles.fleetCell}>
          <TruckProfitabilityBadge status={item.profitabilityStatus} />
          <span>{item.lastCostAt ? `Ultimo costo ${formatDate(item.lastCostAt)}` : 'Sin movimiento'}</span>
        </div>
      ),
      searchableValue: (item) => item.profitabilityStatus,
    },
  ]

  return (
    <Table
      columns={columns}
      data={trucks}
      density="compact"
      enablePagination
      enableSearch
      getRowHref={(item) => ROUTES.truckCostDetail(item.truckId)}
      getRowKey={(item) => item.truckId}
      getRowLabel={(item) => `Abrir costos de ${item.plate}`}
      initialSort={{ direction: 'desc', key: 'totalCost' }}
      pageSize={10}
      searchPlaceholder="Buscar camion, categoria, estado o patente"
    />
  )
}
