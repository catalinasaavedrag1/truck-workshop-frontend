import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { AppNavigationGroup } from '../../../../config/app.config'
import type { AppNavigationItem } from '../../../../config/app.config'
import { SidebarCollapseGroup } from './SidebarCollapseGroup'
import { SidebarItem } from './SidebarItem'
import { groupNavigationItemsBySection, isNavigationItemActive, isNavigationPathActive } from '../sidebarUtils'
import type { SidebarBadge } from '../useSidebarBadges'
import styles from '../Sidebar.module.css'

const BADGE_TONE_CLASS: Record<string, string> = {
  info: styles.navBadgeInfo,
  warning: styles.navBadgeWarning,
  danger: styles.navBadgeDanger,
}

interface SidebarSectionProps {
  group: AppNavigationGroup
  collapsible?: boolean
  expanded: boolean
  expandedItemPaths: Record<string, boolean>
  forceExpandNested: boolean
  pathname: string
  badges?: Record<string, SidebarBadge>
  onNavigate?: () => void
  onToggle: () => void
  onToggleItem: (item: AppNavigationItem) => void
}

export function SidebarSection({
  collapsible = true,
  expanded,
  expandedItemPaths,
  forceExpandNested,
  group,
  badges,
  onNavigate,
  onToggle,
  onToggleItem,
  pathname,
}: SidebarSectionProps) {
  const groupActive = group.items.some((item) => isNavigationItemActive(item, pathname))
  const visibleItems = group.items.filter((item) => item.showInSidebar !== false)
  const sectionExpanded = !collapsible || expanded || groupActive
  // Si el grupo tiene un unico padre con hijos (ej. "Operacion taller" -> "Taller"),
  // el encabezado del grupo y la fila del padre son redundantes. Aplanamos ese nivel:
  // mostramos los hijos del padre (agrupados por seccion) directo bajo el encabezado.
  const soleParent =
    collapsible && visibleItems.length === 1 && (visibleItems[0].children?.some((child) => child.showInSidebar !== false) ?? false)
      ? visibleItems[0]
      : null

  return (
    <section className={[styles.group, groupActive ? styles.groupActive : ''].filter(Boolean).join(' ')}>
      {collapsible ? (
        <button
          aria-expanded={sectionExpanded}
          className={styles.groupButton}
          onClick={onToggle}
          title={group.description || group.label}
          type="button"
        >
          <span>{group.label}</span>
          <span className={styles.groupMeta}>
            {soleParent ? soleParent.children?.filter((child) => child.showInSidebar !== false).length : visibleItems.length}
            <ChevronDown
              aria-hidden
              className={[styles.chevron, sectionExpanded ? styles.chevronOpen : ''].filter(Boolean).join(' ')}
              size={15}
            />
          </span>
        </button>
      ) : (
        <div className={styles.groupHeading} title={group.description || group.label}>
          <span>{group.label}</span>
          <span>{group.items.length}</span>
        </div>
      )}
      {sectionExpanded
        ? soleParent
          ? renderFlattenedSections(soleParent, pathname, onNavigate, badges)
          : visibleItems.map((item) => {
              const itemActive = isNavigationItemActive(item, pathname)
              const visibleChildCount = item.children?.filter((child) => child.showInSidebar !== false).length ?? 0
              const itemExpanded = forceExpandNested || itemActive || expandedItemPaths[item.path] === true

              return item.children && visibleChildCount > 0 ? (
                <SidebarCollapseGroup
                  expanded={itemExpanded}
                  item={item}
                  key={item.path}
                  onNavigate={onNavigate}
                  onToggle={() => onToggleItem(item)}
                  pathname={pathname}
                />
              ) : (
                <SidebarItem active={itemActive} item={item} key={item.path} onNavigate={onNavigate} />
              )
            })
        : null}
    </section>
  )
}

function renderFlattenedSections(
  parent: AppNavigationItem,
  pathname: string,
  onNavigate?: () => void,
  badges?: Record<string, SidebarBadge>,
) {
  const children = parent.children?.filter((child) => child.showInSidebar !== false) ?? []
  const activeChildPath = children
    .filter((child) => isNavigationPathActive(pathname, child.path))
    .sort((first, second) => second.path.length - first.path.length)[0]?.path
  const sections = groupNavigationItemsBySection(children)

  return (
    <div className={styles.subnav}>
      {sections.map((section) => (
        <div className={styles.subnavSection} key={`${parent.path}-${section.label}`}>
          {sections.length > 1 ? <span className={styles.subnavSectionTitle}>{section.label}</span> : null}
          {section.items.map((child) => {
            const badge = child.badge ? badges?.[child.badge] : undefined
            const showBadge = badge && badge.count > 0

            return (
              <Link
                aria-current={activeChildPath === child.path ? 'page' : undefined}
                className={[styles.sublink, activeChildPath === child.path ? styles.active : ''].filter(Boolean).join(' ')}
                key={child.path}
                onClick={onNavigate}
                title={showBadge ? `${child.label} - ${badge.label}` : child.label}
                to={child.path}
              >
                <span>{child.label}</span>
                {showBadge ? (
                  <span aria-label={badge.label} className={[styles.navBadge, BADGE_TONE_CLASS[badge.tone]].join(' ')}>
                    {badge.count}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </div>
      ))}
    </div>
  )
}
