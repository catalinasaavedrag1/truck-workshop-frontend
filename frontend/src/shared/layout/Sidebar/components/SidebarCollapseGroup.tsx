import { createElement } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { AppNavigationItem } from '../../../../config/app.config'
import { getSidebarIcon } from '../sidebarIcons'
import { groupNavigationItemsBySection, isNavigationPathActive } from '../sidebarUtils'
import styles from '../Sidebar.module.css'

interface SidebarCollapseGroupProps {
  item: AppNavigationItem
  expanded: boolean
  onToggle: () => void
  pathname: string
}

export function SidebarCollapseGroup({ expanded, item, onToggle, pathname }: SidebarCollapseGroupProps) {
  const isActive = isNavigationPathActive(pathname, item.path)
    || Boolean(item.children?.some((child) => isNavigationPathActive(pathname, child.path)))
  const activeChildPath = item.children
    ?.filter((child) => isNavigationPathActive(pathname, child.path))
    .sort((first, second) => second.path.length - first.path.length)[0]?.path
  const visibleChildren = item.children?.filter((child) => child.showInSidebar !== false) || []
  const childSections = groupNavigationItemsBySection(visibleChildren)
  const icon = createElement(getSidebarIcon(item.icon), { 'aria-hidden': true, size: 24 })
  const submenuId = `sidebar-submenu-${item.path.replace(/[^a-zA-Z0-9]+/g, '-')}`

  return (
    <div className={styles.submenuShell}>
      <button
        aria-controls={submenuId}
        aria-expanded={expanded}
        className={[styles.parentRow, isActive ? styles.parentRowActive : ''].filter(Boolean).join(' ')}
        onClick={onToggle}
        title={expanded ? `Cerrar ${item.label}` : `Abrir ${item.label}`}
        type="button"
      >
        <span className={styles.parentButtonContent}>
          {icon}
          <span>{item.label}</span>
        </span>
        <span className={styles.parentMeta}>
          <span>{visibleChildren.length}</span>
          <ChevronDown
            aria-hidden
            className={[styles.chevron, expanded ? styles.chevronOpen : ''].filter(Boolean).join(' ')}
            size={15}
          />
        </span>
      </button>
      <div className={[styles.subnav, expanded ? '' : styles.subnavClosed].filter(Boolean).join(' ')} id={submenuId}>
        {childSections.map((section) => (
          <div className={styles.subnavSection} key={`${item.path}-${section.label}`}>
            {childSections.length > 1 ? <span className={styles.subnavSectionTitle}>{section.label}</span> : null}
            {section.items.map((child) => (
              <Link
                aria-current={activeChildPath === child.path ? 'page' : undefined}
                className={[styles.sublink, activeChildPath === child.path ? styles.active : ''].filter(Boolean).join(' ')}
                key={child.path}
                title={child.label}
                to={child.path}
              >
                {child.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
