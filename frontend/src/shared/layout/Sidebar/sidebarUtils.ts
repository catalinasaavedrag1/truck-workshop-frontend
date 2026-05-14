import type { AppNavigationItem } from '../../../config/app.config'

export interface NavigationItemSection {
  label: string
  items: AppNavigationItem[]
}

export function matchesNavigationQuery(value: string, query: string) {
  return value.toLowerCase().includes(query)
}

export function getVisibleNavigationItems(items: AppNavigationItem[], query: string) {
  if (!query) {
    return items
  }

  return items
    .map((item) => {
      const itemMatches = matchesNavigationQuery(item.label, query)
      const children = item.children?.filter((child) => matchesNavigationQuery(child.label, query))

      if (itemMatches) {
        return item
      }

      if (children && children.length > 0) {
        return { ...item, children }
      }

      return undefined
    })
    .filter((item): item is AppNavigationItem => Boolean(item))
}

export function isNavigationPathActive(pathname: string, path: string) {
  const currentPath = normalizePath(pathname)
  const targetPath = normalizePath(path)

  return currentPath === targetPath || (targetPath !== '/' && currentPath.startsWith(`${targetPath}/`))
}

export function isNavigationItemActive(item: AppNavigationItem, pathname: string) {
  return isNavigationPathActive(pathname, item.path)
    || Boolean(item.children?.some((child) => isNavigationPathActive(pathname, child.path)))
}

export function groupNavigationItemsBySection(items: AppNavigationItem[] = []) {
  return items.reduce<NavigationItemSection[]>((sections, item) => {
    const sectionLabel = item.section || 'Accesos'
    const existingSection = sections.find((section) => section.label === sectionLabel)

    if (existingSection) {
      existingSection.items.push(item)

      return sections
    }

    sections.push({
      label: sectionLabel,
      items: [item],
    })

    return sections
  }, [])
}

function normalizePath(path: string) {
  const normalized = path.replace(/\/+$/, '')

  return normalized || '/'
}
