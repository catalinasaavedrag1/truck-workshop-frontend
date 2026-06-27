import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './Tabs.module.css'

export interface TabItem {
  id: string
  label: ReactNode
  icon?: ReactNode
  /** Si se define, la pestaña navega (modo link/URL) en vez de invocar onChange. */
  to?: string
}

interface TabsProps {
  items: TabItem[]
  activeId: string
  /** Usado cuando las pestañas son de estado (sin `to`). */
  onChange?: (id: string) => void
  ariaLabel: string
  /** 'underline' (por defecto), 'pill' (chips en contenedor) o 'segmented' (toggle). */
  variant?: 'underline' | 'pill' | 'segmented'
  className?: string
}

const BAR_CLASS = { underline: '', pill: styles.pillBar, segmented: styles.segmentedBar }
const TAB_CLASS = { underline: styles.underlineTab, pill: styles.pillTab, segmented: styles.segmentedTab }
const ACTIVE_CLASS = { underline: styles.tabActive, pill: styles.pillActive, segmented: styles.segmentedActive }

/**
 * Unico componente de tabs/segmentos de la plataforma. Soporta navegacion por URL
 * (`to`) o cambio de estado (`onChange`), y tres estilos via `variant`. Reemplaza
 * las barras de pestañas que cada vista reimplementaba por separado.
 */
export function Tabs({ items, activeId, onChange, ariaLabel, variant = 'underline', className = '' }: TabsProps) {
  return (
    <nav aria-label={ariaLabel} className={[styles.tabs, BAR_CLASS[variant], className].filter(Boolean).join(' ')}>
      {items.map((item) => {
        const isActive = item.id === activeId
        const tabClassName = [styles.tab, TAB_CLASS[variant], isActive ? ACTIVE_CLASS[variant] : '']
          .filter(Boolean)
          .join(' ')

        if (item.to) {
          return (
            <Link aria-current={isActive ? 'page' : undefined} className={tabClassName} key={item.id} to={item.to}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        }

        return (
          <button
            aria-current={isActive ? 'page' : undefined}
            className={tabClassName}
            key={item.id}
            onClick={() => onChange?.(item.id)}
            type="button"
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
