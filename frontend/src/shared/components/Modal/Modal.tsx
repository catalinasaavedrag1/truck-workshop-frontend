import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '../Button/Button'
import styles from './Modal.module.css'

interface ModalProps {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className={styles.backdrop} role="presentation">
      <section aria-modal="true" className={styles.modal} role="dialog">
        <header className={styles.header}>
          <h2>{title}</h2>
          <Button aria-label="Cerrar modal" icon={<X size={18} />} onClick={onClose} variant="ghost" />
        </header>
        <div className={styles.body}>{children}</div>
      </section>
    </div>
  )
}
