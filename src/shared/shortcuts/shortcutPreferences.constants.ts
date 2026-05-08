import type {
  ModuleCycleShortcut,
  QuickActionShortcut,
  ShortcutPreferences,
  ShortcutProfile,
} from './shortcutPreferences.types'

export const SHORTCUT_PREFERENCES_EVENT = 'truck-workshop:shortcut-preferences-updated'

export const shortcutProfileLabels: Record<ShortcutProfile, string> = {
  apple: 'Apple / macOS',
  custom: 'Personalizado',
  windows: 'Windows / Enterprise',
}

export const moduleCycleShortcutLabels: Record<ModuleCycleShortcut, string> = {
  'alt-arrows': 'Alt + flechas',
  'ctrl-alt-arrows': 'Ctrl + Alt + flechas',
  'ctrl-tab': 'Ctrl + Tab',
  'meta-option-arrows': 'Cmd + Option + flechas',
  'space-tab': 'Espacio y luego Tab',
}

export const moduleCycleShortcutDescriptions: Record<ModuleCycleShortcut, string> = {
  'alt-arrows': 'Rapido para escritorio, puede chocar con algunos navegadores.',
  'ctrl-alt-arrows': 'Recomendado en Windows porque no pelea con pestanas del navegador.',
  'ctrl-tab': 'Natural para app escritorio; algunos navegadores lo reservan para cambiar pestanas.',
  'meta-option-arrows': 'Patron familiar en macOS para avanzar o retroceder entre contextos.',
  'space-tab': 'Secuencia de dos teclas pensada para operadores; no se activa al escribir.',
}

export const quickActionShortcutLabels: Record<QuickActionShortcut, string> = {
  'alt-number': 'Alt + numero',
  'ctrl-alt-number': 'Ctrl + Alt + numero',
  'shift-alt-number': 'Shift + Alt + numero',
}

export const quickActionShortcutDescriptions: Record<QuickActionShortcut, string> = {
  'alt-number': 'El acceso mas rapido para operar vistas frecuentes desde el topbar.',
  'ctrl-alt-number': 'Mas seguro si el navegador o el sistema captura Alt + numero.',
  'shift-alt-number': 'Alternativa simple cuando Ctrl + Alt esta reservado por el equipo.',
}

export function getDefaultShortcutPreferences(userId = 'local-user'): ShortcutPreferences {
  return {
    id: '',
    userId,
    profile: getDefaultShortcutProfile(),
    moduleCycleShortcut: getDefaultShortcutProfile() === 'apple' ? 'meta-option-arrows' : 'ctrl-alt-arrows',
    quickActionShortcut: 'alt-number',
    globalShortcutsEnabled: true,
    quickActionsEnabled: true,
    moduleCyclingEnabled: true,
    shortcutHintsEnabled: true,
  }
}

export function getDefaultShortcutProfile(): Exclude<ShortcutProfile, 'custom'> {
  const platform = navigator.platform.toLowerCase()

  return platform.includes('mac') ? 'apple' : 'windows'
}
