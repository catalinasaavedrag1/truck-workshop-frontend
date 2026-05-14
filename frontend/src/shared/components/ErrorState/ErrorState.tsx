import { AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import styles from './ErrorState.module.css'

interface ErrorStateProps {
  title?: string
  description?: string
  action?: ReactNode
}

export function ErrorState({
  title = 'No se pudo cargar la informacion',
  description = 'Intenta nuevamente o revisa los filtros aplicados.',
  action,
}: ErrorStateProps) {
  return (
    <div className={styles.error} role="alert">
      <AlertCircle aria-hidden size={22} />
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}
