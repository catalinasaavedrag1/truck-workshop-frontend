import { Badge } from '../../../shared/components/Badge/Badge'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { SupplierInvoiceItem } from '../types/supplierInvoice.types'
import { reconcileInvoice } from '../utils/reconciliation'
import styles from './PurchaseInvoiceModule.module.css'

interface ReconciliationPanelProps {
  items: SupplierInvoiceItem[]
}

/** Conciliacion 3-way: OC (ordenado) vs Recepcion (recibido) vs Factura (facturado). */
export function ReconciliationPanel({ items }: ReconciliationPanelProps) {
  const result = reconcileInvoice(items)

  return (
    <div className="stack">
      <div className={styles.reconSummary}>
        <Badge tone={result.hasDifference ? 'danger' : 'success'}>
          {result.hasDifference ? 'Conciliacion con diferencias' : 'Conciliacion sin diferencias'}
        </Badge>
        <span className="muted-text">OC + Recepcion + Factura</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className={styles.reconTable}>
          <thead>
            <tr>
              <th>Item</th>
              <th>OC</th>
              <th>Recibido</th>
              <th>Facturado</th>
              <th>Precio unit.</th>
              <th>Monto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {result.lines.map((line) => (
              <tr key={line.sku}>
                <td>
                  <strong>{line.name}</strong>
                  <div className="muted-text">{line.sku}</div>
                </td>
                <td>{line.orderedQuantity}</td>
                <td>{line.receivedQuantity}</td>
                <td>{line.invoicedQuantity}</td>
                <td>{formatCurrency(line.unitPrice)}</td>
                <td>{formatCurrency(line.amount)}</td>
                <td className={line.quantityMatch ? styles.matchOk : styles.matchDiff}>
                  {line.quantityMatch ? 'OK' : 'Diferencia'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5}>Neto</td>
              <td>{formatCurrency(result.net)}</td>
              <td />
            </tr>
            <tr>
              <td colSpan={5}>IVA (19%)</td>
              <td>{formatCurrency(result.tax)}</td>
              <td />
            </tr>
            <tr>
              <td colSpan={5}>Total</td>
              <td>{formatCurrency(result.total)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
