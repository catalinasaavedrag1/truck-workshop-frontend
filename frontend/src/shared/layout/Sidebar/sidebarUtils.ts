import type { AppNavigationItem } from '../../../config/app.config'

export interface NavigationItemSection {
  label: string
  items: AppNavigationItem[]
}

export function matchesNavigationQuery(value: string, query: string) {
  return value.toLowerCase().includes(query)
}

export function isNavigationPathActive(pathname: string, path: string) {
  const current = parseNavigationPath(pathname)
  const target = parseNavigationPath(path)

  if (target.search) {
    return current.pathname === target.pathname && current.search === target.search
  }

  return current.pathname === target.pathname || (target.pathname !== '/' && current.pathname.startsWith(`${target.pathname}/`))
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

function parseNavigationPath(path: string) {
  const [withoutHash] = path.split('#')
  const [rawPathname, rawSearch = ''] = withoutHash.split('?')
  const normalized = rawPathname.replace(/\/+$/, '')

  return {
    pathname: normalized || '/',
    search: rawSearch ? `?${rawSearch}` : '',
  }
}
