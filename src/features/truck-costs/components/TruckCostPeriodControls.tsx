import type { TruckCostPeriodMode } from '../types/truckCosts.types'
import styles from './TruckCostsModule.module.css'

interface TruckCostPeriodControlsProps {
  month: number
  onMonthChange: (month: number) => void
  onPeriodChange: (period: TruckCostPeriodMode) => void
  onYearChange: (year: number) => void
  period: TruckCostPeriodMode
  year: number
}

export function TruckCostPeriodControls({
  month,
  onMonthChange,
  onPeriodChange,
  onYearChange,
  period,
  year,
}: TruckCostPeriodControlsProps) {
  return (
    <div className={styles.costHeaderActions}>
      <div className={styles.segmented} role="group" aria-label="Periodo de costos">
        <button data-active={period === 'monthly'} onClick={() => onPeriodChange('monthly')} type="button">
          Mensual
        </button>
        <button data-active={period === 'annual'} onClick={() => onPeriodChange('annual')} type="button">
          Anual
        </button>
      </div>
      {period === 'monthly' ? (
        <input
          className={styles.periodInput}
          onChange={(event) => {
            const [nextYear, nextMonth] = event.target.value.split('-').map(Number)
            onYearChange(nextYear)
            onMonthChange(nextMonth)
          }}
          type="month"
          value={`${year}-${String(month).padStart(2, '0')}`}
        />
      ) : (
        <input
          className={styles.periodInput}
          min={2020}
          onChange={(event) => onYearChange(Number(event.target.value))}
          type="number"
          value={year}
        />
      )}
    </div>
  )
}
