import { ChevronDown } from 'lucide-react'
import type { AppNavigationGroup } from '../../../../config/app.config'
import type { AppNavigationItem } from '../../../../config/app.config'
import { SidebarCollapseGroup } from './SidebarCollapseGroup'
import { SidebarItem } from './SidebarItem'
import { isNavigationItemActive } from '../sidebarUtils'
import styles from '../Sidebar.module.css'

interface SidebarSectionProps {
  group: AppNavigationGroup
  collapsed: boolean
  expanded: boolean
  expandedItemPaths: Record<string, boolean>
  forceExpandNested: boolean
  pathname: string
  onToggle: () => void
  onToggleItem: (item: AppNavigationItem) => void
}

export function SidebarSection({
  collapsed,
  expanded,
  expandedItemPaths,
  forceExpandNested,
  group,
  onToggle,
  onToggleItem,
  pathname,
}: SidebarSectionProps) {
  return (
    <section className={styles.group}>
      <button
        aria-expanded={collapsed ? false : expanded}
        className={styles.groupButton}
        onClick={onToggle}
        type="button"
      >
        <span>{group.label}</span>
        <span className={styles.groupMeta}>
          {group.items.length}
          <ChevronDown
            aria-hidden
            className={[styles.chevron, expanded ? styles.chevronOpen : ''].filter(Boolean).join(' ')}
            size={15}
          />
        </span>
      </button>
      {expanded || collapsed
        ? group.items.map((item) => {
            const itemActive = isNavigationItemActive(item, pathname)
            const itemExpanded = collapsed || forceExpandNested || (expandedItemPaths[item.path] ?? itemActive)

            return item.children ? (
              <SidebarCollapseGroup
                collapsed={collapsed}
                expanded={itemExpanded}
                item={item}
                key={item.path}
                onToggle={() => onToggleItem(item)}
                pathname={pathname}
              />
            ) : (
              <SidebarItem
                active={itemActive}
                collapsed={collapsed}
                item={item}
                key={item.path}
              />
            )
          })
        : null}
    </section>
  )
}
