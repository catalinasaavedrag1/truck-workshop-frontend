import { createElement } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import type { AppNavigationItem } from '../../../../config/app.config'
import { SidebarItem } from './SidebarItem'
import { getSidebarIcon } from '../sidebarIcons'
import styles from '../Sidebar.module.css'

interface SidebarCollapseGroupProps {
  item: AppNavigationItem
  collapsed: boolean
  expanded: boolean
  onToggle: () => void
  pathname: string
}

export function SidebarCollapseGroup({ collapsed, expanded, item, onToggle, pathname }: SidebarCollapseGroupProps) {
  const isActive = pathname === item.path || Boolean(item.children?.some((child) => pathname.startsWith(child.path)))
  const activeChildPath = item.children
    ?.filter((child) => pathname === child.path || pathname.startsWith(`${child.path}/`))
    .sort((first, second) => second.path.length - first.path.length)[0]?.path
  const icon = createElement(getSidebarIcon(item.icon), { 'aria-hidden': true, size: 18 })

  if (collapsed) {
    return <SidebarItem active={isActive} collapsed={collapsed} item={item} />
  }

  return (
    <div className={styles.submenuShell}>
      <div className={[styles.parentRow, isActive ? styles.parentRowActive : ''].filter(Boolean).join(' ')}>
        <NavLink className={styles.parentLink} title={item.label} to={item.path}>
          {icon}
          <span>{item.label}</span>
        </NavLink>
        <button
          aria-expanded={expanded}
          aria-label={expanded ? `Cerrar ${item.label}` : `Abrir ${item.label}`}
          className={styles.parentToggle}
          onClick={onToggle}
          title={expanded ? `Cerrar ${item.label}` : `Abrir ${item.label}`}
          type="button"
        >
          <ChevronDown
            aria-hidden
            className={[styles.chevron, expanded ? styles.chevronOpen : ''].filter(Boolean).join(' ')}
            size={15}
          />
        </button>
      </div>
      <div className={[styles.subnav, expanded ? '' : styles.subnavClosed].filter(Boolean).join(' ')}>
        {item.children?.map((child) => (
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
    </div>
  )
}
