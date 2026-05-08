import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { documentStatusLabels } from '../../truck-documents/constants/truckDocuments.constants'
import type {
  DriverTripSheetPerformanceRow,
  FleetRiskRow,
  FreightProfitabilityReportRow,
  FuelDeviationReportRow,
  PurchaseInventoryRow,
  TechnicalInspectionExpirationRow,
  TireEconomicsRow,
} from '../types/report.types'

function formatNumber(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat('es-CL', { maximumFractionDigits }).format(value)
}

function riskTone(value: string): BadgeTone {
  if (['CRITICAL', 'OVERDUE', 'EXPIRED', 'MISSING', 'BLOCKED'].includes(value)) {
    return 'danger'
  }

  if (['WARNING', 'EXPIRES_SOON_15', 'EXPIRES_SOON_30', 'low-stock', 'out-of-stock'].includes(value)) {
    return 'warning'
  }

  return 'success'
}

function marginTone(value: number): BadgeTone {
  if (value >= 28) {
    return 'success'
  }

  if (value >= 20) {
    return 'warning'
  }

  return 'danger'
}

function scoreTone(value: number): BadgeTone {
  if (value >= 85) {
    return 'success'
  }

  if (value >= 70) {
    return 'warning'
  }

  return 'danger'
}

function priorityTone(value: TechnicalInspectionExpirationRow['priority']): BadgeTone {
  if (value === 'blocked') {
    return 'danger'
  }

  if (value === 'urgent' || value === 'warning') {
    return 'warning'
  }

  return 'info'
}

function priorityLabel(value: TechnicalInspectionExpirationRow['priority']) {
  const labels = {
    blocked: 'Bloquea despacho',
    planned: 'Planificado',
    urgent: 'Urgente',
    warning: 'Coordinar',
  }

  return labels[value]
}

function formatExpirationDays(value: number | null) {
  if (value === null) {
    return 'Sin fecha'
  }

  if (value < 0) {
    return `${Math.abs(value)} dias vencido`
  }

  if (value === 0) {
    return 'Vence hoy'
  }

  return `${value} dias`
}

export function FleetRiskReport({ rows }: { rows: FleetRiskRow[] }) {
  const columns: TableColumn<FleetRiskRow>[] = [
    {
      header: 'Camion',
      key: 'plate',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.plate}</strong>
          <span className="muted-text">{item.model}</span>
        </div>
      ),
    },
    { header: 'Estado', key: 'status', render: (item) => item.status },
    {
      align: 'right',
      header: 'Health',
      key: 'healthScore',
      render: (item) => (
        <Badge tone={item.healthScore >= 85 ? 'success' : item.healthScore >= 70 ? 'warning' : 'danger'}>
          {item.healthScore}/100
        </Badge>
      ),
    },
    {
      align: 'right',
      header: 'Doc.',
      key: 'documentRisk',
      render: (item) => <Badge tone={riskTone(item.documentRisk)}>{item.documentRisk}</Badge>,
    },
    {
      align: 'right',
      header: 'Mant.',
      key: 'maintenanceRisk',
      render: (item) => <Badge tone={riskTone(item.maintenanceRisk)}>{item.maintenanceRisk}</Badge>,
    },
    {
      align: 'right',
      header: 'Costo/km',
      key: 'costPerKm',
      render: (item) => (item.costPerKm ? formatCurrency(item.costPerKm) : 'Sin dato'),
    },
    { header: 'Bloqueo principal', key: 'blocker', render: (item) => <span className="muted-text">{item.blocker}</span> },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch
      getRowHref={(item) => ROUTES.fleetTruckDetail(item.truckId)}
      getRowKey={(item) => item.truckId}
      getRowLabel={(item) => `Abrir ficha de flota ${item.plate}`}
      searchPlaceholder="Buscar camion, estado, riesgo, costo o bloqueo"
    />
  )
}

