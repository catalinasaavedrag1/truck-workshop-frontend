import { createElement } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../config/routes'
import { Button } from '../components/Button/Button'
import { Modal } from '../components/Modal/Modal'
import { getSidebarIcon } from '../layout/Sidebar/sidebarIcons'
import { operationalQuickActions } from './quickActions.config'
import { quickActionShortcutLabels } from './shortcutPreferences.constants'
import type { ShortcutPreferences } from './shortcutPreferences.types'
import {
  formatShortcutLabel,
  getModuleCycleDisplay,
  getQuickActionShortcut,
  getQuickActionShortcutRange,
} from './shortcutUtils'
import styles from './KeyboardShortcutsHelp.module.css'

interface KeyboardShortcutsHelpProps {
  open: boolean
  preferences: ShortcutPreferences
  onClose: () => void
}

export function KeyboardShortcutsHelp({ onClose, open, preferences }: KeyboardShortcutsHelpProps) {
  const moduleCycleDisplay = getModuleCycleDisplay(preferences.moduleCycleShortcut, preferences.profile)
  const quickActionRange = getQuickActionShortcutRange(preferences, operationalQuickActions.length)

  return (
    <Modal onClose={onClose} open={open} title="Atajos de teclado">
      <div className={styles.panel}>
        <section className={styles.section}>
          <div>
            <h3>Navegacion operacional</h3>
            <p>Atajos pensados para moverse entre modulos y encontrar informacion sin sacar las manos del teclado.</p>
          </div>
          <div className={styles.shortcutGrid}>
            <ShortcutRow action="Buscar en menu lateral" keys={[formatShortcutLabel('ctrl+k', preferences.profile)]} />
            <ShortcutRow
              action="Abrir paleta de comandos"
              keys={[
                preferences.profile === 'apple'
                  ? formatShortcutLabel('cmd+shift+k', preferences.profile)
                  : formatShortcutLabel('ctrl+shift+k', preferences.profile),
                '/',
              ]}
            />
            <ShortcutRow action="Siguiente modulo" keys={[moduleCycleDisplay.next]} />
            <ShortcutRow action="Modulo anterior" keys={[moduleCycleDisplay.previous]} />
            <ShortcutRow action="Ver esta ayuda" keys={['?']} />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h3>Acciones rapidas</h3>
              <p>Usa {quickActionRange} para abrir vistas de alta frecuencia.</p>
            </div>
            <span className={styles.mode}>{quickActionShortcutLabels[preferences.quickActionShortcut]}</span>
          </div>
          <div className={styles.actionGrid}>
            {operationalQuickActions.map((action, index) => (
              <Link className={styles.actionCard} key={action.id} onClick={onClose} to={action.path}>
                <span className={styles.actionIcon}>
                  {createElement(getSidebarIcon(action.icon), { 'aria-hidden': true, size: 16 })}
                </span>
                <span>{action.label}</span>
                <kbd>{getQuickActionShortcut(index + 1, preferences)}</kbd>
              </Link>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <span>{preferences.globalShortcutsEnabled ? 'Atajos globales activos' : 'Atajos globales desactivados'}</span>
          <Button size="sm" variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          <Link className={styles.settingsLink} onClick={onClose} to={ROUTES.shortcutSettings}>
            Configurar
          </Link>
        </footer>
      </div>
    </Modal>
  )
}

function ShortcutRow({ action, keys }: { action: string; keys: string[] }) {
  return (
    <div className={styles.shortcutRow}>
      <span>{action}</span>
      <span className={styles.keys}>
        {keys.map((key) => (
          <kbd key={key}>{key}</kbd>
        ))}
      </span>
    </div>
  )
}
