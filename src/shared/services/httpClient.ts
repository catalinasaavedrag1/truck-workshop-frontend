import axios, { AxiosHeaders } from 'axios'
import { env } from '../../config/env'

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

  headers.set('X-Request-Id', requestId)
  config.headers = headers

  return config
})

function createClientRequestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `web-${Date.now()}-${Math.random().toString(16).slice(2)}`
}
