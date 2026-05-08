import { useEffect, useRef, useState } from 'react'
import { PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { appConfig } from '../../../config/app.config'
import type { AppNavigationItem } from '../../../config/app.config'
import { SidebarSection } from './components/SidebarSection'
import { getVisibleNavigationItems, isNavigationItemActive } from './sidebarUtils'
import styles from './Sidebar.module.css'

const SIDEBAR_ITEMS_STORAGE_KEY = 'truck-workshop.sidebar.expandedItems'
const CLOSED_GROUP_LABEL = '__closed__'

interface ManualGroupState {
  label: string
  pathname: string
}

interface SidebarProps {
  collapsed: boolean
  isOpen: boolean
  isPinned: boolean
  focusSearchSignal?: number
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onToggleCollapsed: () => void
}

export function Sidebar({
  collapsed,
  focusSearchSignal = 0,
  isOpen,
  isPinned,
  onMouseEnter,
  onMouseLeave,
  onToggleCollapsed,
}: SidebarProps) {
  const location = useLocation()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [manualGroup, setManualGroup] = useState<ManualGroupState | null>(null)
  const [expandedItemPaths, setExpandedItemPaths] = useState<Record<string, boolean>>(() => {
    const storedItems = localStorage.getItem(SIDEBAR_ITEMS_STORAGE_KEY)

    if (!storedItems) {
      return {}
    }

    try {
      return JSON.parse(storedItems) as Record<string, boolean>
    } catch {
      return {}
    }
  })
  const normalizedQuery = query.trim().toLowerCase()
  const visibleGroups = appConfig.navigationGroups
    .map((group) => ({
      ...group,
      items: getVisibleNavigationItems(group.items, normalizedQuery),
    }))
    .filter((group) => group.items.length > 0)
  const activeGroupLabel = visibleGroups.find((group) =>
    group.items.some((item) => isNavigationItemActive(item, location.pathname)),
  )?.label
  const manualGroupLabel = manualGroup?.pathname === location.pathname ? manualGroup.label : ''
  const effectiveExpandedGroupLabel =
    manualGroupLabel === CLOSED_GROUP_LABEL ? '' : manualGroupLabel || activeGroupLabel || ''

  useEffect(() => {
    localStorage.setItem(SIDEBAR_ITEMS_STORAGE_KEY, JSON.stringify(expandedItemPaths))
  }, [expandedItemPaths])

  useEffect(() => {
    if (!focusSearchSignal || collapsed || !isOpen) {
      return
    }

    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus()
      searchInputRef.current?.select()
    })
  }, [collapsed, focusSearchSignal, isOpen])

  const handleToggleGroup = (groupLabel: string) => {
    setManualGroup({
      label: effectiveExpandedGroupLabel === groupLabel ? CLOSED_GROUP_LABEL : groupLabel,
      pathname: location.pathname,
    })
  }

  const handleToggleItem = (groupItems: AppNavigationItem[], item: AppNavigationItem) => {
    const itemActive = isNavigationItemActive(item, location.pathname)

    setExpandedItemPaths((current) => {
      const isExpanded = current[item.path] ?? itemActive
      const next = { ...current }

      groupItems.forEach((groupItem) => {
        if (groupItem.children) {
          next[groupItem.path] = false
        }
      })

      next[item.path] = !isExpanded

      return next
    })
  }

  return (
    <aside
      className={[
        styles.sidebar,
        collapsed ? styles.collapsed : '',
        isPinned ? styles.pinned : styles.floating,
        isOpen ? styles.open : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={styles.brandRow}>
        <NavLink className={styles.brand} to="/dashboard">
          <img alt="" src="/logo.svg" />
          <span>{appConfig.name}</span>
        </NavLink>
        <div className={styles.sidebarControls}>
          <button
            aria-label={collapsed || !isOpen ? 'Expandir menu lateral' : 'Colapsar menu lateral'}
            className={styles.controlButton}
            onClick={onToggleCollapsed}
            title={collapsed || !isOpen ? 'Expandir menu lateral' : 'Colapsar menu lateral'}
            type="button"
          >
            {collapsed || !isOpen ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
      </div>
      {!collapsed ? (
        <label className={styles.search} htmlFor="sidebar-search">
          <Search aria-hidden size={16} />
          <input
            id="sidebar-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar modulo"
            ref={searchInputRef}
            type="search"
            value={query}
          />
          <kbd>Ctrl K</kbd>
        </label>
      ) : null}
      <nav aria-label="Principal" className={styles.nav}>
        {visibleGroups.map((group) => {
          const isExpanded = collapsed || Boolean(normalizedQuery) || effectiveExpandedGroupLabel === group.label

          return (
            <SidebarSection
              collapsed={collapsed}
              expanded={isExpanded}
              expandedItemPaths={expandedItemPaths}
              forceExpandNested={Boolean(normalizedQuery)}
              group={group}
              key={group.label}
              onToggle={() => handleToggleGroup(group.label)}
              onToggleItem={(item) => handleToggleItem(group.items, item)}
              pathname={location.pathname}
            />
          )
        })}
        {visibleGroups.length === 0 ? <p className={styles.empty}>Sin modulos para "{query}"</p> : null}
      </nav>
    </aside>
  )
}
