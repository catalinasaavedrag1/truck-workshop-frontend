import { createElement } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import type { AppNavigationItem } from '../../../../config/app.config'
import { getSidebarIcon } from '../sidebarIcons'
import { groupNavigationItemsBySection, isNavigationPathActive } from '../sidebarUtils'
import styles from '../Sidebar.module.css'

interface SidebarCollapseGroupProps {
  item: AppNavigationItem
  expanded: boolean
  onNavigate?: () => void
  onToggle: () => void
  pathname: string
}

export function SidebarCollapseGroup({ expanded, item, onNavigate, onToggle, pathname }: SidebarCollapseGroupProps) {
  const isActive = isNavigationPathActive(pathname, item.path)
    || Boolean(item.children?.some((child) => isNavigationPathActive(pathname, child.path)))
  const activeChildPath = item.children
    ?.filter((child) => isNavigationPathActive(pathname, child.path))
    .sort((first, second) => second.path.length - first.path.length)[0]?.path
  const visibleChildren = item.children?.filter((child) => child.showInSidebar !== false) || []
  const childSections = groupNavigationItemsBySection(visibleChildren)
  const icon = createElement(getSidebarIcon(item.icon), { 'aria-hidden': true, size: 20 })
  const submenuId = `sidebar-submenu-${item.path.replace(/[^a-zA-Z0-9]+/g, '-')}`

  return (
    <div className={styles.submenuShell}>
      <div className={[styles.parentRow, isActive ? styles.parentRowActive : ''].filter(Boolean).join(' ')}>
        <NavLink
          className={styles.parentMainLink}
          onClick={onNavigate}
          title={`Abrir ${item.label}`}
          to={item.path}
        >
          {icon}
          <span>{item.label}</span>
        </NavLink>
        <button
          aria-controls={submenuId}
          aria-expanded={expanded}
          aria-label={expanded ? `Cerrar secciones de ${item.label}` : `Abrir secciones de ${item.label}`}
          className={styles.parentExpandButton}
          onClick={onToggle}
          title={expanded ? `Cerrar ${item.label}` : `Abrir ${item.label}`}
          type="button"
        >
          <span className={styles.parentCount}>{visibleChildren.length}</span>
          <ChevronDown
            aria-hidden
            className={[styles.chevron, expanded ? styles.chevronOpen : ''].filter(Boolean).join(' ')}
            size={15}
          />
        </button>
      </div>
      <div className={[styles.subnav, expanded ? '' : styles.subnavClosed].filter(Boolean).join(' ')} id={submenuId}>
        {childSections.map((section) => (
          <div className={styles.subnavSection} key={`${item.path}-${section.label}`}>
            {childSections.length > 1 ? <span className={styles.subnavSectionTitle}>{section.label}</span> : null}
            {section.items.map((child) => (
              <Link
                aria-current={activeChildPath === child.path ? 'page' : undefined}
                className={[styles.sublink, activeChildPath === child.path ? styles.active : ''].filter(Boolean).join(' ')}
                key={child.path}
                onClick={onNavigate}
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
