import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(scriptDir, '..')
const backendRoot = path.resolve(frontendRoot, '..', 'backend')

const processes = [
  {
    args: ['run', 'dev'],
    cwd: backendRoot,
    name: 'api',
  },
  {
    args: ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5181'],
    cwd: frontendRoot,
    name: 'web',
  },
]

const runningProcesses = processes.map(({ args, cwd, name }) => {
  const child = spawn(npmCommand, args, {
    cwd,
    env: {
      ...process.env,
      DATA_DRIVER: process.env.DATA_DRIVER || 'memory',
      PORT: process.env.PORT || '4000',
      VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
    },
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[${name}] ${chunk}`)
  })

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[${name}] ${chunk}`)
  })

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`)
      shutdown()
    }
  })

  return child
})

function shutdown() {
  for (const child of runningProcesses) {
    if (!child.killed) {
      child.kill()
    }
  }
}

process.on('SIGINT', () => {
  shutdown()
  process.exit(0)
})

process.on('SIGTERM', () => {
  shutdown()
  process.exit(0)
})
