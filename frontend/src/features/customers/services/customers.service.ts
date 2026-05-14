import { createResource, deleteResource, updateResource } from '../../../shared/services/resourceApi'
import type { Customer, CustomerPayload } from '../types/customer.types'

const CUSTOMERS_PATH = '/customers'

export async function createCustomer(payload: CustomerPayload) {
  return createResource<Customer, CustomerPayload>(CUSTOMERS_PATH, payload)
}

export async function updateCustomer(customerId: string, payload: CustomerPayload) {
  return updateResource<Customer, CustomerPayload>(CUSTOMERS_PATH, customerId, payload)
}

export async function deleteCustomer(customerId: string) {
  return deleteResource<Customer>(CUSTOMERS_PATH, customerId)
}
