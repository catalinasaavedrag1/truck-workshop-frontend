import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  fullWidth?: boolean
  /** Muestra un spinner y deshabilita el boton mientras dura una accion async. */
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    icon,
    fullWidth = false,
    loading = false,
    className = '',
    disabled = false,
    children,
    ...props
  },
  ref,
) {
  const hasContent = children !== undefined && children !== null && children !== ''
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    icon && !hasContent ? styles.iconOnly : '',
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      aria-busy={loading || undefined}
      className={classNames}
      disabled={disabled || loading}
      ref={ref}
      {...props}
    >
      {loading ? (
        <span aria-hidden className={styles.spinner} />
      ) : icon ? (
        <span className={styles.icon}>{icon}</span>
      ) : null}
      {hasContent ? <span>{children}</span> : null}
    </button>
  )
})
