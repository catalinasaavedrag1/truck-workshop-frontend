import { useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import styles from './FilterBar.module.css'

export interface ActiveFilterChip {
  label: string
  value?: string
  onRemove?: () => void
}

interface FilterBarProps {
  title?: string
  description?: string
  children: ReactNode
  secondary?: ReactNode
  activeCount?: number
  activeFilters?: ActiveFilterChip[]
  onClear?: () => void
  clearLabel?: string
}

export function FilterBar({
  title = 'Filtros',
  description,
  children,
  secondary,
  activeCount = 0,
  activeFilters = [],
  onClear,
  clearLabel = 'Limpiar',
}: FilterBarProps) {
  const [showSecondary, setShowSecondary] = useState(false)

  return (
    <section className={styles.filterBar}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <SlidersHorizontal aria-hidden size={16} />
            <h2>{title}</h2>
            {activeCount > 0 ? <Badge tone="info">{activeCount} activos</Badge> : null}
          </div>
          {description ? <p>{description}</p> : null}
        </div>
        <div className={styles.actions}>
          {secondary ? (
            <Button
              aria-expanded={showSecondary}
              icon={
                <ChevronDown
                  aria-hidden
                  className={[styles.chevron, showSecondary ? styles.chevronOpen : ''].filter(Boolean).join(' ')}
                  size={16}
                />
              }
              onClick={() => setShowSecondary((current) => !current)}
              type="button"
              variant="ghost"
            >
              Mas filtros
            </Button>
          ) : null}
          {onClear ? (
            <Button icon={<X size={16} />} onClick={onClear} type="button" variant="secondary">
              {clearLabel}
            </Button>
          ) : null}
        </div>
      </div>
      {activeFilters.length > 0 ? (
        <div className={styles.chips} aria-label="Filtros activos">
          {activeFilters.map((filter) =>
            filter.onRemove ? (
              <button
                className={styles.chip}
                key={`${filter.label}-${filter.value || ''}`}
                onClick={filter.onRemove}
                type="button"
              >
                <span>{filter.label}</span>
                {filter.value ? <strong>{filter.value}</strong> : null}
                <X aria-hidden size={13} />
              </button>
            ) : (
              <span className={styles.chip} key={`${filter.label}-${filter.value || ''}`}>
                <span>{filter.label}</span>
                {filter.value ? <strong>{filter.value}</strong> : null}
              </span>
            ),
          )}
        </div>
      ) : null}
      <div className={styles.primary}>{children}</div>
      {secondary && showSecondary ? <div className={styles.secondary}>{secondary}</div> : null}
    </section>
  )
}
