import type { AppNavigationItem } from '../../../config/app.config'

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

export function isNavigationItemActive(item: AppNavigationItem, pathname: string) {
  return pathname === item.path || Boolean(item.children?.some((child) => pathname.startsWith(child.path)))
}
