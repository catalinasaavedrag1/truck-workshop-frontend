import { createElement } from 'react'
import { NavLink } from 'react-router-dom'
import type { AppNavigationItem } from '../../../../config/app.config'
import { getSidebarIcon } from '../sidebarIcons'
import styles from '../Sidebar.module.css'

interface SidebarItemProps {
  item: AppNavigationItem
  active?: boolean
  onNavigate?: () => void
}

export function SidebarItem({ item, active = false, onNavigate }: SidebarItemProps) {
  const icon = (size: number) => createElement(getSidebarIcon(item.icon), { 'aria-hidden': true, size })

  return (
    <NavLink
      className={({ isActive }) => [styles.link, isActive || active ? styles.active : ''].filter(Boolean).join(' ')}
      onClick={onNavigate}
      title={item.label}
      to={item.path}
    >
      {icon(20)}
      <span>{item.label}</span>
    </NavLink>
  )
}
