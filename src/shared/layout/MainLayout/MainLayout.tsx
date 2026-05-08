import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getDefaultShortcutPreferences, SHORTCUT_PREFERENCES_EVENT } from '../../shortcuts/shortcutPreferences.constants'
import {
  getCurrentSessionUser,
  loadShortcutPreferences,
} from '../../shortcuts/shortcutPreferences.service'
import type { ShortcutPreferences } from '../../shortcuts/shortcutPreferences.types'
import { KeyboardShortcutsHelp } from '../../shortcuts/KeyboardShortcutsHelp'
import { useGlobalShortcuts } from '../../shortcuts/useGlobalShortcuts'
import { ContextBar } from '../ContextBar/ContextBar'
import { Sidebar } from '../Sidebar/Sidebar'
import { Topbar } from '../Topbar/Topbar'
import styles from './MainLayout.module.css'

export function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 881px)').matches)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [sidebarSearchFocusSignal, setSidebarSearchFocusSignal] = useState(0)
  const [globalSearchFocusSignal, setGlobalSearchFocusSignal] = useState(0)
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false)
  const [shortcutPreferences, setShortcutPreferences] = useState<ShortcutPreferences>(() =>
    getDefaultShortcutPreferences(getCurrentSessionUser().id),
  )

  const isSidebarPinned = isDesktop
  const isSidebarCollapsed = isDesktop && !isSidebarOpen

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 881px)')
    const handleViewportChange = () => {
      setIsDesktop(mediaQuery.matches)
      setIsSidebarOpen(false)
    }

    handleViewportChange()
    mediaQuery.addEventListener('change', handleViewportChange)

    return () => mediaQuery.removeEventListener('change', handleViewportChange)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen((current) => !current)
  }

  const focusMenuSearch = useCallback(() => {
    setIsSidebarOpen(true)
    setSidebarSearchFocusSignal((current) => current + 1)
  }, [])

  const focusGlobalSearch = useCallback(() => {
    setGlobalSearchFocusSignal((current) => current + 1)
  }, [])

  const openShortcutHelp = useCallback(() => {
    setShortcutHelpOpen(true)
  }, [])

  useEffect(() => {
    const loadPreferences = async () => {
      const sessionUser = getCurrentSessionUser()
      setShortcutPreferences(await loadShortcutPreferences(sessionUser.id))
    }

    void loadPreferences()

    const handlePreferencesUpdate = (event: Event) => {
      const preferences = (event as CustomEvent<ShortcutPreferences>).detail

      if (preferences) {
        setShortcutPreferences(preferences)
      } else {
        void loadPreferences()
      }
    }

    window.addEventListener(SHORTCUT_PREFERENCES_EVENT, handlePreferencesUpdate)

    return () => window.removeEventListener(SHORTCUT_PREFERENCES_EVENT, handlePreferencesUpdate)
  }, [])

  useGlobalShortcuts({
    navigate,
    onFocusGlobalSearch: focusGlobalSearch,
    onFocusMenuSearch: focusMenuSearch,
    onOpenHelp: openShortcutHelp,
    pathname: location.pathname,
    preferences: shortcutPreferences,
  })

  return (
    <div
      className={[
        styles.shell,
        isSidebarPinned ? styles.pinned : styles.floating,
        isSidebarCollapsed ? styles.collapsed : '',
        isSidebarOpen ? styles.sidebarOpen : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Sidebar
        collapsed={isSidebarCollapsed}
        focusSearchSignal={sidebarSearchFocusSignal}
        isOpen={isSidebarOpen}
        isPinned={isSidebarPinned}
        onMouseEnter={() => {
          if (isDesktop) {
            setIsSidebarOpen(true)
          }
        }}
        onMouseLeave={() => {
          if (isDesktop) {
            setIsSidebarOpen(false)
          }
        }}
        onToggleCollapsed={toggleSidebar}
      />
      {!isSidebarPinned && isSidebarOpen ? (
        <button
          aria-label="Cerrar menu lateral"
          className={styles.backdrop}
          onClick={() => setIsSidebarOpen(false)}
          type="button"
        />
      ) : null}
      <div className={styles.workspace}>
        <Topbar
          focusSearchSignal={globalSearchFocusSignal}
          isSidebarOpen={isSidebarOpen}
          isSidebarPinned={isSidebarPinned}
          onOpenShortcutHelp={openShortcutHelp}
          onToggleSidebar={toggleSidebar}
          shortcutPreferences={shortcutPreferences}
        />
        <ContextBar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
      <KeyboardShortcutsHelp
        onClose={() => setShortcutHelpOpen(false)}
        open={shortcutHelpOpen}
        preferences={shortcutPreferences}
      />
    </div>
  )
}