export function TechnicalInspectionExpirationReport({
  isLoading = false,
  rows,
}: {
  isLoading?: boolean
  rows: TechnicalInspectionExpirationRow[]
}) {
  const columns: TableColumn<TechnicalInspectionExpirationRow>[] = [
    {
      header: 'Unidad',
      key: 'plate',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.plate}</strong>
          <span className="muted-text">{item.model}</span>
        </div>
      ),
    },
    {
      header: 'Vencimiento',
      key: 'expiresAt',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.expiresAt ? formatDate(item.expiresAt) : 'Sin fecha cargada'}</strong>
          <span className="muted-text">{formatExpirationDays(item.daysUntilExpiration)}</span>
        </div>
      ),
      sortValue: (item) => item.daysUntilExpiration ?? -9999,
    },
    {
      align: 'right',
      header: 'Estado',
      key: 'status',
      render: (item) => <Badge tone={riskTone(item.status)}>{documentStatusLabels[item.status as keyof typeof documentStatusLabels] || item.status}</Badge>,
    },
    {
      align: 'right',
      header: 'Prioridad',
      key: 'priority',
      render: (item) => <Badge tone={priorityTone(item.priority)}>{priorityLabel(item.priority)}</Badge>,
    },
    {
      header: 'Responsable',
      key: 'assignedDriverName',
      render: (item) => item.assignedDriverName || 'Sin chofer asignado',
    },
    {
      header: 'Accion sugerida',
      key: 'recommendedAction',
      render: (item) => <span className="muted-text">{item.recommendedAction}</span>,
    },
    {
      header: 'Documento',
      key: 'documentNumber',
      render: (item) => item.documentNumber || 'No cargado',
    },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch
      emptyDescription="No hay revisiones tecnicas vencidas, faltantes ni proximas al horizonte seleccionado."
      getRowHref={(item) => item.documentId ? ROUTES.truckDocumentDetail(item.documentId) : ROUTES.fleetTruckDetail(item.truckId)}
      getRowKey={(item) => `${item.truckId}-${item.documentId || 'missing'}`}
      getRowLabel={(item) => `Abrir revision tecnica de ${item.plate}`}
      initialSort={{ direction: 'asc', key: 'expiresAt' }}
      isLoading={isLoading}
      loadingLabel="Cargando vencimientos"
      searchPlaceholder="Buscar patente, chofer, estado, documento o accion"
    />
  )
}

export function PurchaseInventoryReport({ rows }: { rows: PurchaseInventoryRow[] }) {
  const columns: TableColumn<PurchaseInventoryRow>[] = [
    {
      header: 'SKU',
      key: 'sku',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.sku}</strong>
          <span className="muted-text">{item.name}</span>
        </div>
      ),
    },
    { align: 'right', header: 'Stock', key: 'stock', render: (item) => `${item.stock}/${item.minStock}` },
    { align: 'right', header: 'Estado', key: 'status', render: (item) => <Badge tone={riskTone(item.status)}>{item.status}</Badge> },
    { header: 'OC activa', key: 'activePurchaseOrder', render: (item) => item.activePurchaseOrder || 'Sin OC' },
    { align: 'right', header: 'Casos', key: 'activeCases', render: (item) => item.activeCases },
    { align: 'right', header: 'Monto', key: 'estimatedAmount', render: (item) => formatCurrency(item.estimatedAmount) },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch
      emptyDescription="No hay SKUs bajo minimo ni sin stock."
      getRowKey={(item) => item.sku}
      searchPlaceholder="Buscar SKU, repuesto, OC, estado o casos"
    />
  )
}

export function FreightProfitabilityReport({ rows }: { rows: FreightProfitabilityReportRow[] }) {
  const columns: TableColumn<FreightProfitabilityReportRow>[] = [
    {
      header: 'Flete',
      key: 'freightId',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.customerName}</strong>
          <span className="muted-text">
            {item.freightId} · {item.truckPlate}
          </span>
        </div>
      ),
    },
    { align: 'right', header: 'Ingreso', key: 'revenue', render: (item) => formatCurrency(item.revenue) },
    { align: 'right', header: 'Costo', key: 'totalCost', render: (item) => formatCurrency(item.totalCost) },
    { align: 'right', header: 'Margen', key: 'grossMargin', render: (item) => formatCurrency(item.grossMargin) },
    {
      align: 'right',
      header: '% margen',
      key: 'marginPercentage',
      render: (item) => <Badge tone={marginTone(item.marginPercentage)}>{formatNumber(item.marginPercentage)}%</Badge>,
    },
    { align: 'right', header: 'Km', key: 'km', render: (item) => `${formatNumber(item.km, 0)} km` },
    { align: 'right', header: 'Costo/km', key: 'costPerKm', render: (item) => formatCurrency(item.costPerKm) },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch
      getRowKey={(item) => item.freightId}
      searchPlaceholder="Buscar cliente, flete, camion, margen o costo"
    />
  )
}

