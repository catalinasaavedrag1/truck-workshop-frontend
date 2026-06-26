import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { findNavigationContext, getNavigationBreadcrumbs } from '../../navigation/navigationContext'
import styles from './PageHeader.module.css'

interface HeaderChip {
  label: string
  tone?: 'danger' | 'info' | 'neutral' | 'success' | 'warning'
}

interface HeaderShortcutHint {
  keys: string
  label: string
}

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  breadcrumbs?: {
    label: string
    href?: string
  }[]
  eyebrow?: ReactNode
  meta?: Array<HeaderChip | string>
  shortcuts?: HeaderShortcutHint[]
  showContext?: boolean
  showShortcutHints?: boolean
  status?: ReactNode
}

const defaultShortcutHints: HeaderShortcutHint[] = [
  { keys: 'Ctrl K', label: 'menu' },
  { keys: '/', label: 'buscar' },
  { keys: '?', label: 'atajos' },
]

export function PageHeader({
  actions,
  breadcrumbs,
  children,
  description,
  eyebrow,
  meta,
  shortcuts = defaultShortcutHints,
  // La ContextBar global ya muestra breadcrumb y contexto del modulo encima de
  // cada pagina, asi que el PageHeader no los repite salvo que se pidan explicito.
  showContext = false,
  // Los atajos ya estan en la barra superior; no se repiten en cada header.
  showShortcutHints = false,
  status,
  title,
}: PageHeaderProps) {
  const location = useLocation()
  const navigationContext = showContext ? findNavigationContext(`${location.pathname}${location.search}`) : undefined
  const resolvedBreadcrumbs = breadcrumbs ?? getNavigationBreadcrumbs(navigationContext)
  const resolvedMeta = meta ?? getContextMeta(navigationContext)

  return (
    <header className={styles.header}>
      <div className={styles.mainRow}>
        <div className={styles.copy}>
          {resolvedBreadcrumbs.length > 0 ? (
            <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
              {resolvedBreadcrumbs.map((item, index) => (
                <span key={`${item.label}-${index}`}>
                  {item.href ? <Link to={item.href}>{item.label}</Link> : item.label}
                </span>
              ))}
            </nav>
          ) : null}
          {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
          <div className={styles.titleLine}>
            <h1>{title}</h1>
            {status ? <span className={styles.status}>{status}</span> : null}
          </div>
          {description ? <p className={styles.description}>{description}</p> : null}
          {resolvedMeta.length > 0 ? (
            <div className={styles.meta} aria-label="Contexto del header">
              {resolvedMeta.map((item) => {
                const chip = typeof item === 'string' ? { label: item, tone: 'neutral' as const } : item

                return (
                  <span className={[styles.metaChip, styles[chip.tone || 'neutral']].join(' ')} key={chip.label}>
                    {chip.label}
                  </span>
                )
              })}
            </div>
          ) : null}
        </div>
        {actions || (showShortcutHints && shortcuts.length > 0) ? (
          <div className={styles.side}>
            {actions ? (
              <div aria-label="Acciones principales" className={styles.actions}>
                {actions}
              </div>
            ) : null}
            {showShortcutHints && shortcuts.length > 0 ? (
              <div className={styles.shortcutHints} aria-label="Atajos disponibles">
                {shortcuts.map((shortcut) => (
                  <span key={`${shortcut.keys}-${shortcut.label}`}>
                    <kbd>{shortcut.keys}</kbd>
                    {shortcut.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {children ? <div className={styles.toolbar}>{children}</div> : null}
    </header>
  )
}

function getContextMeta(navigationContext: ReturnType<typeof findNavigationContext>) {
  if (!navigationContext) {
    return []
  }

  const items: HeaderChip[] = []

  if (navigationContext.item.section) {
    items.push({ label: navigationContext.item.section, tone: 'info' })
  }

  if (navigationContext.group.description) {
    items.push({ label: navigationContext.group.description })
  }

  return items
}
