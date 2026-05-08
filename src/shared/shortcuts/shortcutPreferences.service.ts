import { httpClient } from '../services/httpClient'
import type { ApiResponse, PaginatedApiResponse } from '../types/api.types'
import { getDefaultShortcutPreferences } from './shortcutPreferences.constants'
import type { QuickActionShortcut, ShortcutPreferences } from './shortcutPreferences.types'

const SHORTCUTS_API_PATH = '/settings/shortcuts'
const LOCAL_STORAGE_PREFIX = 'truck-workshop.shortcutPreferences'

export interface SessionUserInfo {
  id: string
  name: string
  email?: string
}

export function getCurrentSessionUser(): SessionUserInfo {
  try {
    const session = JSON.parse(localStorage.getItem('truck-workshop-session') || '{}')
    const user = session.user || {}

    return {
      id: String(user.id || user.email || 'local-user'),
      name: String(user.name || user.email || 'Usuario local'),
      email: user.email,
    }
  } catch {
    return {
      id: 'local-user',
      name: 'Usuario local',
    }
  }
}

export async function loadShortcutPreferences(userId: string) {
  const fallback = loadLocalShortcutPreferences(userId) || getDefaultShortcutPreferences(userId)

  try {
    const response = await httpClient.get<PaginatedApiResponse<ShortcutPreferences>>(SHORTCUTS_API_PATH, {
      params: {
        limit: 1,
        sort: 'updatedAt',
        userId,
      },
    })
    const record = response.data.data[0]

    if (!record) {
      return fallback
    }

    const preferences = normalizeShortcutPreferences(record, userId)
    saveLocalShortcutPreferences(preferences)

    return preferences
  } catch {
    return fallback
  }
}

export async function saveShortcutPreferences(preferences: ShortcutPreferences, updatedBy: string) {
  const payload: ShortcutPreferences = {
    ...preferences,
    updatedBy,
    createdBy: preferences.createdBy || updatedBy,
  }

  try {
    const response = preferences.id
      ? await httpClient.patch<ApiResponse<ShortcutPreferences>>(`${SHORTCUTS_API_PATH}/${preferences.id}`, payload)
      : await httpClient.post<ApiResponse<ShortcutPreferences>>(SHORTCUTS_API_PATH, payload)
    const savedPreferences = normalizeShortcutPreferences(response.data.data, preferences.userId)

    saveLocalShortcutPreferences(savedPreferences)

    return savedPreferences
  } catch {
    saveLocalShortcutPreferences(payload)

    return payload
  }
}

export function saveLocalShortcutPreferences(preferences: ShortcutPreferences) {
  localStorage.setItem(storageKey(preferences.userId), JSON.stringify(preferences))
}

function loadLocalShortcutPreferences(userId: string) {
  const stored = localStorage.getItem(storageKey(userId))

  if (!stored) {
    return undefined
  }

  try {
    return normalizeShortcutPreferences(JSON.parse(stored) as ShortcutPreferences, userId)
  } catch {
    return undefined
  }
}

function normalizeShortcutPreferences(preferences: ShortcutPreferences, userId: string): ShortcutPreferences {
  return {
    ...getDefaultShortcutPreferences(userId),
    ...preferences,
    userId,
    globalShortcutsEnabled: normalizeBoolean(preferences.globalShortcutsEnabled),
    quickActionShortcut: normalizeQuickActionShortcut(preferences.quickActionShortcut),
    quickActionsEnabled: normalizeBoolean(preferences.quickActionsEnabled),
    moduleCyclingEnabled: normalizeBoolean(preferences.moduleCyclingEnabled),
    shortcutHintsEnabled: normalizeBoolean(preferences.shortcutHintsEnabled),
  }
}

function normalizeQuickActionShortcut(value: unknown): QuickActionShortcut {
  if (value === 'ctrl-alt-number' || value === 'shift-alt-number' || value === 'alt-number') {
    return value
  }

  return 'alt-number'
}

function normalizeBoolean(value: unknown) {
  if (value === undefined || value === null) {
    return true
  }

  return value === true || value === 1 || value === '1' || value === 'true'
}

function storageKey(userId: string) {
  return `${LOCAL_STORAGE_PREFIX}.${userId}`
}
