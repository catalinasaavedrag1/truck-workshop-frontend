import type { ReactNode } from 'react'
import styles from './FormSection.module.css'

interface FormSectionProps {
  actions?: ReactNode
  children: ReactNode
  description?: string
  title: string
}

export function FormSection({ actions, children, description, title }: FormSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  )
}
