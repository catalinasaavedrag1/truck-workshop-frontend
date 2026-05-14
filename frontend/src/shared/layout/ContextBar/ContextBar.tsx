import { createElement } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { AppNavigationGroup, AppNavigationItem } from '../../../config/app.config'
import { appConfig } from '../../../config/app.config'
import { getSidebarIcon } from '../Sidebar/sidebarIcons'
import { isNavigationPathActive } from '../Sidebar/sidebarUtils'
import styles from './ContextBar.module.css'

interface NavigationMatch {
  group: AppNavigationGroup
  item: AppNavigationItem
  parent: AppNavigationItem
}

function findNavigationMatch(pathname: string): NavigationMatch | undefined {
  const matches: NavigationMatch[] = []

  appConfig.navigationGroups.forEach((group) => {
    group.items.forEach((parent) => {
      if (isNavigationPathActive(pathname, parent.path)) {
        matches.push({
          group,
          item: parent,
          parent,
        })
      }

      parent.children?.forEach((child) => {
        if (isNavigationPathActive(pathname, child.path)) {
          matches.push({
            group,
            item: child,
            parent,
          })
        }
      })
    })
  })

  return matches.sort((first, second) => second.item.path.length - first.item.path.length)[0]
}

export function ContextBar() {
  const location = useLocation()
  const match = findNavigationMatch(`${location.pathname}${location.search}`)

  if (!match) {
    return null
  }

  const isChild = match.item.path !== match.parent.path
  const showGroup = match.group.label !== 'Plataforma'
  const relatedItems = getRelatedNavigationItems(match)
  const sectionLabel = match.item.section

  return (
    <section className={styles.contextBar} aria-label="Contexto operacional">
      <div className={styles.identity}>
        <span className={styles.moduleIcon}>
          {createElement(getSidebarIcon(match.parent.icon), { 'aria-hidden': true, size: 15 })}
        </span>
        {showGroup ? (
          <>
            <span className={styles.group}>{match.group.label}</span>
            <span className={styles.separator}>/</span>
          </>
        ) : null}
        <Link className={styles.parentLink} to={match.parent.path}>
          {match.parent.label}
        </Link>
        {isChild ? (
          <>
            <span className={styles.separator}>/</span>
            <span className={styles.current}>{match.item.label}</span>
          </>
        ) : null}
        {sectionLabel ? <span className={styles.sectionPill}>{sectionLabel}</span> : null}
      </div>
      {relatedItems.length > 0 ? (
        <nav aria-label={`Vistas relacionadas de ${match.parent.label}`} className={styles.relatedNav}>
          {relatedItems.map((item) => (
            <Link key={item.path} to={item.path}>
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </section>
  )
}

function getRelatedNavigationItems(match: NavigationMatch) {
  const siblings = match.parent.children || []
  const activeSection = match.item.section
  const visibleSiblings = siblings.filter((item) => item.showInSidebar !== false && item.path !== match.item.path)
  const sameSection = activeSection
    ? visibleSiblings.filter((item) => item.section === activeSection)
    : []
  const contextualItems = sameSection.length > 0 ? sameSection : visibleSiblings

  return contextualItems.slice(0, 4)
}
