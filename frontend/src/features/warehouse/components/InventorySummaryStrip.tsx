import styles from './InventoryModule.module.css'

export interface InventorySummaryItem {
  helper?: string
  label: string
  tone?: 'danger' | 'info' | 'neutral' | 'success' | 'warning'
  value: number | string
}

interface InventorySummaryStripProps {
  items: InventorySummaryItem[]
}

export function InventorySummaryStrip({ items }: InventorySummaryStripProps) {
  return (
    <div className={styles.inventorySummaryStrip}>
      {items.map((item) => (
        <div className={[styles.inventorySummaryItem, styles[item.tone || 'neutral']].join(' ')} key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.helper ? <small>{item.helper}</small> : null}
        </div>
      ))}
    </div>
  )
}
