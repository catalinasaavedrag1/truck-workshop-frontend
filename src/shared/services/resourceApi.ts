import { httpClient } from './httpClient'
import type { ApiResponse, PaginatedApiResponse } from '../types/api.types'

export async function listResource<T>(path: string, fallback: T[], params: Record<string, string | number> = {}) {
  try {
    const response = await httpClient.get<PaginatedApiResponse<T>>(path, {
      params: { limit: 100, ...params },
    })

    return response.data.data
  } catch {
    return fallback
  }
}

export async function getResourceById<T extends { id: string }>(path: string, id: string, fallback: T[]) {
  try {
    const response = await httpClient.get<ApiResponse<T>>(`${path}/${id}`)

    return response.data.data
  } catch {
    return fallback.find((item) => item.id === id)
  }
}

export async function createResource<TResponse, TPayload = Partial<TResponse>>(path: string, payload: TPayload) {
  const response = await httpClient.post<ApiResponse<TResponse>>(path, payload)

  return response.data.data
}

export async function updateResource<TResponse, TPayload = Partial<TResponse>>(path: string, id: string, payload: TPayload) {
  const response = await httpClient.patch<ApiResponse<TResponse>>(`${path}/${id}`, payload)

  return response.data.data
}

export async function deleteResource<TResponse>(path: string, id: string) {
  const response = await httpClient.delete<ApiResponse<TResponse>>(`${path}/${id}`)

  return response.data.data
}
