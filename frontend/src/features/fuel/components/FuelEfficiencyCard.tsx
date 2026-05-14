import { CircleDollarSign, Fuel, Gauge, TriangleAlert } from 'lucide-react'
import { Card } from '../../../shared/components/Card/Card'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { FuelRecord } from '../types/fuel.types'
import {
  getAverageKmPerLiter,
  getDeviationCount,
  getTotalFuelCost,
  getTotalLiters,
} from '../utils/fuelAnalytics'
import styles from './FuelModule.module.css'

interface FuelEfficiencyCardProps {
  records: FuelRecord[]
}

export function FuelEfficiencyCard({ records }: FuelEfficiencyCardProps) {
  const average = getAverageKmPerLiter(records)
  const suspicious = getDeviationCount(records, 'SUSPICIOUS')
  const warning = getDeviationCount(records, 'WARNING')
  const totalLiters = getTotalLiters(records)
  const totalCost = getTotalFuelCost(records)
  const cards = [
    {
      helper: 'Rendimiento promedio medido',
      icon: <Gauge aria-hidden size={18} />,
      label: 'Eficiencia flota',
      tone: 'info',
      value: `${average.toFixed(1)} km/l`,
    },
    {
      helper: 'Volumen total del periodo',
      icon: <Fuel aria-hidden size={18} />,
      label: 'Litros cargados',
      tone: 'success',
      value: `${totalLiters.toLocaleString('es-CL')} l`,
    },
    {
      helper: 'Gasto combustible registrado',
      icon: <CircleDollarSign aria-hidden size={18} />,
      label: 'Costo periodo',
      tone: 'warning',
      value: formatCurrency(totalCost),
    },
    {
      helper: `${warning} desviaciones controladas`,
      icon: <TriangleAlert aria-hidden size={18} />,
      label: 'A investigar',
      tone: suspicious > 0 ? 'danger' : 'success',
      value: suspicious,
    },
  ]

  return (
    <div className={styles.summaryGrid}>
      {cards.map((card) => (
        <Card className={[styles.summaryCard, styles[card.tone]].join(' ')} key={card.label}>
          <div className={styles.summaryHeader}>
            <div className={styles.summaryCopy}>
              <span className={styles.label}>{card.label}</span>
              <small className={styles.muted}>{card.helper}</small>
            </div>
            <span className={styles.icon}>{card.icon}</span>
          </div>
          <strong className={[styles.summaryValue, String(card.value).length > 10 ? styles.longValue : ''].filter(Boolean).join(' ')}>
            {card.value}
          </strong>
        </Card>
      ))}
    </div>
  )
}
