import { createResource, deleteResource, listResource, updateResource } from '../../../shared/services/resourceApi'
import { httpClient } from '../../../shared/services/httpClient'
import type { ApiResponse } from '../../../shared/types/api.types'
import {
  communicationConversationsMock,
  communicationMessagesMock,
  communicationProviderConfigsMock,
  communicationProfilesMock,
  communicationQuoteLinksMock,
} from '../mocks/communications.mock'
import type {
  CommunicationConversation,
  CommunicationConversationPayload,
  CommunicationMessage,
  CommunicationMessagePayload,
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

export async function getCommunicationProfiles() {
  return listResource<CommunicationProfile>('/communications/profiles', communicationProfilesMock, {
    order: 'asc',
    sort: 'name',
  })
}

export async function createCommunicationProfile(payload: CommunicationProfilePayload) {
  return createResource<CommunicationProfile, CommunicationProfilePayload>('/communications/profiles', payload)
}

export async function updateCommunicationProfile(profileId: string, payload: CommunicationProfilePayload) {
  return updateResource<CommunicationProfile, CommunicationProfilePayload>('/communications/profiles', profileId, payload)
}

export async function getCommunicationProviderConfigs() {
  return listResource<CommunicationProviderConfig>('/communications/provider-configs', communicationProviderConfigsMock, {
    order: 'desc',
    sort: 'updatedAt',
  })
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

export async function getCommunicationConversations() {
  return listResource<CommunicationConversation>('/communications/conversations', communicationConversationsMock, {
    order: 'desc',
    sort: 'lastMessageAt',
  })
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

export async function getCommunicationMessages() {
  return listResource<CommunicationMessage>('/communications/messages', communicationMessagesMock, {
    order: 'asc',
    sort: 'sentAt',
  })
}

export async function createCommunicationMessage(payload: CommunicationMessagePayload) {
  return createResource<CommunicationMessage, CommunicationMessagePayload>('/communications/messages', payload)
}

export async function sendCommunicationMessage(payload: CommunicationSendPayload) {
  const response = await httpClient.post<ApiResponse<CommunicationSendResponse>>('/communications/send', payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export async function getCommunicationQuoteLinks() {
  return listResource<CommunicationQuoteLink>('/communications/quote-links', communicationQuoteLinksMock, {
    order: 'desc',
    sort: 'createdAt',
  })
}

export async function createCommunicationQuoteLink(payload: CommunicationQuoteLinkPayload) {
  return createResource<CommunicationQuoteLink, CommunicationQuoteLinkPayload>('/communications/quote-links', payload)
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
