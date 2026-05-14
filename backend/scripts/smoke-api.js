process.env.NODE_ENV = 'test'
process.env.DATA_DRIVER = 'memory'
process.env.AUTH_REQUIRED = 'true'
process.env.AUTH_ENFORCE_PERMISSIONS = 'true'
process.env.AUTH_ALLOW_DEVELOPMENT_LOGIN = 'true'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'development-smoke-secret'

const { createApp } = await import('../src/app.js')

const app = createApp()
const server = app.listen(0)
const baseUrl = `http://127.0.0.1:${server.address().port}/api`

try {
  await assertStatus(`${baseUrl}/health`, { method: 'GET' }, 200)
  await assertStatus(`${baseUrl}/reports`, { method: 'GET' }, 401)

  const loginResponse = await fetch(`${baseUrl}/auth/login`, {
    body: JSON.stringify({
      email: 'admin@truckworkshop.cl',
      password: 'truckworkshop',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  assertEqual(loginResponse.status, 200, 'login status')

  const session = await loginResponse.json()
  const token = session.data?.token

  assertEqual(typeof token, 'string', 'login token')
  await assertStatus(`${baseUrl}/reports`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: 'GET',
  }, 200)

  console.log('Backend API smoke checks OK.')
} finally {
  await new Promise((resolve) => server.close(resolve))
}

async function assertStatus(url, options, expectedStatus) {
  const response = await fetch(url, options)

  assertEqual(response.status, expectedStatus, `${options.method} ${url}`)
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`)
  }
}
