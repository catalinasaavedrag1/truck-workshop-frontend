import { useSyncExternalStore } from 'react'

export type ToastTone = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  tone: ToastTone
  title: string
  description?: string
  /** Milisegundos antes de auto-cerrar. 0 desactiva el auto-cierre. */
  duration: number
}

interface ToastInput {
  tone?: ToastTone
  title: string
  description?: string
  duration?: number
}

const DEFAULT_DURATION = 4500

let toasts: Toast[] = []
let sequence = 0
const listeners = new Set<() => void>()
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): Toast[] {
  return toasts
}

/** Agrega un toast a la cola global. Devuelve su id para poder cerrarlo manualmente. */
export function pushToast(input: ToastInput): string {
  sequence += 1
  const id = `toast-${sequence}`
  const toast: Toast = {
    id,
    tone: input.tone ?? 'info',
    title: input.title,
    description: input.description,
    duration: input.duration ?? DEFAULT_DURATION,
  }

  toasts = [...toasts, toast]
  emit()

  if (toast.duration > 0) {
    const timer = setTimeout(() => dismissToast(id), toast.duration)
    timers.set(id, timer)
  }

  return id
}

export function dismissToast(id: string) {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }

  const next = toasts.filter((toast) => toast.id !== id)
  if (next.length === toasts.length) {
    return
  }
  toasts = next
  emit()
}

/** Atajos semanticos para los casos mas comunes. */
export const toast = {
  success: (title: string, description?: string) => pushToast({ tone: 'success', title, description }),
  error: (title: string, description?: string) =>
    pushToast({ tone: 'error', title, description, duration: 7000 }),
  info: (title: string, description?: string) => pushToast({ tone: 'info', title, description }),
  warning: (title: string, description?: string) => pushToast({ tone: 'warning', title, description }),
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
