import type { CSSProperties } from 'react'
import { Card } from '../../../shared/components/Card/Card'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { FreightProfitability } from '../types/freightProfitability.types'
import { FreightMarginBadge } from './FreightMarginBadge'
import styles from './FreightProfitability.module.css'

interface FreightCostBreakdownProps {
  item: FreightProfitability
}

export function FreightCostBreakdown({ item }: FreightCostBreakdownProps) {
  const rows = [
    ['Combustible', item.fuelCost],
    ['Peajes', item.tollCost],
    ['Chofer', item.driverCost],
    ['Neumaticos', item.tireWearCost],
    ['Mantencion', item.maintenanceAllocatedCost],
    ['Otros', item.otherCosts],
  ] as const
  const maxCost = Math.max(...rows.map(([, value]) => value), 1)

  return (
    <Card className={styles.breakdownPanel}>
      <div className={styles.breakdownHeader}>
        <div>
          <h2>Desglose {item.freightId}</h2>
          <p>{item.customerName} - {item.km} km - {formatCurrency(item.revenuePerKm)}/km ingreso</p>
        </div>
        <FreightMarginBadge marginPercentage={item.marginPercentage} />
      </div>
      <div className={styles.breakdownKpis}>
        <span className={styles.breakdownKpi}>
          <small>Ingreso</small>
          <strong>{formatCurrency(item.revenue)}</strong>
        </span>
        <span className={styles.breakdownKpi}>
          <small>Costo total</small>
          <strong>{formatCurrency(item.totalCost)}</strong>
        </span>
        <span className={styles.breakdownKpi}>
          <small>Margen neto</small>
          <strong>{formatCurrency(item.netMargin)}</strong>
        </span>
      </div>
      <div className={styles.breakdownList}>
        {rows.map(([label, value]) => {
          const width = `${Math.max(4, (value / maxCost) * 100)}%`

          return (
            <div className={styles.breakdownRow} key={label}>
              <div className={styles.breakdownTop}>
                <span>{label}</span>
                <strong>{formatCurrency(value)}</strong>
              </div>
              <div className={styles.breakdownBar} aria-hidden>
                <span style={{ width } as CSSProperties} />
              </div>
            </div>
          )
        })}
      </div>
      <div className={styles.comparison}>
        <span className={styles.comparisonItem}>
          <small>Costo por km</small>
          <strong>{formatCurrency(item.costPerKm)}</strong>
        </span>
        <span className={styles.comparisonItem}>
          <small>Margen sobre ingreso</small>
          <strong>{item.marginPercentage.toFixed(1)}%</strong>
        </span>
      </div>
    </Card>
  )
}
