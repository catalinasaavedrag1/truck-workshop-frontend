import { createElement } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { AppNavigationGroup, AppNavigationItem } from '../../../config/app.config'
import { appConfig } from '../../../config/app.config'
import { getSidebarIcon } from '../Sidebar/sidebarIcons'
import styles from './ContextBar.module.css'

interface NavigationMatch {
  group: AppNavigationGroup
  item: AppNavigationItem
  parent: AppNavigationItem
  siblings: AppNavigationItem[]
}

function normalizePath(path: string) {
  const normalized = path.replace(/\/+$/, '')
  return normalized || '/'
}

function matchesPath(pathname: string, path: string) {
  const currentPath = normalizePath(pathname)
  const targetPath = normalizePath(path)

  return currentPath === targetPath || (targetPath !== '/' && currentPath.startsWith(`${targetPath}/`))
}

function findNavigationMatch(pathname: string): NavigationMatch | undefined {
  const matches: NavigationMatch[] = []

  appConfig.navigationGroups.forEach((group) => {
    group.items.forEach((parent) => {
      if (matchesPath(pathname, parent.path)) {
        matches.push({
          group,
          item: parent,
          parent,
          siblings: parent.children ?? [],
        })
      }

      parent.children?.forEach((child) => {
        if (matchesPath(pathname, child.path)) {
          matches.push({
            group,
            item: child,
            parent,
            siblings: parent.children ?? [],
          })
        }
      })
    })
  })

  return matches.sort((first, second) => second.item.path.length - first.item.path.length)[0]
}

export function ContextBar() {
  const location = useLocation()
  const match = findNavigationMatch(location.pathname)

  if (!match) {
    return null
  }

  const hasTabs = match.siblings.length > 1
  const isChild = match.item.path !== match.parent.path

  return (
    <section className={styles.contextBar} aria-label="Contexto operacional">
      <div className={styles.identity}>
        <span className={styles.moduleIcon}>
          {createElement(getSidebarIcon(match.parent.icon), { 'aria-hidden': true, size: 15 })}
        </span>
        <span className={styles.group}>{match.group.label}</span>
        <span className={styles.separator}>/</span>
        <Link className={styles.parentLink} to={match.parent.path}>
          {match.parent.label}
        </Link>
        {isChild ? (
          <>
            <span className={styles.separator}>/</span>
            <span className={styles.current}>{match.item.label}</span>
          </>
        ) : null}
      </div>

      {hasTabs ? (
        <nav className={styles.tabs} aria-label={`Vistas de ${match.parent.label}`}>
          {match.siblings.map((item) => {
            const isActive = match.item.path === item.path

            return (
              <Link
                aria-current={isActive ? 'page' : undefined}
                className={[styles.tab, isActive ? styles.active : ''].filter(Boolean).join(' ')}
                key={item.path}
                to={item.path}
              >
                {createElement(getSidebarIcon(item.icon), { 'aria-hidden': true, size: 14 })}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      ) : null}
    </section>
  )
}
