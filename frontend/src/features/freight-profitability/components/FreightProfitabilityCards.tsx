import { AlertTriangle, CircleDollarSign, Gauge, TrendingUp } from 'lucide-react'
import { Card } from '../../../shared/components/Card/Card'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { FreightProfitability } from '../types/freightProfitability.types'
import styles from './FreightProfitability.module.css'

interface FreightProfitabilityCardsProps {
  items: FreightProfitability[]
}

export function FreightProfitabilityCards({ items }: FreightProfitabilityCardsProps) {
  const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0)
  const totalNetMargin = items.reduce((sum, item) => sum + item.netMargin, 0)
  const averageMargin = items.reduce((sum, item) => sum + item.marginPercentage, 0) / Math.max(items.length, 1)
  const averageCostPerKm = items.reduce((sum, item) => sum + item.costPerKm, 0) / Math.max(items.length, 1)
  const atRiskCount = items.filter((item) => item.marginPercentage < 15).length
  const metrics = [
    {
      helper: `${items.length} fletes cerrados con costos cargados`,
      icon: <CircleDollarSign aria-hidden size={19} />,
      label: 'Ingresos cerrados',
      value: formatCurrency(totalRevenue),
    },
    {
      helper: 'Despues de costos directos y asignados',
      icon: <TrendingUp aria-hidden size={19} />,
      label: 'Margen neto total',
      value: formatCurrency(totalNetMargin),
    },
    {
      helper: atRiskCount > 0 ? `${atRiskCount} fletes bajo umbral` : 'Cartera saludable',
      icon: <AlertTriangle aria-hidden size={19} />,
      label: 'Margen promedio',
      value: `${averageMargin.toFixed(1)}%`,
    },
    {
      helper: 'Combustible, peajes, chofer, desgaste y mantencion',
      icon: <Gauge aria-hidden size={19} />,
      label: 'Costo/km promedio',
      value: formatCurrency(averageCostPerKm),
    },
  ]

  return (
    <div className={styles.metricGrid}>
      {metrics.map((metric) => (
        <Card className={styles.metricCard} key={metric.label}>
          <span className={styles.metricIcon}>{metric.icon}</span>
          <span className={styles.metricCopy}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.helper}</small>
          </span>
        </Card>
      ))}
    </div>
  )
}
