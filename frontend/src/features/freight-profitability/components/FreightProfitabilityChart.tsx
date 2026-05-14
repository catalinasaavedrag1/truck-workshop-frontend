import type { CSSProperties } from 'react'
import { Card } from '../../../shared/components/Card/Card'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { FreightProfitability } from '../types/freightProfitability.types'
import { FreightMarginBadge } from './FreightMarginBadge'
import styles from './FreightProfitability.module.css'

interface FreightProfitabilityChartProps {
  items: FreightProfitability[]
  onSelect?: (itemId: string) => void
  selectedId?: string
}

export function FreightProfitabilityChart({ items, onSelect, selectedId }: FreightProfitabilityChartProps) {
  const visibleItems = [...items]
    .sort((first, second) => second.netMargin - first.netMargin)
    .slice(0, 6)

  return (
    <Card className={styles.chartPanel}>
      <div className={styles.chartHeader}>
        <div>
          <h2>Ranking operativo de rentabilidad</h2>
          <p>Compara cuanto del ingreso se consume en costos y cuanto queda como margen neto.</p>
        </div>
        <div className={styles.legend} aria-label="Leyenda de composicion del ingreso">
          <span className={styles.legendCost}>Costo</span>
          <span className={styles.legendMargin}>Margen</span>
        </div>
      </div>
      <div className={styles.chartRows}>
        {visibleItems.map((item) => {
          const safeRevenue = Math.max(item.revenue, 1)
          const costShare = Math.min(100, Math.max(0, (item.totalCost / safeRevenue) * 100))
          const marginShare = Math.max(0, 100 - costShare)
          const rowStyle = {
            '--cost-share': `${costShare}%`,
            '--margin-share': `${marginShare}%`,
          } as CSSProperties

          return (
            <button
              className={[styles.chartRow, selectedId === item.id ? styles.chartRowActive : '']
                .filter(Boolean)
                .join(' ')}
              key={item.id}
              onClick={() => onSelect?.(item.id)}
              type="button"
            >
              <span className={styles.rowTitle}>
                <strong>{item.freightId}</strong>
                <span>{item.customerName}</span>
              </span>
              <span className={styles.barArea}>
                <span className={styles.barTrack} style={rowStyle}>
                  <span className={styles.costSegment} style={{ width: 'var(--cost-share)' }} />
                  {marginShare > 0 ? (
                    <span className={styles.marginSegment} style={{ width: 'var(--margin-share)' }} />
                  ) : (
                    <span className={styles.negativeSegment} style={{ width: '4%' }} />
                  )}
                </span>
                <span className={styles.rowMeta}>
                  <span>{formatCurrency(item.revenue)} ingreso</span>
                  <span>{formatCurrency(item.totalCost)} costo</span>
                </span>
              </span>
              <span className={styles.marginValue}>
                <strong>{formatCurrency(item.netMargin)}</strong>
                <FreightMarginBadge marginPercentage={item.marginPercentage} />
              </span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
