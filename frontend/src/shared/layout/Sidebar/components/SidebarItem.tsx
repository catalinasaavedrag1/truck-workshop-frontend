import { createElement } from 'react'
import { NavLink } from 'react-router-dom'
import type { AppNavigationItem } from '../../../../config/app.config'
import { getSidebarIcon } from '../sidebarIcons'
import styles from '../Sidebar.module.css'

interface SidebarItemProps {
  item: AppNavigationItem
  active?: boolean
}

export function SidebarItem({ item, active = false }: SidebarItemProps) {
  const icon = (size: number) => createElement(getSidebarIcon(item.icon), { 'aria-hidden': true, size })

  return (
    <NavLink
      className={({ isActive }) => [styles.link, isActive || active ? styles.active : ''].filter(Boolean).join(' ')}
      title={item.label}
      to={item.path}
    >
      {icon(24)}
      <span>{item.label}</span>
    </NavLink>
  )
}
