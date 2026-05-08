import { useEffect, useRef } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { operationalQuickActions } from './quickActions.config'
import type { ShortcutPreferences } from './shortcutPreferences.types'
import {
  getModuleCycleDirection,
  getNextModule,
  getQuickActionIndex,
  isEditableTarget,
  isGlobalSearchShortcut,
  isMenuSearchShortcut,
  isShortcutHelpShortcut,
  isSpaceLeaderShortcut,
} from './shortcutUtils'

interface UseGlobalShortcutsOptions {
  navigate: NavigateFunction
  pathname: string
  preferences: ShortcutPreferences
  onFocusGlobalSearch: () => void
  onFocusMenuSearch: () => void
  onOpenHelp: () => void
}

const SPACE_SEQUENCE_TIMEOUT_MS = 900

export function useGlobalShortcuts({
  navigate,
  onFocusGlobalSearch,
  onFocusMenuSearch,
  onOpenHelp,
  pathname,
  preferences,
}: UseGlobalShortcutsOptions) {
  const spaceLeaderExpiresAt = useRef(0)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const targetIsEditable = isEditableTarget(event.target)

      if (isMenuSearchShortcut(event, preferences)) {
        event.preventDefault()
        onFocusMenuSearch()
        return
      }

      if (!targetIsEditable && isGlobalSearchShortcut(event, preferences)) {
        event.preventDefault()
        onFocusGlobalSearch()
        return
      }

      if (!targetIsEditable && isShortcutHelpShortcut(event, preferences)) {
        event.preventDefault()
        onOpenHelp()
        return
      }

      if (targetIsEditable) {
        return
      }

      if (isSpaceLeaderShortcut(event, preferences.moduleCycleShortcut)) {
        event.preventDefault()
        spaceLeaderExpiresAt.current = Date.now() + SPACE_SEQUENCE_TIMEOUT_MS
        return
      }

      const moduleDirection = getModuleCycleDirection(event, preferences, Date.now() <= spaceLeaderExpiresAt.current)

      if (moduleDirection) {
        event.preventDefault()
        spaceLeaderExpiresAt.current = 0

        const nextModule = getNextModule(pathname, moduleDirection)

        if (nextModule) {
          navigate(nextModule.path)
        }

        return
      }

      const quickActionIndex = getQuickActionIndex(event, preferences)
      const quickAction = operationalQuickActions[quickActionIndex]

      if (quickAction) {
        event.preventDefault()
        navigate(quickAction.path)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, onFocusGlobalSearch, onFocusMenuSearch, onOpenHelp, pathname, preferences])
}
