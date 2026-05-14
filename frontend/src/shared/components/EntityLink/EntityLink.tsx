import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { EntityType } from '../../navigation/entityRoutes'
import { getEntityPath } from '../../navigation/entityRoutes'
import styles from './EntityLink.module.css'

type EntityLinkVariant = 'inline' | 'block' | 'subtle'

interface EntityLinkProps {
  ariaLabel?: string
  children?: ReactNode
  className?: string
  fallback?: ReactNode
  id?: string | null
  label?: ReactNode
  meta?: ReactNode
  title?: string
  type: EntityType
  variant?: EntityLinkVariant
}

export function EntityLink({
  ariaLabel,
  children,
  className,
  fallback,
  id,
  label,
  meta,
  title,
  type,
  variant = 'inline',
}: EntityLinkProps) {
  const content = children ?? label ?? id ?? fallback ?? 'Sin referencia'
  const path = getEntityPath(type, id)

  if (!path) {
    return <span className={styles.fallback}>{fallback ?? content}</span>
  }

  const classes = [styles.entityLink, styles[variant], className].filter(Boolean).join(' ')

  return (
    <Link aria-label={ariaLabel || `Abrir ${String(id)}`} className={classes} title={title} to={path}>
      <span className={styles.label}>{content}</span>
      {meta ? <span className={styles.meta}>{meta}</span> : null}
    </Link>
  )
}

interface ContextLinkProps {
  ariaLabel?: string
  children: ReactNode
  className?: string
  meta?: ReactNode
  title?: string
  to?: string
  variant?: EntityLinkVariant
}

export function ContextLink({
  ariaLabel,
  children,
  className,
  meta,
  title,
  to,
  variant = 'inline',
}: ContextLinkProps) {
  if (!to) {
    return <span className={styles.fallback}>{children}</span>
  }

  const classes = [styles.entityLink, styles[variant], className].filter(Boolean).join(' ')

  return (
    <Link aria-label={ariaLabel} className={classes} title={title} to={to}>
      <span className={styles.label}>{children}</span>
      {meta ? <span className={styles.meta}>{meta}</span> : null}
    </Link>
  )
}

export const SmartLink = ContextLink
