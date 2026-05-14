import { ChevronDown } from 'lucide-react'
import type { AppNavigationGroup } from '../../../../config/app.config'
import type { AppNavigationItem } from '../../../../config/app.config'
import { SidebarCollapseGroup } from './SidebarCollapseGroup'
import { SidebarItem } from './SidebarItem'
import { isNavigationItemActive } from '../sidebarUtils'
import styles from '../Sidebar.module.css'

interface SidebarSectionProps {
  group: AppNavigationGroup
  collapsible?: boolean
  expanded: boolean
  expandedItemPaths: Record<string, boolean>
  forceExpandNested: boolean
  pathname: string
  onToggle: () => void
  onToggleItem: (item: AppNavigationItem) => void
}

export function SidebarSection({
  collapsible = true,
  expanded,
  expandedItemPaths,
  forceExpandNested,
  group,
  onToggle,
  onToggleItem,
  pathname,
}: SidebarSectionProps) {
  const groupActive = group.items.some((item) => isNavigationItemActive(item, pathname))
  const visibleItems = group.items.filter((item) => item.showInSidebar !== false)
  const sectionExpanded = expanded || groupActive

  return (
    <section className={styles.group}>
      {collapsible ? (
        <button
          aria-expanded={sectionExpanded}
          className={styles.groupButton}
          onClick={onToggle}
          type="button"
        >
          <span>{group.label}</span>
          <span className={styles.groupMeta}>
            {visibleItems.length}
            <ChevronDown
              aria-hidden
              className={[styles.chevron, sectionExpanded ? styles.chevronOpen : ''].filter(Boolean).join(' ')}
              size={15}
            />
          </span>
        </button>
      ) : (
        <div className={styles.groupHeading}>
          <span>{group.label}</span>
          <span>{group.items.length}</span>
        </div>
      )}
      {sectionExpanded
        ? visibleItems.map((item) => {
            const itemActive = isNavigationItemActive(item, pathname)
            const visibleChildCount = item.children?.filter((child) => child.showInSidebar !== false).length ?? 0
            const itemExpanded = forceExpandNested || itemActive || expandedItemPaths[item.path] === true

            return item.children && visibleChildCount > 0 ? (
              <SidebarCollapseGroup
                expanded={itemExpanded}
                item={item}
                key={item.path}
                onToggle={() => onToggleItem(item)}
                pathname={pathname}
              />
            ) : (
              <SidebarItem
                active={itemActive}
                item={item}
                key={item.path}
              />
            )
          })
        : null}
    </section>
  )
}
