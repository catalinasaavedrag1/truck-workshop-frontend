import { useSyncExternalStore } from 'react'

export type ApiStatus = 'unknown' | 'online' | 'offline'

let currentStatus: ApiStatus = 'unknown'
const listeners = new Set<() => void>()

export function getApiStatus(): ApiStatus {
  return currentStatus
}

export function setApiStatus(next: ApiStatus) {
  if (currentStatus === next) {
    return
  }

  currentStatus = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

/**
 * Estado de conexion con el backend, actualizado por el interceptor de httpClient.
 * 'offline' significa que la ultima peticion no obtuvo respuesta (backend caido,
 * sin red o timeout); en ese caso la app sirve datos mock y no persiste cambios.
 */
export function useApiStatus(): ApiStatus {
  return useSyncExternalStore(subscribe, getApiStatus, getApiStatus)
}
