import { Badge } from '../../../shared/components/Badge/Badge'
import { Card } from '../../../shared/components/Card/Card'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { InventoryCategoryReportRow, InventorySupplierReportRow } from '../services/inventoryOperations'
import styles from './InventoryModule.module.css'

interface InventoryReportPanelProps {
  report: {
    activeSuppliers: number
    blockedCases: number
    categories: InventoryCategoryReportRow[]
    locationsAtRisk: number
    movementCount: number
    openOrders: number
    pendingPurchaseAmount: number
    reorderSkus: number
    skus: number
    stockValue: number
    suppliers: InventorySupplierReportRow[]
    totalUnits: number
  }
}

export function InventoryReportPanel({ report }: InventoryReportPanelProps) {
  return (
    <Card className={styles.reportPanel}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>Reporte de inventario</h2>
          <p>Lectura ejecutiva de valor, quiebres, compras abiertas, proveedores y ubicaciones.</p>
        </div>
        <Badge tone={report.blockedCases > 0 || report.reorderSkus > 0 ? 'warning' : 'success'}>
          {report.blockedCases > 0 ? 'Requiere accion' : 'Controlado'}
        </Badge>
      </div>

      <div className={styles.reportGrid}>
        <ReportMetric label="Valor stock" value={formatCurrency(report.stockValue)} helper={`${report.totalUnits} unidades fisicas`} />
        <ReportMetric label="Compra pendiente" value={formatCurrency(report.pendingPurchaseAmount)} helper={`${report.openOrders} OC activas`} />
        <ReportMetric label="SKUs a reponer" value={report.reorderSkus} helper={`${report.skus} SKUs maestros`} />
        <ReportMetric label="Casos bloqueados" value={report.blockedCases} helper="por compra o recepcion" />
        <ReportMetric label="Ubicaciones riesgo" value={report.locationsAtRisk} helper="llenas o en mantencion" />
        <ReportMetric label="Proveedores activos" value={report.activeSuppliers} helper={`${report.movementCount} movimientos visibles`} />
      </div>

      <div className={styles.reportColumns}>
        <section className={styles.reportList}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Valor por categoria</h2>
              <p>Detecta donde esta concentrado el capital y el riesgo de quiebre.</p>
            </div>
          </div>
          {report.categories.slice(0, 6).map((category) => (
            <div className={styles.reportRow} key={category.category}>
              <div className={styles.rowMain}>
                <strong>{category.category}</strong>
                <span className={styles.rowMeta}>
                  {category.skus} SKUs - {category.lowStock} bajo minimo - {category.outOfStock} sin stock
                </span>
              </div>
              <div className={styles.reportValue}>
                <strong>{formatCurrency(category.stockValue)}</strong>
                <Badge tone={category.outOfStock > 0 ? 'danger' : category.lowStock > 0 ? 'warning' : 'success'}>
                  {category.outOfStock > 0 ? 'Quiebre' : category.lowStock > 0 ? 'Reponer' : 'OK'}
                </Badge>
              </div>
            </div>
          ))}
        </section>

        <section className={styles.reportList}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Compras por proveedor</h2>
              <p>Seguimiento de OC abiertas, monto y tiempo promedio de entrega.</p>
            </div>
          </div>
          {report.suppliers.slice(0, 6).map((supplier) => (
            <div className={styles.reportRow} key={supplier.supplierName}>
              <div className={styles.rowMain}>
                <strong>{supplier.supplierName}</strong>
                <span className={styles.rowMeta}>
                  {supplier.activeOrders} OC activas - {supplier.averageDeliveryDays} dias prom. - rating {supplier.rating}
                </span>
              </div>
              <div className={styles.reportValue}>
                <strong>{formatCurrency(supplier.amount)}</strong>
                <Badge tone={supplier.activeOrders > 0 ? 'info' : 'neutral'}>{supplier.activeOrders > 0 ? 'Seguimiento' : 'Sin OC'}</Badge>
              </div>
            </div>
          ))}
        </section>
      </div>
    </Card>
  )
}

interface ReportMetricProps {
  helper: string
  label: string
  value: number | string
}

function ReportMetric({ helper, label, value }: ReportMetricProps) {
  return (
    <div className={styles.reportMetric}>
      <small>{label}</small>
      <strong>{value}</strong>
      <span className={styles.muted}>{helper}</span>
    </div>
  )
}
