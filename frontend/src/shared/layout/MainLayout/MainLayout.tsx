import { useCallback, useEffect, useState } from 'react'
import type { FocusEvent } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getDefaultShortcutPreferences, SHORTCUT_PREFERENCES_EVENT } from '../../shortcuts/shortcutPreferences.constants'
import { loadShortcutPreferences } from '../../shortcuts/shortcutPreferences.service'
import type { ShortcutPreferences } from '../../shortcuts/shortcutPreferences.types'
import { getCurrentSessionUser } from '../../services/sessionUser'
import { CommandPalette } from '../../components/CommandPalette'
import { ConnectionBanner } from '../../components/ConnectionBanner/ConnectionBanner'
import { ToastViewport } from '../../components/ToastViewport/ToastViewport'
import { KeyboardShortcutsHelp } from '../../shortcuts/KeyboardShortcutsHelp'
import { useGlobalShortcuts } from '../../shortcuts/useGlobalShortcuts'
import { ContextBar } from '../ContextBar/ContextBar'
import { Sidebar } from '../Sidebar/Sidebar'
import { Topbar } from '../Topbar/Topbar'
import styles from './MainLayout.module.css'

const SIDEBAR_PINNED_KEY = 'tw.sidebar.pinnedOpen'

function readSidebarPinnedPreference(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_PINNED_KEY) === 'true'
  } catch {
    return false
  }
}

function writeSidebarPinnedPreference(value: boolean) {
  try {
    window.localStorage.setItem(SIDEBAR_PINNED_KEY, String(value))
  } catch {
    // localStorage no disponible (modo privado/SSR): la preferencia no persiste.
  }
}

export function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 881px)').matches)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)
  const [isSidebarKeyboardExpanded, setIsSidebarKeyboardExpanded] = useState(false)
  // Preferencia persistida del usuario: mantener el menu de escritorio fijo y
  // expandido (en vez del riel que se expande solo al pasar el mouse).
  const [isSidebarPinnedOpen, setIsSidebarPinnedOpen] = useState(readSidebarPinnedPreference)
  const [sidebarSearchFocusSignal, setSidebarSearchFocusSignal] = useState(0)
  const [globalSearchFocusSignal, setGlobalSearchFocusSignal] = useState(0)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false)
  const [shortcutFeedback, setShortcutFeedback] = useState('')
  const [shortcutPreferences, setShortcutPreferences] = useState<ShortcutPreferences>(() =>
    getDefaultShortcutPreferences(getCurrentSessionUser().id),
  )

  const isSidebarPinned = isDesktop
  const isSidebarVisible = isSidebarPinned || isSidebarOpen
  const isSidebarCollapsed = isSidebarPinned && !isSidebarHovered && !isSidebarKeyboardExpanded && !isSidebarPinnedOpen

  // En mobile/drawer, Escape cierra el menu lateral.
  useEffect(() => {
    if (isDesktop || !isSidebarOpen) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDesktop, isSidebarOpen])

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
      // En escritorio el boton fija/suelta el menu de forma persistente.
      setIsSidebarPinnedOpen((current) => {
        const next = !current
        writeSidebarPinnedPreference(next)
        return next
      })
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

  const closeSidebarAfterNavigation = useCallback(() => {
    if (!isDesktop) {
      setIsSidebarOpen(false)
    }
  }, [isDesktop])

  const focusGlobalSearch = useCallback(() => {
    setGlobalSearchFocusSignal((current) => current + 1)
  }, [])

  const openShortcutHelp = useCallback(() => {
    setShortcutHelpOpen(true)
  }, [])

  const openCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(true)
  }, [])

  const announceShortcutFeedback = useCallback((message: string) => {
    setShortcutFeedback(message)
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

  useEffect(() => {
    if (!shortcutFeedback) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => setShortcutFeedback(''), 1800)

    return () => window.clearTimeout(timeoutId)
  }, [shortcutFeedback])

  useGlobalShortcuts({
    navigate,
    onFocusGlobalSearch: focusGlobalSearch,
    onFocusMenuSearch: focusMenuSearch,
    onOpenCommandPalette: openCommandPalette,
    onOpenHelp: openShortcutHelp,
    onShortcutFeedback: announceShortcutFeedback,
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
        onNavigate={closeSidebarAfterNavigation}
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
        <ConnectionBanner />
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
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
      <div aria-live="polite" className={styles.shortcutFeedback} role="status">
        {shortcutFeedback}
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
      <ToastViewport />
    </div>
  )
}
