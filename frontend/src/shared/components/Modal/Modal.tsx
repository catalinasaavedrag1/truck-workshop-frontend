import { useEffect, useId, useRef } from 'react'
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

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({ open, title, children, onClose }: ModalProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) {
      return undefined
    }

    // Guardamos el elemento que tenia el foco para devolverlo al cerrar.
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()

    // Bloqueamos el scroll del fondo mientras el modal esta abierto.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      // Focus trap: el Tab no debe escapar al contenido del fondo.
      if (event.key === 'Tab') {
        const dialog = dialogRef.current
        if (!dialog) {
          return
        }
        const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
          (element) => element.offsetParent !== null || element === document.activeElement,
        )
        if (focusables.length === 0) {
          event.preventDefault()
          return
        }
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        const active = document.activeElement

        if (event.shiftKey && (active === first || !dialog.contains(active))) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && active === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      // Devolvemos el foco a quien lo tenia antes de abrir el modal.
      previouslyFocused?.focus?.()
    }
  }, [onClose, open])

  if (!open) {
    return null
  }

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
      >
        <header className={styles.header}>
          <h2 id={titleId}>{title}</h2>
          <Button aria-label="Cerrar modal" icon={<X size={18} />} onClick={onClose} ref={closeButtonRef} variant="ghost" />
        </header>
        <div className={styles.body}>{children}</div>
      </section>
    </div>
  )
}
