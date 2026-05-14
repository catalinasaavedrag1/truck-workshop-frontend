import { Link } from 'react-router-dom'
import type { ProcurementKpi } from '../types/procurement.types'
import styles from './InventoryModule.module.css'

interface OperationalKpiCardProps {
  kpi: ProcurementKpi
}

export function OperationalKpiCard({ kpi }: OperationalKpiCardProps) {
  const content = (
    <>
      <span>{kpi.label}</span>
      <strong>{kpi.value}</strong>
      <small>{kpi.helper}</small>
    </>
  )

  if (kpi.href) {
    return (
      <Link className={[styles.operationalKpi, styles[kpi.tone]].join(' ')} to={kpi.href}>
        {content}
      </Link>
    )
  }

  return <div className={[styles.operationalKpi, styles[kpi.tone]].join(' ')}>{content}</div>
}
