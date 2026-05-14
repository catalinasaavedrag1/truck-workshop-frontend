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
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    icon,
    fullWidth = false,
    className = '',
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
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classNames} ref={ref} {...props}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      {hasContent ? <span>{children}</span> : null}
    </button>
  )
})
