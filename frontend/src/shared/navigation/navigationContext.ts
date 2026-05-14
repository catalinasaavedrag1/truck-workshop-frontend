import type { AppNavigationGroup, AppNavigationItem } from '../../config/app.config'
import { appConfig } from '../../config/app.config'
import { isNavigationPathActive } from '../layout/Sidebar/sidebarUtils'

export interface NavigationContextMatch {
  group: AppNavigationGroup
  item: AppNavigationItem
  parent: AppNavigationItem
}

export interface NavigationBreadcrumb {
  href?: string
  label: string
}

export function findNavigationContext(currentPath: string): NavigationContextMatch | undefined {
  const matches: NavigationContextMatch[] = []

  appConfig.navigationGroups.forEach((group) => {
    group.items.forEach((parent) => {
      if (isNavigationPathActive(currentPath, parent.path)) {
        matches.push({ group, item: parent, parent })
      }

      parent.children?.forEach((child) => {
        if (isNavigationPathActive(currentPath, child.path)) {
          matches.push({ group, item: child, parent })
        }
      })
    })
  })

  return matches.sort((first, second) => second.item.path.length - first.item.path.length)[0]
}

export function getNavigationBreadcrumbs(match?: NavigationContextMatch): NavigationBreadcrumb[] {
  if (!match) {
    return []
  }

  const breadcrumbs: NavigationBreadcrumb[] = [
    { label: match.group.label },
    { href: match.parent.path, label: match.parent.label },
  ]

  if (match.item.path !== match.parent.path) {
    breadcrumbs.push({ href: match.item.path, label: match.item.label })
  }

  return breadcrumbs
}

export function getRelatedNavigationItems(match: NavigationContextMatch, limit = 4) {
  const siblings = match.parent.children || []
  const activeSection = match.item.section
  const visibleSiblings = siblings.filter((item) => item.showInSidebar !== false && item.path !== match.item.path)
  const sameSection = activeSection
    ? visibleSiblings.filter((item) => item.section === activeSection)
    : []
  const contextualItems = sameSection.length > 0 ? sameSection : visibleSiblings

  return contextualItems.slice(0, limit)
}
