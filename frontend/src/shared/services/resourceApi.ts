import { httpClient } from './httpClient'
import { env } from '../../config/env'
import type { ApiResponse, PaginatedApiResponse } from '../types/api.types'

interface ResourceRequestOptions {
  signal?: AbortSignal
}

export async function fetchResourceList<T>(
  path: string,
  params: Record<string, string | number> = {},
  options: ResourceRequestOptions = {},
) {
  const response = await httpClient.get<PaginatedApiResponse<T>>(path, {
    params: { limit: 100, ...params },
    signal: options.signal,
  })

  return response.data.data
}

export async function fetchResourceById<T extends { id: string }>(
  path: string,
  id: string,
  options: ResourceRequestOptions = {},
) {
  const response = await httpClient.get<ApiResponse<T>>(`${path}/${id}`, {
    signal: options.signal,
  })

  return response.data.data
}

export async function listResource<T>(path: string, fallback: T[], params: Record<string, string | number> = {}) {
  try {
    return await fetchResourceList<T>(path, params)
  } catch (error) {
    return resolveMockFallback(path, fallback, error)
  }
}

export async function getResourceById<T extends { id: string }>(path: string, id: string, fallback: T[]) {
  try {
    return await fetchResourceById<T>(path, id)
  } catch (error) {
    return resolveMockFallback(`${path}/${id}`, fallback, error).find((item) => item.id === id)
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

export function shouldUseMockFallback() {
  return env.allowMockFallback
}

export function resolveMockFallback<T>(path: string, fallback: T[], error: unknown) {
  if (!shouldUseMockFallback()) {
    throw error
  }

  console.warn(`API no disponible para ${path}. Usando fallback mock controlado.`, error)

  return fallback
}
