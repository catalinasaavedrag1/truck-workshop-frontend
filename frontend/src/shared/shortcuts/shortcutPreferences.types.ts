export type ShortcutProfile = 'windows' | 'apple' | 'custom'

export type ModuleCycleShortcut = 'ctrl-alt-arrows' | 'ctrl-tab' | 'alt-arrows' | 'meta-option-arrows' | 'space-tab'

export type QuickActionShortcut = 'alt-number' | 'ctrl-alt-number' | 'shift-alt-number'

export interface ShortcutPreferences {
  id: string
  userId: string
  profile: ShortcutProfile
  moduleCycleShortcut: ModuleCycleShortcut
  quickActionShortcut: QuickActionShortcut
  globalShortcutsEnabled: boolean
  quickActionsEnabled: boolean
  moduleCyclingEnabled: boolean
  shortcutHintsEnabled: boolean
  createdBy?: string
  updatedBy?: string
  createdAt?: string
  updatedAt?: string
}
