import type { ReactNode } from 'react'
import styles from './SectionHeader.module.css'

interface SectionHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  eyebrow?: string
  meta?: ReactNode
}

export function SectionHeader({ title, description, actions, eyebrow, meta }: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.copy}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        <div className={styles.titleRow}>
          <h2>{title}</h2>
          {meta ? <span className={styles.meta}>{meta}</span> : null}
        </div>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  )
}
