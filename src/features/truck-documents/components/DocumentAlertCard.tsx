import { FileCheck2, FileClock, FileX2 } from 'lucide-react'
import { Card } from '../../../shared/components/Card/Card'
import type { TruckDocument } from '../types/truckDocuments.types'
import styles from './DocumentAlertCard.module.css'

interface DocumentAlertCardProps {
  documents: TruckDocument[]
}

export function DocumentAlertCard({ documents }: DocumentAlertCardProps) {
  const blocked = documents.filter((document) => document.status === 'EXPIRED' || document.status === 'MISSING')
  const warning = documents.filter(
    (document) => document.status === 'EXPIRES_SOON_15' || document.status === 'EXPIRES_SOON_30',
  )
  const valid = documents.filter((document) => document.status === 'VALID')

  const cards = [
    {
      className: styles.summaryCardDanger,
      helper: 'Vencidos o faltantes',
      icon: <FileX2 aria-hidden size={18} />,
      iconClassName: styles.dangerIcon,
      label: 'Bloquean despacho',
      title: 'Accion requerida',
      value: blocked.length,
    },
    {
      className: styles.summaryCardWarning,
      helper: 'Alertas entre 15 y 30 dias',
      icon: <FileClock aria-hidden size={18} />,
      iconClassName: styles.warningIcon,
      label: 'Por vencer',
      title: 'Programar renovacion',
      value: warning.length,
    },
    {
      className: styles.summaryCardSuccess,
      helper: 'Sin alerta operacional',
      icon: <FileCheck2 aria-hidden size={18} />,
      iconClassName: styles.successIcon,
      label: 'Vigentes',
      title: 'Control documental al dia',
      value: valid.length,
    },
  ]

  return (
    <div className={styles.summaryGrid}>
      {cards.map((card) => (
        <Card className={[styles.summaryCard, card.className].join(' ')} key={card.label}>
          <div className={styles.summaryHeader}>
            <div className={styles.summaryCopy}>
              <span>{card.label}</span>
              <strong>{card.title}</strong>
            </div>
            <span className={[styles.summaryIcon, card.iconClassName].join(' ')}>{card.icon}</span>
          </div>
          <div className={styles.summaryFooter}>
            <strong className={styles.summaryValue}>{card.value}</strong>
            <small className={styles.summaryHelper}>{card.helper}</small>
          </div>
        </Card>
      ))}
    </div>
  )
}
