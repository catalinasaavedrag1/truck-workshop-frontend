import { createResource, deleteResource, updateResource } from '../../../shared/services/resourceApi'
import { httpClient } from '../../../shared/services/httpClient'
import { getActorHeaders } from '../../../shared/services/sessionUser'
import type { ApiResponse } from '../../../shared/types/api.types'
import type {
  CommunicationConversation,
  CommunicationConversationPayload,
  CommunicationProviderConfig,
  CommunicationProviderConfigPayload,
  CommunicationProviderTestResponse,
  CommunicationProfile,
  CommunicationProfilePayload,
  CommunicationQuoteLink,
  CommunicationQuoteLinkPayload,
  CommunicationSendPayload,
  CommunicationSendResponse,
} from '../types/communication.types'

export async function createCommunicationProfile(payload: CommunicationProfilePayload) {
  return createResource<CommunicationProfile, CommunicationProfilePayload>('/communications/profiles', payload)
}

export async function updateCommunicationProfile(profileId: string, payload: CommunicationProfilePayload) {
  return updateResource<CommunicationProfile, CommunicationProfilePayload>('/communications/profiles', profileId, payload)
}

export async function createCommunicationProviderConfig(payload: CommunicationProviderConfigPayload) {
  const response = await httpClient.post<ApiResponse<CommunicationProviderConfig>>('/communications/provider-configs', payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export async function updateCommunicationProviderConfig(
  configId: string,
  payload: Partial<CommunicationProviderConfigPayload>,
) {
  const response = await httpClient.patch<ApiResponse<CommunicationProviderConfig>>(
    `/communications/provider-configs/${configId}`,
    payload,
    {
      headers: getActorHeaders(),
    },
  )

  return response.data.data
}

export async function deleteCommunicationProviderConfig(configId: string) {
  return deleteResource<CommunicationProviderConfig>('/communications/provider-configs', configId)
}

export async function testCommunicationProviderConfig(configId: string) {
  const response = await httpClient.post<ApiResponse<CommunicationProviderTestResponse>>(
    `/communications/provider-configs/${configId}/test`,
    undefined,
    {
      headers: getActorHeaders(),
    },
  )

  return response.data.data
}

export async function createCommunicationConversation(payload: CommunicationConversationPayload) {
  return createResource<CommunicationConversation, CommunicationConversationPayload>('/communications/conversations', payload)
}

export async function updateCommunicationConversation(conversationId: string, payload: Partial<CommunicationConversationPayload>) {
  return updateResource<CommunicationConversation, Partial<CommunicationConversationPayload>>(
    '/communications/conversations',
    conversationId,
    payload,
  )
}

export async function sendCommunicationMessage(payload: CommunicationSendPayload) {
  const response = await httpClient.post<ApiResponse<CommunicationSendResponse>>('/communications/send', payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export async function createCommunicationQuoteLink(payload: CommunicationQuoteLinkPayload) {
  return createResource<CommunicationQuoteLink, CommunicationQuoteLinkPayload>('/communications/quote-links', payload)
}
