import type { ReactNode } from 'react'
import { Button } from '../Button/Button'
import { Modal } from '../Modal/Modal'
import styles from './ConfirmModal.module.css'

interface ConfirmModalProps {
  cancelLabel?: string
  children?: ReactNode
  confirmLabel?: string
  description?: string
  isConfirming?: boolean
  onCancel: () => void
  onConfirm: () => void
  open: boolean
  title: string
  tone?: 'danger' | 'primary'
}

export function ConfirmModal({
  cancelLabel = 'Cancelar',
  children,
  confirmLabel = 'Confirmar',
  description,
  isConfirming = false,
  onCancel,
  onConfirm,
  open,
  title,
  tone = 'primary',
}: ConfirmModalProps) {
  return (
    <Modal onClose={onCancel} open={open} title={title}>
      <div className={styles.content}>
        {description ? <p>{description}</p> : null}
        {children}
        <div className={styles.actions}>
          <Button disabled={isConfirming} onClick={onCancel} type="button" variant="secondary">
            {cancelLabel}
          </Button>
          <Button loading={isConfirming} onClick={onConfirm} type="button" variant={tone === 'danger' ? 'danger' : 'primary'}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
