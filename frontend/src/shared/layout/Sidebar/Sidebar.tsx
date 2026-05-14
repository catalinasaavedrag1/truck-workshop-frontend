import { createElement, useEffect, useMemo, useRef, useState } from 'react'
import type { FocusEventHandler, MouseEventHandler } from 'react'
import { Search, UserRound, X } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { appConfig } from '../../../config/app.config'
import { ROUTES } from '../../../config/routes'
import type { AppNavigationGroup, AppNavigationItem } from '../../../config/app.config'
import { getCurrentSessionUser } from '../../services/sessionUser'
import { getSidebarIcon } from './sidebarIcons'
import { SidebarSection } from './components/SidebarSection'
import {
  isNavigationPathActive,
  matchesNavigationQuery,
} from './sidebarUtils'
import styles from './Sidebar.module.css'

interface FlatNavigationItem extends AppNavigationItem {
  parentLabel: string
  sectionLabel: string
}

interface SidebarProps {
  isOpen: boolean
  isCollapsed?: boolean
  isPinned: boolean
  focusSearchSignal?: number
  onBlur?: FocusEventHandler<HTMLElement>
  onMouseEnter?: MouseEventHandler<HTMLElement>
  onMouseLeave?: MouseEventHandler<HTMLElement>
}

export function Sidebar({
  focusSearchSignal = 0,
  isCollapsed = false,
  isOpen,
  isPinned,
  onBlur,
  onMouseEnter,
  onMouseLeave,
}: SidebarProps) {
  const location = useLocation()
  const sessionUser = getCurrentSessionUser()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [expandedGroupLabels, setExpandedGroupLabels] = useState<Record<string, boolean>>(() =>
    getInitialExpandedGroupLabels(appConfig.navigationGroups),
  )
  const [expandedItemPaths, setExpandedItemPaths] = useState<Record<string, boolean>>({})
  const normalizedQuery = query.trim().toLowerCase()
  const currentNavigationPath = `${location.pathname}${location.search}`
  const flatNavigationItems = useMemo(() => flattenNavigationItems(appConfig.navigationGroups), [])
  const visibleNavigationItems = flatNavigationItems.filter((item) => matchesFlatNavigationItem(item, normalizedQuery))
  const activeItemPath = flatNavigationItems
    .filter((item) => isNavigationPathActive(currentNavigationPath, item.path))
    .sort((first, second) => second.path.length - first.path.length)[0]?.path

  useEffect(() => {
    if (!focusSearchSignal || !isOpen) {
      return
    }

    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus()
      searchInputRef.current?.select()
    })
  }, [focusSearchSignal, isOpen])

  const isItemActive = (item: FlatNavigationItem) => activeItemPath === item.path
  const userInitials = sessionUser.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U'
  const searchIsActive = normalizedQuery.length > 0

  const toggleGroup = (group: AppNavigationGroup) => {
    setExpandedGroupLabels((current) => ({
      ...current,
      [group.label]: !(current[group.label] ?? true),
    }))
  }

  const toggleItem = (item: AppNavigationItem) => {
    setExpandedItemPaths((current) => ({
      ...current,
      [item.path]: !(current[item.path] ?? false),
    }))
  }

  if (isPinned && isCollapsed) {
    return (
      <aside
        className={[styles.sidebar, styles.pinned, styles.iconRail].join(' ')}
        onBlur={onBlur}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <nav aria-label="Menu compacto" className={styles.railNav}>
          {appConfig.navigationGroups.map((group) => (
            <div className={styles.railGroup} key={group.label}>
              {group.items.map((item) => {
                const Icon = getSidebarIcon(item.icon)
                const itemActive = isNavigationPathActive(currentNavigationPath, item.path)
                  || Boolean(item.children?.some((child) => isNavigationPathActive(currentNavigationPath, child.path)))

                return (
                  <NavLink
                    aria-label={`${group.label}: ${item.label}`}
                    className={[styles.railLink, itemActive ? styles.active : ''].filter(Boolean).join(' ')}
                    key={item.path}
                    title={`${group.label} / ${item.label}`}
                    to={item.path}
                  >
                    {createElement(Icon, { 'aria-hidden': true, size: 24 })}
                    <span className={styles.srOnly}>{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>
        <Link className={styles.railUser} title={`${sessionUser.name} - Usuario`} to={ROUTES.shortcutSettings}>
          <span className={styles.userAvatar}>{userInitials}</span>
          <span className={styles.srOnly}>{sessionUser.name}</span>
        </Link>
      </aside>
    )
  }

  return (
    <aside
      className={[
        styles.sidebar,
        isPinned ? styles.pinned : styles.floating,
        isOpen ? styles.open : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onBlur={onBlur}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
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
        {query ? (
          <button
            aria-label="Borrar busqueda"
            className={styles.searchClear}
            onClick={() => setQuery('')}
            type="button"
          >
            <X aria-hidden size={14} />
          </button>
        ) : (
          <kbd>Ctrl K</kbd>
        )}
      </label>
      <nav aria-label="Principal" className={styles.nav}>
        {searchIsActive ? (
          <>
            <div className={styles.flatMenu}>
              {visibleNavigationItems.map((item) => {
                const Icon = getSidebarIcon(item.icon)

                return (
                  <NavLink
                    className={[styles.flatLink, isItemActive(item) ? styles.active : ''].filter(Boolean).join(' ')}
                    key={`${item.parentLabel}-${item.path}`}
                    onClick={() => setQuery('')}
                    title={`${item.parentLabel} / ${item.label}`}
                    to={item.path}
                  >
                    {createElement(Icon, { 'aria-hidden': true, size: 18 })}
                    <span className={styles.flatLinkText}>
                      <strong>{item.label}</strong>
                      <small>{item.parentLabel} / {item.sectionLabel}</small>
                    </span>
                  </NavLink>
                )
              })}
            </div>
            {visibleNavigationItems.length === 0 ? <p className={styles.empty}>Sin modulos para "{query}"</p> : null}
          </>
        ) : (
          <div className={styles.menuTree}>
            {appConfig.navigationGroups.map((group) => (
              <SidebarSection
                collapsible={appConfig.navigationGroups.length > 1}
                expanded={expandedGroupLabels[group.label] ?? true}
                expandedItemPaths={expandedItemPaths}
                forceExpandNested={false}
                group={group}
                key={group.label}
                onToggle={() => toggleGroup(group)}
                onToggleItem={toggleItem}
                pathname={currentNavigationPath}
              />
            ))}
          </div>
        )}
      </nav>
      <Link className={styles.userDock} to={ROUTES.shortcutSettings}>
        <span className={styles.userAvatar}>{userInitials}</span>
        <span className={styles.userCopy}>
          <strong>{sessionUser.name}</strong>
          <small>{sessionUser.email || 'Usuario activo'}</small>
        </span>
        <UserRound aria-hidden size={17} />
      </Link>
    </aside>
  )
}

function getInitialExpandedGroupLabels(groups: AppNavigationGroup[]) {
  return Object.fromEntries(groups.map((group) => [group.label, false]))
}

function flattenNavigationItems(groups: AppNavigationGroup[]) {
  const flattenedItems: FlatNavigationItem[] = []
  const seenPaths = new Set<string>()

  const addItem = (item: AppNavigationItem, parentLabel: string, sectionLabel: string) => {
    if (seenPaths.has(item.path)) {
      return
    }

    seenPaths.add(item.path)
    flattenedItems.push({
      ...item,
      children: undefined,
      parentLabel,
      sectionLabel,
    })
  }

  groups.forEach((group) => {
    group.items.forEach((item) => {
      if (item.children?.length) {
        item.children.forEach((child) => addItem(child, item.label, child.section || group.label))
        return
      }

      addItem(item, group.label, item.section || group.label)
    })
  })

  return flattenedItems
}

function matchesFlatNavigationItem(item: FlatNavigationItem, query: string) {
  if (!query) {
    return true
  }

  return [item.label, item.parentLabel, item.sectionLabel].some((value) => matchesNavigationQuery(value, query))
}
