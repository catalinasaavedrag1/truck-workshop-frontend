import { Clock3, Gauge, Landmark, ReceiptText, WalletCards } from 'lucide-react'
import { MetricCard } from '../../../shared/components/MetricCard/MetricCard'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { DriverTripSheet } from '../types/driverTripSheet.types'
import styles from './DriverTripSheets.module.css'

export function DriverTripSheetSummary({ sheets }: { sheets: DriverTripSheet[] }) {
  const trips = sheets.length
  const revenue = sum(sheets, 'revenue')
  const expenses = sum(sheets, 'totalExpenses')
  const margin = revenue - expenses
  const waitingHours = sum(sheets, 'waitingHours')
  const averageScore = trips > 0 ? Math.round(sum(sheets, 'performanceScore') / trips) : 0

  return (
    <div className={styles.summaryGrid}>
      <MetricCard helper="Planillas activas en el periodo visible" icon={<ReceiptText size={18} />} label="Viajes" value={trips} />
      <MetricCard
        helper={`${formatCurrency(expenses)} en gastos rendidos`}
        icon={<WalletCards size={18} />}
        label="Margen neto"
        tone={margin >= 0 ? 'success' : 'danger'}
        value={formatCurrency(margin)}
      />
      <MetricCard
        helper="Peajes asociados a rutas rendidas"
        icon={<Landmark size={18} />}
        label="Peajes"
        tone="info"
        value={formatCurrency(sum(sheets, 'tollCost'))}
      />
      <MetricCard
        helper="Tiempo que afecta productividad del viaje"
        icon={<Clock3 size={18} />}
        label="Horas espera"
        tone={waitingHours > 4 ? 'warning' : 'neutral'}
        value={`${formatNumber(waitingHours)} h`}
      />
      <MetricCard
        helper="Score por margen, desvio km y espera"
        icon={<Gauge size={18} />}
        label="Rendimiento"
        tone={averageScore >= 85 ? 'success' : averageScore >= 70 ? 'warning' : 'danger'}
        value={`${averageScore}/100`}
      />
    </div>
  )
}

function sum(sheets: DriverTripSheet[], field: keyof DriverTripSheet) {
  return sheets.reduce((total, sheet) => total + Number(sheet[field] || 0), 0)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 }).format(value)
}
