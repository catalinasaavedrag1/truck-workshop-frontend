const defaultApiBaseUrl = import.meta.env.PROD ? '/api' : 'http://localhost:4000/api'

export const env = {
  allowMockFallback: import.meta.env.VITE_ALLOW_MOCK_FALLBACK === 'true' || (import.meta.env.DEV && import.meta.env.VITE_ALLOW_MOCK_FALLBACK !== 'false'),
  appName: import.meta.env.VITE_APP_NAME || 'Truck Workshop',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl,
}
