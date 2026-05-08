import { env } from '../../config/env.js'
import { MemoryResourceRepository } from './memory-resource-repository.js'
import { ResourceRepository } from './resource-repository.js'

export function createRepository(resource) {
  return env.dataDriver === 'memory'
    ? new MemoryResourceRepository(resource)
    : new ResourceRepository(resource)
}
