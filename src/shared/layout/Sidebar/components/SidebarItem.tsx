import { createElement } from 'react'
import { NavLink } from 'react-router-dom'
import type { AppNavigationItem } from '../../../../config/app.config'
import { getSidebarIcon } from '../sidebarIcons'
import styles from '../Sidebar.module.css'

interface SidebarItemProps {
  item: AppNavigationItem
  collapsed: boolean
  active?: boolean
}

export function SidebarItem({ item, collapsed, active = false }: SidebarItemProps) {
  const icon = (size: number) => createElement(getSidebarIcon(item.icon), { 'aria-hidden': true, size })

  if (collapsed) {
    return (
      <NavLink
        aria-label={item.label}
        className={({ isActive }) =>
          [styles.iconLink, isActive || active ? styles.active : ''].filter(Boolean).join(' ')
        }
        title={item.label}
        to={item.path}
      >
        {icon(19)}
      </NavLink>
    )
  }

  return (
    <NavLink
      className={({ isActive }) => [styles.link, isActive || active ? styles.active : ''].filter(Boolean).join(' ')}
      title={item.label}
      to={item.path}
    >
      {icon(18)}
      <span>{item.label}</span>
    </NavLink>
  )
}
