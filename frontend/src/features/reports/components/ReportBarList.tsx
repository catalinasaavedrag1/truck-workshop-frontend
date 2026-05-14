import type { ReportBarItem } from '../types/report.types'
import styles from './ReportBarList.module.css'

interface ReportBarListProps {
  items: ReportBarItem[]
  valueSuffix?: string
}

export function ReportBarList({ items, valueSuffix = '' }: ReportBarListProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1)

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <div className={styles.row} key={item.id}>
          <div className={styles.label}>
            <strong>{item.label}</strong>
            {item.helper ? <small>{item.helper}</small> : null}
          </div>
          <div aria-label={`${item.label}: ${item.value}${valueSuffix}`} className={styles.track} role="img">
            <span
              className={[styles.bar, styles[item.tone || 'neutral']].join(' ')}
              style={{ width: `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 7 : 0)}%` }}
            />
          </div>
          <span className={styles.value}>
            {item.value}
            {valueSuffix}
          </span>
        </div>
      ))}
    </div>
  )
}
