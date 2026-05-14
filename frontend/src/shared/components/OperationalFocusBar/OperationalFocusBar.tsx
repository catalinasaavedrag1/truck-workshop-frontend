import { ArrowRight, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { getOperationalPriorityItems } from '../../navigation/operationalSearch'
import styles from './OperationalFocusBar.module.css'

export function OperationalFocusBar() {
  const signals = getOperationalPriorityItems().slice(0, 4)
  const primarySignal = signals[0]

  if (signals.length === 0) {
    return null
  }

  return (
    <section className={styles.bar} aria-label="Foco operacional global">
      <div className={styles.lead}>
        <strong>Foco operacional</strong>
        <span>{primarySignal ? primarySignal.label : 'Operacion sin bloqueos criticos'}</span>
      </div>
      <div className={styles.signals}>
        {signals.map((signal) => (
          <Link className={styles.signal} key={signal.id} to={signal.path}>
            <span className={[styles.tone, signal.tone ? styles[signal.tone] : ''].filter(Boolean).join(' ')} />
            <span className={styles.copy}>
              <strong>{signal.label}</strong>
              <span>{signal.meta}</span>
            </span>
          </Link>
        ))}
      </div>
      <div className={styles.actions}>
        <Link className={styles.action} to={ROUTES.dashboard}>
          <Zap aria-hidden size={15} />
          Inicio
        </Link>
        <Link className={styles.action} to={ROUTES.reports}>
          Reportes
          <ArrowRight aria-hidden size={14} />
        </Link>
      </div>
    </section>
  )
}
