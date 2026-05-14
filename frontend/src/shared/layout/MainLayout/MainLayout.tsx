import { useCallback, useEffect, useState } from 'react'
import type { FocusEvent } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getDefaultShortcutPreferences, SHORTCUT_PREFERENCES_EVENT } from '../../shortcuts/shortcutPreferences.constants'
import { loadShortcutPreferences } from '../../shortcuts/shortcutPreferences.service'
import type { ShortcutPreferences } from '../../shortcuts/shortcutPreferences.types'
import { getCurrentSessionUser } from '../../services/sessionUser'
import { CommandPalette } from '../../components/CommandPalette'
import { OperationalFocusBar } from '../../components/OperationalFocusBar'
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
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)
  const [isSidebarKeyboardExpanded, setIsSidebarKeyboardExpanded] = useState(false)
  const [sidebarSearchFocusSignal, setSidebarSearchFocusSignal] = useState(0)
  const [globalSearchFocusSignal, setGlobalSearchFocusSignal] = useState(0)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false)
  const [shortcutPreferences, setShortcutPreferences] = useState<ShortcutPreferences>(() =>
    getDefaultShortcutPreferences(getCurrentSessionUser().id),
  )

  const isSidebarPinned = isDesktop
  const isSidebarVisible = isSidebarPinned || isSidebarOpen
  const isSidebarCollapsed = isSidebarPinned && !isSidebarHovered && !isSidebarKeyboardExpanded

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 881px)')
    const handleViewportChange = () => {
      setIsDesktop(mediaQuery.matches)
      setIsSidebarOpen(false)
      setIsSidebarHovered(false)
      setIsSidebarKeyboardExpanded(false)
    }

    handleViewportChange()
    mediaQuery.addEventListener('change', handleViewportChange)

    return () => mediaQuery.removeEventListener('change', handleViewportChange)
  }, [])

  const toggleSidebar = () => {
    if (isDesktop) {
      setIsSidebarKeyboardExpanded((current) => !current)
    } else {
      setIsSidebarOpen((current) => !current)
    }
  }

  const focusMenuSearch = useCallback(() => {
    if (isDesktop) {
      setIsSidebarKeyboardExpanded(true)
    } else {
      setIsSidebarOpen(true)
    }

    setSidebarSearchFocusSignal((current) => current + 1)
  }, [isDesktop])

  const expandSidebarOnHover = () => {
    if (isDesktop) {
      setIsSidebarHovered(true)
    }
  }

  const collapseSidebarOnLeave = () => {
    if (isDesktop) {
      setIsSidebarHovered(false)
      setIsSidebarKeyboardExpanded(false)
    }
  }

  const collapseSidebarOnBlur = (event: FocusEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget

    if (!isDesktop || (nextTarget instanceof Node && event.currentTarget.contains(nextTarget))) {
      return
    }

    setIsSidebarKeyboardExpanded(false)
  }

  const focusGlobalSearch = useCallback(() => {
    setGlobalSearchFocusSignal((current) => current + 1)
  }, [])

  const openShortcutHelp = useCallback(() => {
    setShortcutHelpOpen(true)
  }, [])

  const openCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(true)
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
    onOpenCommandPalette: openCommandPalette,
    onOpenHelp: openShortcutHelp,
    pathname: location.pathname,
    preferences: shortcutPreferences,
  })

  return (
    <div
      className={[
        styles.shell,
        isSidebarPinned ? styles.pinned : styles.floating,
        isSidebarPinned && isSidebarCollapsed ? styles.collapsed : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Sidebar
        focusSearchSignal={sidebarSearchFocusSignal}
        isCollapsed={isSidebarCollapsed}
        isOpen={isSidebarVisible}
        isPinned={isSidebarPinned}
        onBlur={collapseSidebarOnBlur}
        onMouseEnter={expandSidebarOnHover}
        onMouseLeave={collapseSidebarOnLeave}
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
          isSidebarOpen={isSidebarVisible}
          isSidebarPinned={isSidebarPinned}
          onOpenShortcutHelp={openShortcutHelp}
          onOpenCommandPalette={openCommandPalette}
          onToggleSidebar={toggleSidebar}
          shortcutPreferences={shortcutPreferences}
        />
        <ContextBar />
        <OperationalFocusBar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
      <CommandPalette
        onClose={() => setIsCommandPaletteOpen(false)}
        open={isCommandPaletteOpen}
        preferences={shortcutPreferences}
      />
      <KeyboardShortcutsHelp
        onClose={() => setShortcutHelpOpen(false)}
        open={shortcutHelpOpen}
        preferences={shortcutPreferences}
      />
    </div>
  )
}
