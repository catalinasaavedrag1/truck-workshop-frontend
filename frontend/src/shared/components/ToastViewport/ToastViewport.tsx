import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { dismissToast, useToasts } from '../../services/toastStore'
import type { ToastTone } from '../../services/toastStore'
import styles from './ToastViewport.module.css'

const TONE_ICONS: Record<ToastTone, ReactNode> = {
  success: <CheckCircle2 aria-hidden size={18} />,
  error: <AlertCircle aria-hidden size={18} />,
  warning: <AlertTriangle aria-hidden size={18} />,
  info: <Info aria-hidden size={18} />,
}

/**
 * Contenedor unico de notificaciones. Se monta una sola vez en MainLayout y
 * escucha el store global (`toastStore`). Cualquier modulo puede mostrar avisos
 * con `toast.success(...)` / `toast.error(...)` sin pasar props ni context.
 */
export function ToastViewport() {
  const toasts = useToasts()

  if (toasts.length === 0) {
    return null
  }

  return (
    <div aria-live="polite" className={styles.viewport} role="region" aria-label="Notificaciones">
      {toasts.map((toast) => (
        <div
          className={[styles.toast, styles[toast.tone]].join(' ')}
          key={toast.id}
          role={toast.tone === 'error' ? 'alert' : 'status'}
        >
          <span className={styles.icon}>{TONE_ICONS[toast.tone]}</span>
          <div className={styles.content}>
            <strong className={styles.title}>{toast.title}</strong>
            {toast.description ? <p className={styles.description}>{toast.description}</p> : null}
          </div>
          <button
            aria-label="Cerrar notificacion"
            className={styles.close}
            onClick={() => dismissToast(toast.id)}
            type="button"
          >
            <X aria-hidden size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
