import { httpClient } from '../../../shared/services/httpClient'
import type { ApiResponse } from '../../../shared/types/api.types'
import type { Supplier } from '../types/supplier.types'

export type SupplierPayload = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

export async function createSupplier(payload: SupplierPayload) {
  const response = await httpClient.post<ApiResponse<Supplier>>('/suppliers', payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export async function updateSupplier(supplierId: string, payload: SupplierPayload) {
  const response = await httpClient.patch<ApiResponse<Supplier>>(`/suppliers/${supplierId}`, payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export async function deleteSupplier(supplierId: string) {
  const response = await httpClient.delete<ApiResponse<Supplier>>(`/suppliers/${supplierId}`, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

function getActorHeaders() {
  const user = getSessionUser()

  return {
    'x-user-id': user.id,
    'x-user-name': user.name,
  }
}

function getSessionUser() {
  if (typeof window === 'undefined') {
    return { id: 'system', name: 'Sistema' }
  }

  try {
    const session = JSON.parse(localStorage.getItem('truck-workshop-session') || '{}')

    return {
      id: session.user?.id || 'system',
      name: session.user?.name || 'Sistema',
    }
  } catch {
    return { id: 'system', name: 'Sistema' }
  }
}
