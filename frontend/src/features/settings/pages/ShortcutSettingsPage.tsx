import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Keyboard, RotateCcw, Save } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { Select } from '../../../shared/components/Select/Select'
import {
  getDefaultShortcutPreferences,
  moduleCycleShortcutDescriptions,
  moduleCycleShortcutLabels,
  quickActionShortcutDescriptions,
  quickActionShortcutLabels,
  shortcutProfileLabels,
  SHORTCUT_PREFERENCES_EVENT,
} from '../../../shared/shortcuts/shortcutPreferences.constants'
import {
  loadShortcutPreferences,
  saveShortcutPreferences,
} from '../../../shared/shortcuts/shortcutPreferences.service'
import { getCurrentSessionUser } from '../../../shared/services/sessionUser'
import type {
  ModuleCycleShortcut,
  QuickActionShortcut,
  ShortcutPreferences,
  ShortcutProfile,
} from '../../../shared/shortcuts/shortcutPreferences.types'
import {
  formatShortcutLabel,
  getModuleCycleDisplay,
  getQuickActionShortcut,
  getQuickActionShortcutRange,
  getShortcutModules,
} from '../../../shared/shortcuts/shortcutUtils'
import { operationalQuickActions } from '../../../shared/shortcuts/quickActions.config'
import styles from '../components/ShortcutSettings.module.css'

const profileOptions = [
  { label: shortcutProfileLabels.windows, value: 'windows' },
  { label: shortcutProfileLabels.apple, value: 'apple' },
  { label: shortcutProfileLabels.custom, value: 'custom' },
]

const moduleCycleOptions = Object.entries(moduleCycleShortcutLabels).map(([value, label]) => ({
  label,
  value,
}))

const quickActionOptions = Object.entries(quickActionShortcutLabels).map(([value, label]) => ({
  label,
  value,
}))

