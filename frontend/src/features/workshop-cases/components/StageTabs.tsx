import { Tabs } from '../../../shared/components/Tabs/Tabs'

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
  return <Tabs activeId={activeTabId} ariaLabel="Herramientas de la etapa" items={tabs} onChange={onSelectTab} variant="pill" />
}
