import { Ban, Camera, Flag, Send, TriangleAlert } from 'lucide-react'
import { Card } from '../../../shared/components/Card/Card'
import type { TripArrivalChecklist, TripDepartureChecklist } from '../types/tripChecklists.types'
import styles from './TripChecklistModule.module.css'

interface ChecklistSummaryCardProps {
  arrivals: TripArrivalChecklist[]
  departures: TripDepartureChecklist[]
}

export function ChecklistSummaryCard({ arrivals, departures }: ChecklistSummaryCardProps) {
  const blocked = departures.filter((item) => item.status === 'BLOCKED').length
  const observations = [...departures, ...arrivals].filter((item) => item.observations || item.status === 'WITH_OBSERVATIONS').length
  const evidence = [...departures, ...arrivals].filter((item) => item.photos.length > 0).length
  const cards = [
    {
      helper: 'Checklists registrados',
      icon: <Send aria-hidden size={18} />,
      label: 'Salidas',
      tone: 'info',
      value: departures.length,
    },
    {
      helper: 'Retornos con recepcion',
      icon: <Flag aria-hidden size={18} />,
      label: 'Entradas',
      tone: 'success',
      value: arrivals.length,
    },
    {
      helper: 'Puntos criticos no aptos',
      icon: <Ban aria-hidden size={18} />,
      label: 'Bloqueos salida',
      tone: blocked > 0 ? 'danger' : 'success',
      value: blocked,
    },
    {
      helper: 'Fotos o firmas adjuntas',
      icon: <Camera aria-hidden size={18} />,
      label: 'Con evidencia',
      tone: 'warning',
      value: evidence,
    },
    {
      helper: 'Observaciones operativas',
      icon: <TriangleAlert aria-hidden size={18} />,
      label: 'Con novedad',
      tone: observations > 0 ? 'warning' : 'success',
      value: observations,
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
          <strong className={styles.summaryValue}>{card.value}</strong>
        </Card>
      ))}
    </div>
  )
}
