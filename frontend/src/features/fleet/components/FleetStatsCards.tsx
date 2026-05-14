import {
  Activity,
  Ban,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  FileWarning,
  Route,
  TriangleAlert,
  Truck,
  Wrench,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from '../../../shared/components/Card/Card'
import type { FleetMetric } from '../types/fleet.types'
import styles from './FleetStatsCards.module.css'

interface FleetStatsCardsProps {
  metrics: FleetMetric[]
}

const metricMeta: Record<
  string,
  {
    icon: ReactNode
    tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
    wide?: boolean
  }
> = {
  Bloqueados: { icon: <Ban aria-hidden size={18} />, tone: 'danger' },
  'Costo mensual flota': { icon: <CircleDollarSign aria-hidden size={18} />, tone: 'info', wide: true },
  Disponibles: { icon: <CheckCircle2 aria-hidden size={18} />, tone: 'success' },
  'Documentos vencidos': { icon: <FileWarning aria-hidden size={18} />, tone: 'danger' },
  'En ruta': { icon: <Route aria-hidden size={18} />, tone: 'info' },
  'En taller': { icon: <Wrench aria-hidden size={18} />, tone: 'warning' },
  'Health score prom.': { icon: <Activity aria-hidden size={18} />, tone: 'warning' },
  'Incidentes abiertos': { icon: <TriangleAlert aria-hidden size={18} />, tone: 'danger' },
  'Mantenciones criticas': { icon: <CalendarClock aria-hidden size={18} />, tone: 'warning' },
  'Total camiones': { icon: <Truck aria-hidden size={18} />, tone: 'neutral' },
}

export function FleetStatsCards({ metrics }: FleetStatsCardsProps) {
  return (
    <div className={styles.statsGrid}>
      {metrics.map((metric) => {
        const meta = metricMeta[metric.label] || metricMeta['Total camiones']
        const className = [
          styles.statCard,
          styles[meta.tone],
          meta.wide ? styles.wide : '',
        ]
          .filter(Boolean)
          .join(' ')
        const valueClassName = [styles.value, metric.value.length > 8 ? styles.longValue : ''].filter(Boolean).join(' ')

        return (
          <Card className={className} key={metric.label}>
            <div className={styles.header}>
              <div className={styles.copy}>
                <span className={styles.label}>{metric.label}</span>
                <small className={styles.helper}>{metric.helper}</small>
              </div>
              <span className={styles.icon}>{meta.icon}</span>
            </div>
            <strong className={valueClassName}>{metric.value}</strong>
          </Card>
        )
      })}
    </div>
  )
}
