import { allCrudResources } from './resources.js'

export function resourceByName(name) {
  const resource = allCrudResources.find((item) => item.name === name)

  if (!resource) {
    throw new Error(`Resource ${name} no configurado`)
  }

  return resource
}
