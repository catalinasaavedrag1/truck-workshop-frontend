import styles from './WorkshopCaseLayout.module.css'

export interface StageTabItem {
  id: string
  label: string
}

interface StageTabsProps {
  activeTabId: string
  onSelectTab: (tabId: string) => void
  tabs: StageTabItem[]
}

export function StageTabs({ activeTabId, onSelectTab, tabs }: StageTabsProps) {
  return (
    <nav aria-label="Herramientas de la etapa" className={styles.tabs}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId

        return (
          <button
            aria-current={isActive ? 'page' : undefined}
            className={[styles.tab, isActive ? styles.tabActive : ''].filter(Boolean).join(' ')}
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
