import axios from 'axios'

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message ?? error.response?.data?.error?.message
    return typeof message === 'string' ? message : error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Error inesperado'
}
