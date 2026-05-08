import { appConfig } from '../../config/app.config'
import type { ModuleCycleShortcut, QuickActionShortcut, ShortcutPreferences } from './shortcutPreferences.types'

export interface ShortcutModule {
  groupLabel: string
  icon: string
  label: string
  path: string
}

export type ModuleCycleDirection = -1 | 1

const editableInputTypes = new Set(['email', 'number', 'password', 'search', 'tel', 'text', 'url'])

export function getShortcutModules(): ShortcutModule[] {
  return appConfig.navigationGroups.flatMap((group) =>
    group.items.map((item) => ({
      groupLabel: group.label,
      icon: item.icon,
      label: item.label,
      path: item.path,
    })),
  )
}

export function findActiveModuleIndex(pathname: string, modules = getShortcutModules()) {
  const activeIndex = modules.findIndex((module) => matchesPath(pathname, module.path))

  if (activeIndex >= 0) {
    return activeIndex
  }

  const flattenedItems = appConfig.navigationGroups.flatMap((group) =>
    group.items.flatMap((item) => [item, ...(item.children || [])].map((child) => ({ child, parent: item }))),
  )
  const activeChild = flattenedItems
    .filter(({ child }) => matchesPath(pathname, child.path))
    .sort((first, second) => second.child.path.length - first.child.path.length)[0]

  return activeChild ? modules.findIndex((module) => module.path === activeChild.parent.path) : -1
}

export function getNextModule(pathname: string, direction: ModuleCycleDirection, modules = getShortcutModules()) {
  if (modules.length === 0) {
    return undefined
  }

  const currentIndex = findActiveModuleIndex(pathname, modules)
  const nextIndex = currentIndex < 0
    ? 0
    : (currentIndex + direction + modules.length) % modules.length

  return modules[nextIndex]
}

export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable) {
    return true
  }

  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
    return true
  }

  if (target instanceof HTMLInputElement) {
    return editableInputTypes.has(target.type)
  }

  return false
}

export function isMenuSearchShortcut(event: KeyboardEvent, preferences: ShortcutPreferences) {
  return preferences.globalShortcutsEnabled
    && event.key.toLowerCase() === 'k'
    && (event.ctrlKey || event.metaKey)
    && !event.altKey
    && !event.shiftKey
}

export function isGlobalSearchShortcut(event: KeyboardEvent, preferences: ShortcutPreferences) {
  if (!preferences.globalShortcutsEnabled) {
    return false
  }

  const isModifiedSearch = event.key.toLowerCase() === 'k'
    && (preferences.profile === 'apple' ? event.metaKey : event.ctrlKey)
    && event.shiftKey
    && !event.altKey

  return isModifiedSearch || (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey)
}

export function isShortcutHelpShortcut(event: KeyboardEvent, preferences: ShortcutPreferences) {
  if (!preferences.globalShortcutsEnabled) {
    return false
  }

  return event.key === '?' || (event.key === '/' && event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey)
}

export function getQuickActionIndex(event: KeyboardEvent, preferences: ShortcutPreferences) {
  if (!preferences.globalShortcutsEnabled || !preferences.quickActionsEnabled) {
    return -1
  }

  if (!matchesQuickActionModifiers(event, preferences.quickActionShortcut || 'alt-number')) {
    return -1
  }

  const index = getNumericShortcutKey(event) - 1

  return Number.isInteger(index) && index >= 0 ? index : -1
}

export function getQuickActionShortcut(
  actionNumber: number,
  preferences: Pick<ShortcutPreferences, 'profile' | 'quickActionShortcut'>,
) {
  const shortcut = preferences.quickActionShortcut || 'alt-number'

  switch (shortcut) {
    case 'ctrl-alt-number':
      return formatShortcutLabel(`ctrl+alt+${actionNumber}`, preferences.profile)
    case 'shift-alt-number':
      return formatShortcutLabel(`shift+alt+${actionNumber}`, preferences.profile)
    case 'alt-number':
    default:
      return formatShortcutLabel(`alt+${actionNumber}`, preferences.profile)
  }
}

export function getQuickActionShortcutRange(
  preferences: Pick<ShortcutPreferences, 'profile' | 'quickActionShortcut'>,
  total: number,
) {
  if (total <= 1) {
    return getQuickActionShortcut(1, preferences)
  }

  const firstShortcut = getQuickActionShortcut(1, preferences)
  const lastShortcut = getQuickActionShortcut(total, preferences)
  const [lastKey] = lastShortcut.split(' ').slice(-1)

  return `${firstShortcut}-${lastKey}`
}

