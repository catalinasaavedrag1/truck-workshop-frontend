import { Card } from '../../../shared/components/Card/Card'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { TruckCostCategorySummary } from '../types/truckCosts.types'
import styles from './TruckCostsModule.module.css'

interface TruckCostCategoryBreakdownProps {
  categories: TruckCostCategorySummary[]
  title?: string
}

export function TruckCostCategoryBreakdown({ categories, title = 'Costos por categoria' }: TruckCostCategoryBreakdownProps) {
  const total = categories.reduce((sum, category) => sum + category.amount, 0)

  return (
    <Card className={styles.breakdownPanel}>
      <div className={styles.breakdownHeader}>
        <div>
          <h2>{title}</h2>
          <p className="muted-text">Ordenado por impacto real en el periodo.</p>
        </div>
        <strong>{formatCurrency(total)}</strong>
      </div>
      <div className={styles.categoryRows}>
        {categories.length > 0 ? (
          categories.map((category) => (
            <div className={styles.categoryRow} key={category.type}>
              <div className={styles.categoryLabel}>
                <strong>{category.label}</strong>
                <span>{category.percent.toFixed(1)}% del costo</span>
              </div>
              <div className={styles.bar} aria-hidden>
                <span style={{ width: `${Math.min(category.percent, 100)}%` }} />
              </div>
              <strong className={styles.categoryAmount}>{formatCurrency(category.amount)}</strong>
            </div>
          ))
        ) : (
          <p className="muted-text">Sin costos para este periodo.</p>
        )}
      </div>
    </Card>
  )
}
