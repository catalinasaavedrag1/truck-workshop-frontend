import axios, { AxiosHeaders } from 'axios'
import { env } from '../../config/env'
import { setApiStatus } from './apiStatus'
import { getActorHeaders } from './sessionUser'

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  const requestId = createClientRequestId()
  const headers = AxiosHeaders.from(config.headers)
  const session = getStoredSession()

  headers.set('X-Request-Id', requestId)
  const actorHeaders = getActorHeaders()
  headers.set('X-User-Id', actorHeaders['x-user-id'])
  headers.set('X-User-Name', actorHeaders['x-user-name'])

  if (session?.token) {
    headers.set('Authorization', `Bearer ${session.token}`)
  }

  config.headers = headers

  return config
})

httpClient.interceptors.response.use(
  (response) => {
    setApiStatus('online')

    return response
  },
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    // Sin `response` = la peticion no llego al servidor (backend caido, sin red
    // o timeout). Con `response` el backend contesto, aunque sea un 4xx/5xx.
    setApiStatus(error.response ? 'online' : 'offline')

    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('truck-workshop-session')
    }

    return Promise.reject(error)
  },
)

function createClientRequestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `web-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getStoredSession() {
  if (typeof window === 'undefined') {
    return undefined
  }

  try {
    return JSON.parse(localStorage.getItem('truck-workshop-session') || '{}') as { token?: string }
  } catch {
    return undefined
  }
}
