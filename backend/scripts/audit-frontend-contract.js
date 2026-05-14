import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { allCrudResources, assignmentResource, workshopCaseResource } from '../src/config/resources.js'

const scriptDir = fileURLToPath(new URL('.', import.meta.url))
const projectRoot = resolve(scriptDir, '../..')
const frontendSrc = resolve(projectRoot, 'frontend/src')

const resourceRouteAliases = new Map([
  ['diagnostic-checklists', ['/checklists']],
  ['fuel-records', ['/fuel']],
  ['labor-tasks', ['/labor']],
  ['roles', ['/permissions']],
  ['preventive-maintenance-plans', ['/preventive-maintenance']],
  ['sla-configs', ['/sla']],
  ['tire-lifecycles', ['/tire-performance']],
  ['truck-health-scores', ['/fleet/health-score']],
  [workshopCaseResource.name, ['/cases']],
  [assignmentResource.name, ['/assignments']],
])

const specializedRoutePrefixes = [
  '/auth',
  '/health',
  '/approvals',
  '/communications',
  '/customers',
  '/dashboard',
  '/diagnostics',
  '/driver-trip-sheets',
  '/fleet/health-scores',
  '/fuel/prices',
  '/freight/assignments',
  '/freight/pricing',
  '/maps',
  '/mechanics',
  '/parts',
  '/permissions/roles',
  '/permissions/user-roles',
  '/purchase-orders',
  '/quotes',
  '/reports',
  '/schedule',
  '/suppliers',
  '/tire-performance',
  '/truck-costs',
  '/truck-documents',
  '/warehouse/locations',
  '/workshop-cases',
]

const endpointPatterns = [
  /useResource(?:List|Item)<[^>]*>\(\s*['"]([^'"]+)/g,
  /useResource(?:List|Item)\(\s*['"]([^'"]+)/g,
  /(?:fetchResourceList|fetchResourceById|listResource|getResourceById|createResource|updateResource|deleteResource)<[^>]*>\(\s*['"]([^'"]+)/g,
  /(?:fetchResourceList|fetchResourceById|listResource|getResourceById|createResource|updateResource|deleteResource)\(\s*['"]([^'"]+)/g,
  /httpClient\.(?:get|post|put|patch|delete)<[^>]*>\(\s*['"]([^'"]+)/g,
  /httpClient\.(?:get|post|put|patch|delete)\(\s*['"]([^'"]+)/g,
]

function collectFrontendFiles(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    const stat = statSync(path)

    if (stat.isDirectory()) {
      collectFrontendFiles(path, files)
      continue
    }

    if (/\.(ts|tsx)$/.test(name)) {
      files.push(path)
    }
  }

  return files
}

function collectFrontendEndpointUsages() {
  const usages = new Map()

  for (const file of collectFrontendFiles(frontendSrc)) {
    const text = readFileSync(file, 'utf8')

    for (const pattern of endpointPatterns) {
      for (const match of text.matchAll(pattern)) {
        const endpoint = match[1]

        if (!endpoint.startsWith('/')) {
          continue
        }

        const files = usages.get(endpoint) || []
        files.push(file.replace(projectRoot, '').replace(/\\/g, '/').replace(/^\//, ''))
        usages.set(endpoint, files)
      }
    }
  }

  return usages
}

function getBackendRoutePrefixes() {
  const routes = new Set(specializedRoutePrefixes)

  for (const resource of allCrudResources) {
    routes.add(resource.route)

    for (const alias of resourceRouteAliases.get(resource.name) || []) {
      routes.add(alias)
    }
  }

  return [...routes].sort((first, second) => second.length - first.length)
}

function isEndpointCovered(endpoint, backendRoutes) {
  return backendRoutes.some((route) => endpoint === route || endpoint.startsWith(`${route}/`))
}

function auditFrontendContract() {
  const usages = collectFrontendEndpointUsages()
  const backendRoutes = getBackendRoutePrefixes()
  const missing = [...usages.keys()]
    .sort()
    .filter((endpoint) => !isEndpointCovered(endpoint, backendRoutes))
    .map((endpoint) => ({
      endpoint,
      files: [...new Set(usages.get(endpoint))].slice(0, 8),
    }))

  return {
    backendRoutes: backendRoutes.length,
    checkedEndpoints: usages.size,
    missing,
  }
}

const report = auditFrontendContract()

if (report.missing.length > 0) {
  console.error(JSON.stringify(report, null, 2))
  process.exit(1)
}

console.log(`Frontend/backend contract OK. ${report.checkedEndpoints} frontend endpoints covered by ${report.backendRoutes} backend routes.`)
