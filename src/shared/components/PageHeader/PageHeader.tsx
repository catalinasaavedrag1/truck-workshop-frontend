import type { ReactNode } from 'react'
import styles from './PageHeader.module.css'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  children?: ReactNode
  breadcrumbs?: {
    label: string
    href?: string
  }[]
}

export function PageHeader({ title, description, actions, breadcrumbs, children }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.mainRow}>
        <div className={styles.copy}>
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
              {breadcrumbs.map((item, index) => (
                <span key={`${item.label}-${index}`}>
                  {item.href ? <a href={item.href}>{item.label}</a> : item.label}
                </span>
              ))}
            </nav>
          ) : null}
          <div className={styles.titleLine}>
            <h1>{title}</h1>
          </div>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      {children ? <div className={styles.toolbar}>{children}</div> : null}
    </header>
  )
}
