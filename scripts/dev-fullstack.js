import { spawn } from 'node:child_process'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const processes = [
  {
    args: ['--prefix', 'backend', 'run', 'dev'],
    name: 'api',
  },
  {
    args: ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5181'],
    name: 'web',
  },
]

const runningProcesses = processes.map(({ args, name }) => {
  const child = spawn(npmCommand, args, {
    env: {
      ...process.env,
      DATA_DRIVER: process.env.DATA_DRIVER || 'memory',
      PORT: process.env.PORT || '4000',
      VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
    },
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
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
