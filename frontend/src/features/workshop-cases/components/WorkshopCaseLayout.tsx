import type { ReactNode } from 'react'
import styles from './WorkshopCaseLayout.module.css'

interface WorkshopCaseLayoutProps {
  actionBar: ReactNode
  aside: ReactNode
  children: ReactNode
  footer: ReactNode
  header: ReactNode
  tabs: ReactNode
  workflow: ReactNode
}

export function WorkshopCaseLayout({
  actionBar,
  aside,
  children,
  footer,
  header,
  tabs,
  workflow,
}: WorkshopCaseLayoutProps) {
  return (
    <section className={styles.shell}>
      <div className={styles.caseChrome}>
        {header}
        <div className={styles.stickyBand}>
          {workflow}
          {actionBar}
        </div>
      </div>
      <div className={styles.body}>
        <main className={styles.main}>
          {tabs}
          <div className={styles.stageContent} id="case-stage-content">
            {children}
          </div>
        </main>
        <aside className={styles.aside}>{aside}</aside>
      </div>
      <div className={styles.footer}>{footer}</div>
    </section>
  )
}