export function DriverTripSheetPerformanceReport({
  isLoading = false,
  rows,
}: {
  isLoading?: boolean
  rows: DriverTripSheetPerformanceRow[]
}) {
  const columns: TableColumn<DriverTripSheetPerformanceRow>[] = [
    {
      header: 'Chofer',
      key: 'driverName',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.driverName}</strong>
          <span className="muted-text">{item.sheets} planillas rendidas</span>
        </div>
      ),
    },
    { align: 'right', header: 'Ingreso', key: 'revenue', render: (item) => formatCurrency(item.revenue) },
    { align: 'right', header: 'Gastos', key: 'totalExpenses', render: (item) => formatCurrency(item.totalExpenses) },
    {
      align: 'right',
      header: 'Margen',
      key: 'netMargin',
      render: (item) => (
        <div>
          <strong>{formatCurrency(item.netMargin)}</strong>
          <p className="muted-text">{formatNumber(item.marginPercentage)}%</p>
        </div>
      ),
      sortValue: (item) => item.netMargin,
    },
    {
      align: 'right',
      header: 'Gastos ruta',
      key: 'tollCost',
      render: (item) => (
        <div>
          <strong>{formatCurrency(item.tollCost)}</strong>
          <p className="muted-text">Peajes</p>
        </div>
      ),
      sortValue: (item) => item.tollCost,
    },
    {
      align: 'right',
      header: 'Viaticos',
      key: 'tipCost',
      render: (item) => formatCurrency(item.tipCost + item.parkingCost),
      sortValue: (item) => item.tipCost + item.parkingCost,
    },
    { align: 'right', header: 'Espera', key: 'waitingHours', render: (item) => `${formatNumber(item.waitingHours)} h` },
    { align: 'right', header: 'Costo/km', key: 'averageCostPerKm', render: (item) => formatCurrency(item.averageCostPerKm) },
    {
      align: 'right',
      header: 'Score',
      key: 'performanceScore',
      render: (item) => <Badge tone={scoreTone(item.performanceScore)}>{item.performanceScore}/100</Badge>,
    },
    {
      align: 'right',
      header: 'Revision',
      key: 'submittedSheets',
      render: (item) => (
        <span className="muted-text">
          {item.submittedSheets} rev. / {item.approvedSheets + item.paidSheets} ok
        </span>
      ),
      sortValue: (item) => item.submittedSheets,
    },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch
      emptyDescription="No hay planillas de choferes para reportar."
      getRowHref={(item) => ROUTES.driverDetail(item.driverId)}
      getRowKey={(item) => item.driverId}
      getRowLabel={(item) => `Abrir ficha de chofer ${item.driverName}`}
      initialSort={{ direction: 'desc', key: 'netMargin' }}
      isLoading={isLoading}
      loadingLabel="Cargando rendimiento de choferes"
      searchPlaceholder="Buscar chofer, margen, peajes, espera o score"
    />
  )
}

export function FuelDeviationReport({ rows }: { rows: FuelDeviationReportRow[] }) {
  const columns: TableColumn<FuelDeviationReportRow>[] = [
    {
      header: 'Unidad',
      key: 'truckPlate',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.truckPlate}</strong>
          <span className="muted-text">{item.driverName}</span>
        </div>
      ),
    },
    { align: 'right', header: 'Litros', key: 'liters', render: (item) => `${formatNumber(item.liters, 0)} l` },
    { align: 'right', header: 'Gasto', key: 'totalAmount', render: (item) => formatCurrency(item.totalAmount) },
    { align: 'right', header: 'Km/l', key: 'kmPerLiter', render: (item) => `${formatNumber(item.kmPerLiter)} km/l` },
    {
      align: 'right',
      header: 'Desviacion',
      key: 'deviationStatus',
      render: (item) => (
        <Badge tone={item.deviationStatus === 'SUSPICIOUS' ? 'danger' : item.deviationStatus === 'WARNING' ? 'warning' : 'success'}>
          {item.deviationStatus}
        </Badge>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch
      getRowKey={(item) => item.id}
      searchPlaceholder="Buscar unidad, chofer, litros, gasto o desviacion"
    />
  )
}

export function TireEconomicsReport({ rows }: { rows: TireEconomicsRow[] }) {
  const columns: TableColumn<TireEconomicsRow>[] = [
    { header: 'Tipo', key: 'tireType', render: (item) => <strong>{item.tireType}</strong> },
    { align: 'right', header: 'Compra prom.', key: 'averagePurchaseCost', render: (item) => formatCurrency(item.averagePurchaseCost) },
    { align: 'right', header: 'Km prom.', key: 'averageKmUsed', render: (item) => `${formatNumber(item.averageKmUsed, 0)} km` },
    {
      align: 'right',
      header: 'Costo/km',
      key: 'averageCostPerKm',
      render: (item) => <Badge tone={item.averageCostPerKm <= 1 ? 'success' : item.averageCostPerKm <= 2 ? 'warning' : 'danger'}>${formatNumber(item.averageCostPerKm)}/km</Badge>,
    },
    { header: 'Proveedor rentable', key: 'bestSupplier', render: (item) => item.bestSupplier },
    { align: 'right', header: 'Instalados', key: 'installed', render: (item) => item.installed },
    { align: 'right', header: 'Muestra', key: 'sampleSize', render: (item) => item.sampleSize },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch
      getRowKey={(item) => item.tireType}
      searchPlaceholder="Buscar tipo, proveedor, costo/km o muestra"
    />
  )
}
