import { httpClient } from '../../../shared/services/httpClient'
import { getActorHeaders } from '../../../shared/services/sessionUser'
import type { ApiResponse } from '../../../shared/types/api.types'
import type { Customer, CustomerPayload } from '../types/customer.types'

export async function createCustomer(payload: CustomerPayload) {
  const response = await httpClient.post<ApiResponse<Customer>>('/customers', payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export async function updateCustomer(customerId: string, payload: CustomerPayload) {
  const response = await httpClient.patch<ApiResponse<Customer>>(`/customers/${customerId}`, payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export async function deleteCustomer(customerId: string) {
  const response = await httpClient.delete<ApiResponse<Customer>>(`/customers/${customerId}`, {
    headers: getActorHeaders(),
  })

  return response.data.data
}
