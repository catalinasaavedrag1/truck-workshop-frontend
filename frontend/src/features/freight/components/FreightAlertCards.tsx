import { AlertTriangle, CheckCircle2, ClipboardList, Send, Truck, UserCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FreightAssignment, FreightQuote, FreightRequest } from '../types/freight.types'
import {
  type FreightAttentionFilter,
  matchesFreightAttentionFilter,
} from '../utils/freightOperations'
import styles from './FreightModule.module.css'

interface FreightAlertCardsProps {
  activeFilter: FreightAttentionFilter
  assignments: FreightAssignment[]
  onFilterChange: (filter: FreightAttentionFilter) => void
  quotes: FreightQuote[]
  requests: FreightRequest[]
}

const alertConfig: Array<{
  description: string
  filter: Exclude<FreightAttentionFilter, 'all'>
  icon: LucideIcon
  label: string
}> = [
  {
    description: 'Retiro vencido o dentro de 24 h.',
    filter: 'overdue',
    icon: AlertTriangle,
    label: 'Retiros urgentes',
  },
  {
    description: 'Aprobadas sin recurso operativo.',
    filter: 'unassigned',
    icon: Truck,
    label: 'Sin camion asignado',
  },
  {
    description: 'Cotizacion enviada sin decision.',
    filter: 'approval',
    icon: UserCheck,
    label: 'Cliente pendiente',
  },
  {
    description: 'Con camion y chofer para despacho.',
    filter: 'ready-dispatch',
    icon: CheckCircle2,
    label: 'Listas para despacho',
  },
  {
    description: 'Ingreso sin tarifa enviada.',
    filter: 'unquoted',
    icon: Send,
    label: 'Sin cotizar',
  },
]

export function FreightAlertCards({
  activeFilter,
  assignments,
  onFilterChange,
  quotes,
  requests,
}: FreightAlertCardsProps) {
  return (
    <section className={styles.alertRail} aria-label="Urgencias operacionales de flete">
      <button
        className={[styles.alertCard, activeFilter === 'all' ? styles.alertCardActive : ''].filter(Boolean).join(' ')}
        onClick={() => onFilterChange('all')}
        type="button"
      >
        <span className={styles.alertIcon}>
          <ClipboardList aria-hidden size={18} />
        </span>
        <small>Total bandeja</small>
        <strong>{requests.length}</strong>
        <span>Ver todas las solicitudes</span>
      </button>
      {alertConfig.map((item) => {
        const Icon = item.icon
        const count = requests.filter((request) =>
          matchesFreightAttentionFilter(item.filter, request, quotes, assignments),
        ).length

        return (
          <button
            className={[
              styles.alertCard,
              activeFilter === item.filter ? styles.alertCardActive : '',
              count > 0 ? styles.alertCardHasSignal : '',
            ]
              .filter(Boolean)
              .join(' ')}
            key={item.filter}
            onClick={() => onFilterChange(item.filter)}
            type="button"
          >
            <span className={styles.alertIcon}>
              <Icon aria-hidden size={18} />
            </span>
            <small>{item.label}</small>
            <strong>{count}</strong>
            <span>{count > 0 ? item.description : 'Sin casos activos'}</span>
          </button>
        )
      })}
    </section>
  )
}
