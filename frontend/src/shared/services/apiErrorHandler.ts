import axios from 'axios'

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    // Sin `response`: la peticion no llego al backend (caido, sin red o timeout).
    if (!error.response) {
      return 'No se pudo conectar con el backend. Verifica que el servidor este corriendo (modo demo: los cambios no se guardan).'
    }

    const data = error.response?.data
    const message = data?.message ?? data?.error?.message ?? data?.error
    const hint = data?.hint

    if (typeof message === 'string' && typeof hint === 'string') {
      return `${message} ${hint}`
    }

    return typeof message === 'string' ? message : error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Error inesperado'
}
