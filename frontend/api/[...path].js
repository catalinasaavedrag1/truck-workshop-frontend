const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

export default async function handler(request, response) {
  const backendBaseUrl = getBackendBaseUrl()

  if (!backendBaseUrl) {
    response.status(502).json({
      error: 'BACKEND_URL no configurado en Vercel.',
      hint: 'Configura BACKEND_URL con la URL publica del backend, por ejemplo https://tu-backend.com/api.',
    })
    return
  }

  const targetUrl = buildTargetUrl(request, backendBaseUrl)
  const headers = buildForwardHeaders(request.headers)
  const init = {
    headers,
    method: request.method,
  }

  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = serializeBody(request.body)
  }

  try {
    const upstreamResponse = await fetch(targetUrl, init)
    const body = Buffer.from(await upstreamResponse.arrayBuffer())

    upstreamResponse.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        response.setHeader(key, value)
      }
    })

    response.status(upstreamResponse.status).send(body)
  } catch (error) {
    response.status(502).json({
      error: 'No se pudo conectar con el backend publico.',
      detail: error instanceof Error ? error.message : 'Network error',
    })
  }
}

function getBackendBaseUrl() {
  const rawUrl = process.env.BACKEND_URL || process.env.API_BASE_URL || ''

  if (!rawUrl) {
    return ''
  }

  const withoutTrailingSlash = rawUrl.replace(/\/+$/, '')

  return withoutTrailingSlash.endsWith('/api') ? withoutTrailingSlash : `${withoutTrailingSlash}/api`
}

function buildTargetUrl(request, backendBaseUrl) {
  const path = Array.isArray(request.query.path)
    ? request.query.path.join('/')
    : request.query.path || ''
  const url = new URL(request.url || '', 'https://vercel.local')

  url.searchParams.delete('path')

  return `${backendBaseUrl}/${path}${url.search}`
}

function buildForwardHeaders(sourceHeaders) {
  const headers = {}

  Object.entries(sourceHeaders || {}).forEach(([key, value]) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase()) && value !== undefined) {
      headers[key] = Array.isArray(value) ? value.join(', ') : String(value)
    }
  })

  return headers
}

function serializeBody(body) {
  if (body === undefined || body === null) {
    return undefined
  }

  if (typeof body === 'string' || Buffer.isBuffer(body)) {
    return body
  }

  return JSON.stringify(body)
}
