import { Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { operationalQuickActions } from '../../shortcuts/quickActions.config'
import type { ShortcutPreferences } from '../../shortcuts/shortcutPreferences.types'
import { getQuickActionShortcut } from '../../shortcuts/shortcutUtils'
import {
  getOperationalPriorityItems,
  getOperationalSearchItems,
  normalizeOperationalSearch,
  type OperationalSearchItem,
} from '../../navigation/operationalSearch'
import styles from './CommandPalette.module.css'

interface CommandPaletteProps {
  onClose: () => void
  open: boolean
  preferences: ShortcutPreferences
}

export function CommandPalette({ onClose, open, preferences }: CommandPaletteProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const allItems = useMemo(
    () => [
      ...operationalQuickActions.map((action, index) => ({
        group: 'accion' as const,
        id: action.id,
        keywords: action.label,
        label: action.label,
        meta: `Accion rapida · ${getQuickActionShortcut(index + 1, preferences)}`,
        path: action.path,
        tone: index === 0 ? 'success' as const : 'info' as const,
        type: 'Accion',
      })),
      ...getOperationalSearchItems(),
    ],
    [preferences],
  )
  const priorityItems = useMemo(() => getOperationalPriorityItems(), [])
  const normalizedQuery = normalizeOperationalSearch(query.trim())
  const results = normalizedQuery
    ? allItems
        .filter((item) => normalizeOperationalSearch(`${item.label} ${item.meta} ${item.keywords} ${item.type}`).includes(normalizedQuery))
        .slice(0, 9)
    : priorityItems.length > 0
      ? priorityItems
      : allItems.slice(0, 9)
  const activeItem = results[Math.min(activeIndex, Math.max(0, results.length - 1))]

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    window.requestAnimationFrame(() => inputRef.current?.focus())

    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose, open])

  if (!open) {
    return null
  }

  const openItem = (item: OperationalSearchItem) => {
    navigate(item.path)
    setQuery('')
    setActiveIndex(0)
    onClose()
  }

  return (
    <div className={styles.backdrop} onMouseDown={onClose} role="presentation">
      <section
        aria-label="Paleta de comandos"
        aria-modal="true"
        className={styles.palette}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className={styles.searchRow}>
          <Search aria-hidden size={19} />
          <input
            aria-label="Buscar acciones, entidades y prioridades"
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setActiveIndex((current) => Math.min(results.length - 1, current + 1))
              }

              if (event.key === 'ArrowUp') {
                event.preventDefault()
                setActiveIndex((current) => Math.max(0, current - 1))
              }

              if (event.key === 'Enter' && activeItem) {
                event.preventDefault()
                openItem(activeItem)
              }
            }}
            placeholder="Ir a caso, camion, SKU, proveedor, flete o ejecutar accion..."
            ref={inputRef}
            type="search"
            value={query}
          />
          <kbd>Esc</kbd>
        </div>
        <div className={styles.body}>
          <span className={styles.sectionTitle}>{query ? 'Resultados' : 'Foco operacional ahora'}</span>
          {results.length > 0 ? (
            results.map((item, index) => (
              <button
                className={[styles.item, index === activeIndex ? styles.active : ''].filter(Boolean).join(' ')}
                key={`${item.group}-${item.id}`}
                onClick={() => openItem(item)}
                onMouseEnter={() => setActiveIndex(index)}
                type="button"
              >
                <span className={[styles.typePill, item.tone ? styles[item.tone] : ''].filter(Boolean).join(' ')}>
                  {item.type}
                </span>
                <span className={styles.itemCopy}>
                  <strong>{item.label}</strong>
                  <small>{item.meta}</small>
                </span>
                <span className={styles.actionHint}>Abrir</span>
              </button>
            ))
          ) : (
            <div className={styles.empty}>
              <strong>Sin resultados</strong>
              <span>Prueba por patente, caso, proveedor, cliente, SKU o estado.</span>
            </div>
          )}
        </div>
        <footer className={styles.footer}>
          <span><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
          <span><kbd>Enter</kbd> abrir</span>
          <span>Busca entidades y acciones desde cualquier vista</span>
        </footer>
      </section>
    </div>
  )
}
