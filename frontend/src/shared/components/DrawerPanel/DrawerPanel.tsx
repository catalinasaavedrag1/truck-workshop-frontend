import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '../Button/Button'
import styles from './DrawerPanel.module.css'

interface DrawerPanelProps {
  children: ReactNode
  eyebrow?: string
  footer?: ReactNode
  onClose: () => void
  open: boolean
  size?: 'md' | 'lg'
  subtitle?: ReactNode
  title: ReactNode
}

export function DrawerPanel({
  children,
  eyebrow,
  footer,
  onClose,
  open,
  size = 'md',
  subtitle,
  title,
}: DrawerPanelProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) {
      return undefined
    }

    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  if (!open) {
    return null
  }

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <aside
        aria-labelledby={titleId}
        aria-modal="true"
        className={[styles.drawer, styles[size]].join(' ')}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className={styles.header}>
          <div>
            {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
            <h2 id={titleId}>{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <Button
            aria-label="Cerrar panel"
            icon={<X aria-hidden size={16} />}
            onClick={onClose}
            ref={closeButtonRef}
            size="sm"
            type="button"
            variant="ghost"
          />
        </header>
        <div className={styles.body}>{children}</div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </aside>
    </div>
  )
}
