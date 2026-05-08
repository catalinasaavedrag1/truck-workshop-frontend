import { execFileSync } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const roots = ['src', 'scripts']

function listJavaScriptFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const absolutePath = join(directory, entry)
    const stat = statSync(absolutePath)

    if (stat.isDirectory()) {
      return listJavaScriptFiles(absolutePath)
    }

    return entry.endsWith('.js') ? [absolutePath] : []
  })
}

for (const file of roots.flatMap(listJavaScriptFiles)) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' })
}

console.log('Backend JavaScript syntax OK.')
