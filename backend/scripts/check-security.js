import assert from 'node:assert/strict'
import { env } from '../src/config/env.js'
import { ResourceService } from '../src/shared/data/resource-service.js'
import { parsePaginationOptions, parseSortOrder } from '../src/shared/data/query-options.js'
import { signJwt, verifyJwt } from '../src/shared/security/jwt.js'
import { hashPassword, verifyPassword } from '../src/shared/security/password.js'
import { hasPermission, requiredPermissionForRequest } from '../src/shared/security/permission-rules.js'
import { stripImmutableFields } from '../src/shared/utils/payload-sanitizers.js'

const passwordHash = hashPassword('correct-password', { salt: 'security-check-salt' })

assert.equal(verifyPassword('correct-password', passwordHash), true)
assert.equal(verifyPassword('wrong-password', passwordHash), false)

const token = signJwt(
  {
    email: 'admin@truckworkshop.cl',
    permissions: ['permissions.manage'],
    role: 'ADMIN',
    sub: 'user-001',
  },
  {
    expiresInSeconds: 60,
    secret: env.jwtSecret,
  },
)
const payload = verifyJwt(token, { secret: env.jwtSecret })

assert.equal(payload.sub, 'user-001')
assert.equal(requiredPermissionForRequest('POST', '/permissions/roles'), 'permissions.manage')
assert.equal(requiredPermissionForRequest('GET', '/reports'), 'reports.view')
assert.equal(requiredPermissionForRequest('POST', '/cases/case-001/assignments'), 'cases.assign')
assert.equal(requiredPermissionForRequest('POST', '/workshop-cases/case-001/close'), 'cases.close')
assert.equal(hasPermission({ permissions: ['reports.view'], role: 'SUPERVISOR' }, 'reports.view'), true)
assert.equal(hasPermission({ permissions: [], role: 'MECANICO' }, 'reports.view'), false)
assert.equal(hasPermission({ permissions: [], role: 'ADMIN' }, 'anything.manage'), true)

const service = new ResourceService({ resource: { fields: ['id', 'name'] } })
assert.deepEqual(service.validatePayload({ id: 'resource-1', name: 'OK' }), { id: 'resource-1', name: 'OK' })
assert.throws(() => service.validatePayload({ name: 'OK', unexpected: true }), /campos no permitidos/)

assert.deepEqual(parsePaginationOptions({ limit: 999, page: '-3' }), { limit: 100, offset: 0, page: 1 })
assert.equal(parseSortOrder('ASC'), 'asc')
assert.equal(parseSortOrder('drop table'), 'desc')
assert.deepEqual(
  stripImmutableFields({ createdAt: 'x', createdBy: 'x', deletedBy: 'x', id: 'x', name: 'OK' }, ['deletedBy']),
  { name: 'OK' },
)

console.log('Backend auth security checks OK.')