export function getModuleCycleDirection(
  event: KeyboardEvent,
  preferences: ShortcutPreferences,
  spaceLeaderActive: boolean,
): ModuleCycleDirection | undefined {
  if (!preferences.globalShortcutsEnabled || !preferences.moduleCyclingEnabled) {
    return undefined
  }

  switch (preferences.moduleCycleShortcut) {
    case 'alt-arrows':
      return arrowDirection(event, { alt: true })
    case 'ctrl-alt-arrows':
      return arrowDirection(event, { alt: true, ctrl: true })
    case 'ctrl-tab':
      if (event.key === 'Tab' && event.ctrlKey && !event.altKey && !event.metaKey) {
        return event.shiftKey ? -1 : 1
      }
      return undefined
    case 'meta-option-arrows':
      return arrowDirection(event, { alt: true, meta: true })
    case 'space-tab':
      if (spaceLeaderActive && event.key === 'Tab' && !event.ctrlKey && !event.altKey && !event.metaKey) {
        return event.shiftKey ? -1 : 1
      }
      return undefined
    default:
      return undefined
  }
}

export function isSpaceLeaderShortcut(event: KeyboardEvent, shortcut: ModuleCycleShortcut) {
  return shortcut === 'space-tab'
    && event.code === 'Space'
    && !event.ctrlKey
    && !event.metaKey
    && !event.altKey
    && !event.shiftKey
}

export function formatShortcutLabel(shortcut: string, platformProfile: ShortcutPreferences['profile'] = 'windows') {
  const isApple = platformProfile === 'apple'

  return shortcut
    .split('+')
    .map((part) => {
      const normalized = part.trim().toLowerCase()

      if (normalized === 'ctrl') {
        return isApple ? 'Control' : 'Ctrl'
      }

      if (normalized === 'cmd' || normalized === 'meta') {
        return isApple ? 'Cmd' : 'Win'
      }

      if (normalized === 'alt' || normalized === 'option') {
        return isApple ? 'Option' : 'Alt'
      }

      if (normalized === 'shift') {
        return 'Shift'
      }

      if (normalized === 'tab') {
        return 'Tab'
      }

      if (normalized === 'space') {
        return 'Espacio'
      }

      if (normalized === 'arrowright') {
        return 'Derecha'
      }

      if (normalized === 'arrowleft') {
        return 'Izquierda'
      }

      return normalized.length === 1 ? normalized.toUpperCase() : normalized
    })
    .join(' ')
}

export function getModuleCycleDisplay(shortcut: ModuleCycleShortcut, profile: ShortcutPreferences['profile']) {
  if (shortcut === 'ctrl-tab') {
    return {
      next: formatShortcutLabel('ctrl+tab', profile),
      previous: formatShortcutLabel('ctrl+shift+tab', profile),
    }
  }

  if (shortcut === 'alt-arrows') {
    return {
      next: formatShortcutLabel('alt+arrowright', profile),
      previous: formatShortcutLabel('alt+arrowleft', profile),
    }
  }

  if (shortcut === 'meta-option-arrows') {
    return {
      next: formatShortcutLabel('cmd+option+arrowright', profile),
      previous: formatShortcutLabel('cmd+option+arrowleft', profile),
    }
  }

  if (shortcut === 'space-tab') {
    return {
      next: 'Espacio Tab',
      previous: 'Espacio Shift Tab',
    }
  }

  return {
    next: formatShortcutLabel('ctrl+alt+arrowright', profile),
    previous: formatShortcutLabel('ctrl+alt+arrowleft', profile),
  }
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

function arrowDirection(
  event: KeyboardEvent,
  required: { alt?: boolean; ctrl?: boolean; meta?: boolean },
): ModuleCycleDirection | undefined {
  const hasRequiredModifiers = Boolean(required.alt) === event.altKey
    && Boolean(required.ctrl) === event.ctrlKey
    && Boolean(required.meta) === event.metaKey
    && !event.shiftKey

  if (!hasRequiredModifiers) {
    return undefined
  }

  if (event.key === 'ArrowRight') {
    return 1
  }

  if (event.key === 'ArrowLeft') {
    return -1
  }

  return undefined
}

function matchesQuickActionModifiers(event: KeyboardEvent, shortcut: QuickActionShortcut) {
  switch (shortcut) {
    case 'ctrl-alt-number':
      return event.ctrlKey && event.altKey && !event.metaKey && !event.shiftKey
    case 'shift-alt-number':
      return event.shiftKey && event.altKey && !event.ctrlKey && !event.metaKey
    case 'alt-number':
    default:
      return event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey
  }
}

function getNumericShortcutKey(event: KeyboardEvent) {
  if (/^[0-9]$/.test(event.key)) {
    return Number(event.key)
  }

  const codeMatch = /^(Digit|Numpad)([0-9])$/.exec(event.code)

  return codeMatch ? Number(codeMatch[2]) : Number.NaN
}
