import axios from 'axios'

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
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
