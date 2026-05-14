import { Pencil, Trash2 } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { DriverTripSheetStatusBadge } from './DriverTripSheetStatusBadge'
import type { DriverTripSheet } from '../types/driverTripSheet.types'
import styles from './DriverTripSheets.module.css'

interface DriverTripSheetTableProps {
  isLoading?: boolean
  onDelete: (sheet: DriverTripSheet) => void
  onEdit: (sheet: DriverTripSheet) => void
  sheets: DriverTripSheet[]
}

export function DriverTripSheetTable({ isLoading, onDelete, onEdit, sheets }: DriverTripSheetTableProps) {
  const columns: TableColumn<DriverTripSheet>[] = [
    {
      header: 'Planilla / viaje',
      key: 'sheetNumber',
      render: (item) => (
        <div className={styles.routeCell}>
          <strong>{item.sheetNumber}</strong>
          <span>{item.customerName || 'Sin cliente asociado'}</span>
          <span>{item.requestId || item.freightId || 'Sin flete'}</span>
        </div>
      ),
    },
    {
      header: 'Chofer / camion',
      key: 'driverName',
      render: (item) => (
        <div className={styles.driverCell}>
          <strong>{item.driverName}</strong>
          <span>{item.truckPlate}</span>
        </div>
      ),
      searchableValue: (item) => `${item.driverName} ${item.truckPlate}`,
    },
    {
      header: 'Ruta',
      key: 'originAddress',
      render: (item) => (
        <div className={styles.routeCell}>
          <strong>{item.originAddress || 'Origen pendiente'}</strong>
          <span>{item.destinationAddress || 'Destino pendiente'}</span>
        </div>
      ),
      searchableValue: (item) => `${item.originAddress} ${item.destinationAddress}`,
    },
    {
      align: 'right',
      header: 'Fecha',
      key: 'tripDate',
      render: (item) => formatDate(item.tripDate),
      sortValue: (item) => new Date(item.tripDate),
    },
    {
      align: 'right',
      header: 'Km',
      key: 'kmReal',
      render: (item) => `${formatNumber(item.kmReal)} / ${formatNumber(item.kmPlanned)} km`,
      sortValue: (item) => item.kmReal,
    },
    {
      align: 'right',
      header: 'Gastos clave',
      key: 'totalExpenses',
      render: (item) => (
        <div className={styles.expenseGrid}>
          <div className={styles.expenseItem}>
            <span>Peajes</span>
            <strong>{formatCurrency(item.tollCost)}</strong>
          </div>
          <div className={styles.expenseItem}>
            <span>Comida</span>
            <strong>{formatCurrency(item.mealCost)}</strong>
          </div>
          <div className={styles.expenseItem}>
            <span>Espera</span>
            <strong>{formatCurrency(item.waitingCost)}</strong>
          </div>
          <div className={styles.expenseItem}>
            <span>Total</span>
            <strong>{formatCurrency(item.totalExpenses)}</strong>
          </div>
        </div>
      ),
      sortValue: (item) => item.totalExpenses,
    },
    {
      align: 'right',
      header: 'Margen',
      key: 'netMargin',
      render: (item) => (
        <div>
          <strong>{formatCurrency(item.netMargin)}</strong>
          <p className="muted-text">{formatCurrency(item.costPerKm)}/km</p>
        </div>
      ),
      sortValue: (item) => item.netMargin,
    },
    {
      align: 'right',
      header: 'Score',
      key: 'performanceScore',
      render: (item) => <span className={[styles.scoreBadge, scoreClass(item.performanceScore)].join(' ')}>{item.performanceScore}</span>,
      sortValue: (item) => item.performanceScore,
    },
    { align: 'right', header: 'Estado', key: 'status', render: (item) => <DriverTripSheetStatusBadge status={item.status} /> },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <div className="inline-actions" data-row-click-ignore>
          <Button aria-label={`Editar ${item.sheetNumber}`} icon={<Pencil size={15} />} onClick={() => onEdit(item)} size="sm" type="button" variant="secondary" />
          <Button aria-label={`Eliminar ${item.sheetNumber}`} icon={<Trash2 size={15} />} onClick={() => onDelete(item)} size="sm" type="button" variant="danger" />
        </div>
      ),
      sortable: false,
    },
  ]

  return (
    <Table
      columns={columns}
      data={sheets}
      density="compact"
      emptyDescription="Crea una planilla desde un viaje para comparar ingresos, peajes, viaticos y espera."
      emptyLabel="Sin planillas de choferes"
      enablePagination
      getRowHref={(item) => (item.requestId ? ROUTES.freightRequestDetail(item.requestId) : undefined)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir flete asociado a ${item.sheetNumber}`}
      initialSort={{ direction: 'desc', key: 'tripDate' }}
      isLoading={isLoading}
      loadingLabel="Cargando planillas"
    />
  )
}

function scoreClass(score: number) {
  if (score >= 85) {
    return styles.scoreGood
  }

  if (score >= 70) {
    return styles.scoreWarning
  }

  return styles.scoreDanger
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(value)
}