export function ShortcutSettingsPage() {
  const sessionUser = useMemo(() => getCurrentSessionUser(), [])
  const [preferences, setPreferences] = useState<ShortcutPreferences>(() =>
    getDefaultShortcutPreferences(sessionUser.id),
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const modules = useMemo(() => getShortcutModules(), [])
  const moduleCycleDisplay = getModuleCycleDisplay(preferences.moduleCycleShortcut, preferences.profile)
  const quickActionRange = getQuickActionShortcutRange(preferences, operationalQuickActions.length)

  useEffect(() => {
    let mounted = true

    const loadPreferences = async () => {
      setIsLoading(true)
      const loadedPreferences = await loadShortcutPreferences(sessionUser.id)

      if (mounted) {
        setPreferences(loadedPreferences)
        setIsLoading(false)
      }
    }

    void loadPreferences()

    return () => {
      mounted = false
    }
  }, [sessionUser.id])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)

    const savedPreferences = await saveShortcutPreferences(preferences, sessionUser.name)

    setPreferences(savedPreferences)
    window.dispatchEvent(new CustomEvent(SHORTCUT_PREFERENCES_EVENT, { detail: savedPreferences }))
    setStatusMessage('Atajos guardados y activos en la plataforma.')
    setIsSaving(false)
  }

  const handleReset = () => {
    const defaultPreferences = getDefaultShortcutPreferences(sessionUser.id)

    setPreferences({
      ...defaultPreferences,
      id: preferences.id,
      createdAt: preferences.createdAt,
      createdBy: preferences.createdBy,
    })
    setStatusMessage('Se restauro la configuracion recomendada. Guarda para persistirla.')
  }

  const handleProfileChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const profile = event.target.value as ShortcutProfile
    const moduleCycleShortcut = profile === 'apple' ? 'meta-option-arrows' : profile === 'windows' ? 'ctrl-alt-arrows' : preferences.moduleCycleShortcut
    const quickActionShortcut = profile === 'custom' ? preferences.quickActionShortcut : 'alt-number'

    setPreferences((current) => ({
      ...current,
      profile,
      moduleCycleShortcut,
      quickActionShortcut,
    }))
  }

  const updateBooleanPreference = (field: keyof Pick<
    ShortcutPreferences,
    'globalShortcutsEnabled' | 'moduleCyclingEnabled' | 'quickActionsEnabled' | 'shortcutHintsEnabled'
  >) => (event: ChangeEvent<HTMLInputElement>) => {
    setPreferences((current) => ({
      ...current,
      [field]: event.target.checked,
    }))
  }

  return (
    <section className={styles.page}>
      <PageHeader
        actions={
          <Button icon={<Save size={16} />} type="submit" form="shortcut-settings-form" disabled={isSaving || isLoading}>
            {isSaving ? 'Guardando...' : 'Guardar atajos'}
          </Button>
        }
        description="Configura atajos globales para operar la plataforma con menos clicks y cambiar de modulo sin perder contexto."
        title="Atajos y teclado"
      />

      <form className={styles.layout} id="shortcut-settings-form" onSubmit={handleSubmit}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelIcon}>
              <Keyboard aria-hidden size={18} />
            </div>
            <div>
              <h2>Perfil operacional</h2>
              <p>Elige un comportamiento cercano a Windows, Apple o un ajuste propio para la operacion diaria.</p>
            </div>
          </div>

          <div className={styles.controlsGrid}>
            <Select
              label="Perfil de teclado"
              name="profile"
              onChange={handleProfileChange}
              options={profileOptions}
              value={preferences.profile}
            />
            <Select
              label="Cambio de modulos"
              name="moduleCycleShortcut"
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  moduleCycleShortcut: event.target.value as ModuleCycleShortcut,
                  profile: current.profile === 'custom' ? current.profile : 'custom',
                }))
              }
              options={moduleCycleOptions}
              value={preferences.moduleCycleShortcut}
            />
            <Select
              label="Acciones rapidas"
              name="quickActionShortcut"
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  quickActionShortcut: event.target.value as QuickActionShortcut,
                  profile: current.profile === 'custom' ? current.profile : 'custom',
                }))
              }
              options={quickActionOptions}
              value={preferences.quickActionShortcut}
            />
          </div>

          <div className={styles.hintStack}>
            <p className={styles.hint}>{moduleCycleShortcutDescriptions[preferences.moduleCycleShortcut]}</p>
            <p className={styles.hint}>{quickActionShortcutDescriptions[preferences.quickActionShortcut]}</p>
          </div>

          <div className={styles.previewGrid}>
            <ShortcutPreview label="Buscar menu" value={formatShortcutLabel('ctrl+k', preferences.profile)} />
            <ShortcutPreview
              label="Buscar datos"
              value={preferences.profile === 'apple'
                ? formatShortcutLabel('cmd+shift+k', preferences.profile)
                : formatShortcutLabel('ctrl+shift+k', preferences.profile)}
            />
            <ShortcutPreview label="Siguiente modulo" value={moduleCycleDisplay.next} />
            <ShortcutPreview label="Modulo anterior" value={moduleCycleDisplay.previous} />
            <ShortcutPreview label="Acciones rapidas" value={quickActionRange} />
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Comportamiento</h2>
              <p>Activa solo lo que aporte velocidad. Los atajos no se disparan mientras escribes en formularios.</p>
            </div>
          </div>

          <div className={styles.toggleList}>
            <ToggleRow
              checked={preferences.globalShortcutsEnabled}
              description="Habilita busqueda, ayuda, acciones rapidas y navegacion de modulos."
              label="Atajos globales"
              onChange={updateBooleanPreference('globalShortcutsEnabled')}
            />
            <ToggleRow
              checked={preferences.moduleCyclingEnabled}
              description="Permite avanzar o retroceder entre modulos principales."
              label="Cambiar modulos con teclado"
              onChange={updateBooleanPreference('moduleCyclingEnabled')}
            />
            <ToggleRow
              checked={preferences.quickActionsEnabled}
              description={`${quickActionRange} abre las vistas frecuentes del topbar.`}
              label="Acciones rapidas con numero"
              onChange={updateBooleanPreference('quickActionsEnabled')}
            />
            <ToggleRow
              checked={preferences.shortcutHintsEnabled}
              description="Muestra pequenas pistas visuales en buscadores y botones rapidos."
              label="Mostrar pistas de atajos"
              onChange={updateBooleanPreference('shortcutHintsEnabled')}
            />
          </div>

          <div className={styles.formFooter}>
            {statusMessage ? <span className={styles.status}>{statusMessage}</span> : <span />}
            <Button icon={<RotateCcw size={16} />} onClick={handleReset} type="button" variant="secondary">
              Recomendado
            </Button>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Acciones de alta frecuencia</h2>
              <p>Estas rutas quedan disponibles con {quickActionRange} para abrir tareas operativas comunes.</p>
            </div>
          </div>
          <div className={styles.quickActionList}>
            {operationalQuickActions.map((action, index) => (
              <div className={styles.quickActionRow} key={action.id}>
                <span>{action.label}</span>
                <kbd>{getQuickActionShortcut(index + 1, preferences)}</kbd>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Orden de cambio de modulos</h2>
              <p>El ciclo usa los modulos principales del menu lateral para mantener una navegacion predecible.</p>
            </div>
          </div>
          <ol className={styles.moduleList}>
            {modules.map((module) => (
              <li key={module.path}>
                <span>{module.label}</span>
                <small>{module.groupLabel}</small>
              </li>
            ))}
          </ol>
        </section>
      </form>
    </section>
  )
}

function ShortcutPreview({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.shortcutPreview}>
      <span>{label}</span>
      <kbd>{value}</kbd>
    </div>
  )
}

function ToggleRow({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean
  description: string
  label: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <label className={styles.toggleRow}>
      <input checked={checked} onChange={onChange} type="checkbox" />
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
    </label>
  )
}
