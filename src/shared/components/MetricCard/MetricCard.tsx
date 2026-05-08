import type { ReactNode } from 'react'
import { Card } from '../Card/Card'
import styles from './MetricCard.module.css'

interface MetricCardProps {
  label: string
  value: ReactNode
  helper?: string
  icon?: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}

export function MetricCard({ label, value, helper, icon, tone = 'neutral' }: MetricCardProps) {
  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <span>{label}</span>
        {icon ? <span className={[styles.icon, styles[tone]].join(' ')}>{icon}</span> : null}
      </div>
      <strong className={styles.value}>{value}</strong>
      {helper ? <small>{helper}</small> : null}
    </Card>
  )
}
