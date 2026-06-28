import { createElement, useEffect, useState } from 'react'
import { Keyboard, Menu, MoreHorizontal, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NotificationCenterButton } from '../../../features/notifications/components/NotificationCenterButton'
import { operationalQuickActions } from '../../shortcuts/quickActions.config'
import type { ShortcutPreferences } from '../../shortcuts/shortcutPreferences.types'
import { formatShortcutLabel, getQuickActionShortcut, getQuickActionShortcutRange } from '../../shortcuts/shortcutUtils'
import { getSidebarIcon } from '../Sidebar/sidebarIcons'
import styles from './Topbar.module.css'

interface TopbarProps {
  isSidebarOpen: boolean
  isSidebarPinned: boolean
  onOpenCommandPalette: () => void
  onOpenShortcutHelp: () => void
  onToggleSidebar: () => void
  shortcutPreferences: ShortcutPreferences
}

export function Topbar({
  isSidebarOpen,
  isSidebarPinned,
  onOpenCommandPalette,
  onOpenShortcutHelp,
  onToggleSidebar,
  shortcutPreferences,
}: TopbarProps) {
  const [showMoreShortcuts, setShowMoreShortcuts] = useState(false)
  const visibleQuickActions = operationalQuickActions.slice(0, 4)
  const secondaryQuickActions = operationalQuickActions.slice(4)
  const searchShortcutLabel = shortcutPreferences.profile === 'apple'
    ? formatShortcutLabel('cmd+shift+k', shortcutPreferences.profile)
    : formatShortcutLabel('ctrl+shift+k', shortcutPreferences.profile)
  const quickActionRange = getQuickActionShortcutRange(shortcutPreferences, operationalQuickActions.length)

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMoreShortcuts(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <header className={styles.topbar}>
      {!isSidebarPinned ? (
        <button
          aria-label={isSidebarOpen ? 'Cerrar menu lateral' : 'Abrir menu lateral'}
          aria-pressed={isSidebarOpen}
          className={styles.menuButton}
          onClick={onToggleSidebar}
          title={isSidebarOpen ? 'Cerrar menu lateral' : 'Abrir menu lateral'}
          type="button"
        >
          <Menu size={20} />
        </button>
      ) : null}
      <div className={styles.searchWrap}>
        {/* Unico buscador de entidades: abre la paleta de comandos (Ctrl+Shift+K). */}
        <button
          aria-label="Buscar caso, cliente, camion, chofer, OC o flete"
          className={styles.search}
          onClick={onOpenCommandPalette}
          type="button"
        >
          <Search aria-hidden size={18} />
          <span className={styles.searchPlaceholder}>Buscar caso, cliente, camion, chofer, OC o flete</span>
          {shortcutPreferences.shortcutHintsEnabled ? (
            <span className={styles.commandHint}>{searchShortcutLabel}</span>
          ) : null}
        </button>
      </div>
      <nav aria-label="Atajos rapidos" className={styles.quickActions}>
        {shortcutPreferences.shortcutHintsEnabled ? (
          <span className={styles.quickActionMode} title={`Acciones rapidas ${quickActionRange}`}>
            {quickActionRange}
          </span>
        ) : null}
        {visibleQuickActions.map((action, index) => (
          <Link
            aria-label={`${action.label}. Atajo ${getQuickActionShortcut(index + 1, shortcutPreferences)}`}
            className={[styles.shortcutButton, index === 0 ? styles.primaryShortcut : ''].filter(Boolean).join(' ')}
            key={action.label}
            title={`${action.label} (${getQuickActionShortcut(index + 1, shortcutPreferences)})`}
            to={action.path}
          >
            {createElement(getSidebarIcon(action.icon), { 'aria-hidden': true, size: 17 })}
            <span className={styles.srOnly}>{action.label}</span>
          </Link>
        ))}
        {secondaryQuickActions.length > 0 ? (
          <div className={styles.moreWrap}>
            <button
              aria-expanded={showMoreShortcuts}
              aria-label="Ver mas atajos rapidos"
              className={styles.moreButton}
              onClick={() => setShowMoreShortcuts((current) => !current)}
              type="button"
            >
              <MoreHorizontal aria-hidden size={18} />
            </button>
            {showMoreShortcuts ? (
              <div className={styles.moreMenu}>
                {secondaryQuickActions.map((action, offset) => (
                  <Link
                    aria-label={`${action.label}. Atajo ${getQuickActionShortcut(visibleQuickActions.length + offset + 1, shortcutPreferences)}`}
                    className={styles.moreAction}
                    key={action.label}
                    onClick={() => setShowMoreShortcuts(false)}
                    title={`${action.label} (${getQuickActionShortcut(visibleQuickActions.length + offset + 1, shortcutPreferences)})`}
                    to={action.path}
                  >
                    {createElement(getSidebarIcon(action.icon), { 'aria-hidden': true, size: 17 })}
                    <span>{action.label}</span>
                    {shortcutPreferences.shortcutHintsEnabled ? (
                      <kbd>{getQuickActionShortcut(visibleQuickActions.length + offset + 1, shortcutPreferences)}</kbd>
                    ) : null}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </nav>
      <div className={styles.actions}>
        <button
          aria-label="Ver atajos de teclado"
          className={styles.iconButton}
          onClick={onOpenShortcutHelp}
          title="Ver atajos de teclado (?)"
          type="button"
        >
          <Keyboard aria-hidden size={18} />
        </button>
        <NotificationCenterButton />
      </div>
    </header>
  )
}
