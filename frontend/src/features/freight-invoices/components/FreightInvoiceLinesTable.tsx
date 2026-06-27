import { Badge } from '../../../shared/components/Badge/Badge'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type { FreightInvoiceLine } from '../types/freightInvoice.types'
import { computeFreightInvoiceTotals } from '../utils/freightInvoiceTotals'
import styles from './FreightInvoiceModule.module.css'

interface FreightInvoiceLinesTableProps {
  lines: FreightInvoiceLine[]
}

export function FreightInvoiceLinesTable({ lines }: FreightInvoiceLinesTableProps) {
  const totals = computeFreightInvoiceTotals(lines)

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className={styles.linesTable}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Servicio</th>
            <th>Referencia</th>
            <th>Tipo</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr key={`${line.reference || line.description}-${index}`}>
              <td>{formatDate(line.date)}</td>
              <td>{line.description}</td>
              <td>{line.reference || '-'}</td>
              <td>
                <Badge tone={line.kind === 'FREIGHT' ? 'info' : 'neutral'}>
                  {line.kind === 'FREIGHT' ? 'Flete' : 'Adicional'}
                </Badge>
              </td>
              <td>{formatCurrency(line.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}>Neto</td>
            <td>{formatCurrency(totals.net)}</td>
          </tr>
          <tr>
            <td colSpan={4}>IVA (19%)</td>
            <td>{formatCurrency(totals.tax)}</td>
          </tr>
          <tr>
            <td colSpan={4}>Total factura</td>
            <td>{formatCurrency(totals.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
