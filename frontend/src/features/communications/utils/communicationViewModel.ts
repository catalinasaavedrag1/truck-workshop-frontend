import { ROUTES } from '../../../config/routes'
import type {
  CommunicationChannel,
  CommunicationConversation,
  CommunicationDeliveryMode,
  CommunicationMessage,
  CommunicationProvider,
  CommunicationProviderConfig,
  CommunicationQuoteLink,
  CommunicationQuoteLinkPayload,
  CommunicationQuoteType,
} from '../types/communication.types'

export type ConversationFilter = 'all' | 'open' | 'pending' | 'urgent' | 'unread' | 'whatsapp' | 'email' | 'sent' | 'quotes'

export interface QuoteReference {
  customerName: string
  detailPath: string
  entityType: 'quote' | 'freight-quote'
  expiresAt: string
  id: string
  key: string
  number: string
  status: string
  total: number
  type: CommunicationQuoteType
}

export function providerLabel(provider: CommunicationProvider | 'simulation') {
  const labels: Record<CommunicationProvider | 'simulation', string> = {
    microsoft_graph: 'Outlook Graph',
    simulation: 'Simulacion',
    whatsapp_cloud: 'WhatsApp Cloud',
  }

  return labels[provider]
}

export function deliveryModeLabel(mode: CommunicationDeliveryMode) {
  return mode === 'live' ? 'envio real' : 'simulacion'
}

export function defaultProviderForChannel(channel: CommunicationChannel): CommunicationProvider {
  return channel === 'whatsapp' ? 'whatsapp_cloud' : 'microsoft_graph'
}

export function isProviderForChannel(provider: CommunicationProvider, channel: CommunicationChannel) {
  return channel === 'whatsapp' ? provider === 'whatsapp_cloud' : provider === 'microsoft_graph'
}

export function findIntegrationForConversation(
  configs: CommunicationProviderConfig[],
  channel: CommunicationChannel,
  profileId?: string,
) {
  return configs.find((config) => config.channel === channel && config.isActive && config.profileId === profileId)
    || configs.find((config) => config.channel === channel && config.isActive)
}

export function matchesConversationFilter(
  conversation: CommunicationConversation,
  filter: ConversationFilter,
  messages: CommunicationMessage[],
  quoteLinks: CommunicationQuoteLink[],
) {
  if (filter === 'open') return conversation.status === 'open'
  if (filter === 'pending') return conversation.status === 'pending'
  if (filter === 'urgent') return conversation.priority === 'urgent'
  if (filter === 'unread') return conversation.unreadCount > 0
  if (filter === 'whatsapp') return conversation.channel === 'whatsapp'
  if (filter === 'email') return conversation.channel === 'email'
  if (filter === 'sent') return messages.some((message) => message.conversationId === conversation.id && message.direction === 'outbound')
  if (filter === 'quotes') return isQuoteConversation(conversation, quoteLinks)

  return true
}

export function getConversationQuoteReferences(
  conversation: CommunicationConversation,
  quoteLinks: CommunicationQuoteLink[],
  quoteReferences: QuoteReference[],
) {
  const references = quoteLinks
    .filter((link) => link.conversationId === conversation.id)
    .map((link) => quoteReferences.find((quote) => quote.type === link.quoteType && quote.id === link.quoteId) || quoteReferenceFromLink(link))

  const directReference = quoteReferences.find(
    (quote) => quote.entityType === conversation.relatedEntityType && quote.id === conversation.relatedEntityId,
  )

  return uniqueQuoteReferences(directReference ? [directReference, ...references] : references)
}

export function isQuoteConversation(conversation: CommunicationConversation, quoteLinks: CommunicationQuoteLink[]) {
  return (
    conversation.relatedEntityType === 'quote' ||
    conversation.relatedEntityType === 'freight-quote' ||
    quoteLinks.some((link) => link.conversationId === conversation.id)
  )
}

export function isConversationLinkedToEntity(
  conversation: CommunicationConversation,
  quoteLinks: CommunicationQuoteLink[],
  entityType: string,
  entityId: string,
) {
  if (conversation.relatedEntityType === entityType && conversation.relatedEntityId === entityId) {
    return true
  }

  return quoteLinks.some(
    (link) =>
      link.conversationId === conversation.id &&
      quoteTypeToEntityType(link.quoteType) === entityType &&
      link.quoteId === entityId,
  )
}

export function buildQuoteLinkPayload(
  conversationId: string,
  quote: QuoteReference,
  actorName: string,
  notes?: string,
): CommunicationQuoteLinkPayload {
  return {
    conversationId,
    createdBy: actorName,
    customerName: quote.customerName,
    linkedBy: actorName,
    notes,
    quoteId: quote.id,
    quoteNumber: quote.number,
    quoteType: quote.type,
    status: quote.status,
    total: quote.total,
    updatedBy: actorName,
  }
}

export function mergeById<T extends { id: string }>(backendData: T[], localData: T[]) {
  const localById = new Map(localData.map((item) => [item.id, item]))

  return [
    ...backendData.filter((item) => !localById.has(item.id)),
    ...localData,
  ]
}

export function byLastMessageDesc(first: CommunicationConversation, second: CommunicationConversation) {
  return new Date(second.lastMessageAt).getTime() - new Date(first.lastMessageAt).getTime()
}

export function bySentAtAsc(first: CommunicationMessage, second: CommunicationMessage) {
  return new Date(first.sentAt).getTime() - new Date(second.sentAt).getTime()
}

export function byUpdatedDesc(first: { updatedAt?: string; createdAt?: string }, second: { updatedAt?: string; createdAt?: string }) {
  return new Date(second.updatedAt || second.createdAt || '').getTime() - new Date(first.updatedAt || first.createdAt || '').getTime()
}

export function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function splitTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function quoteReferenceFromLink(link: CommunicationQuoteLink): QuoteReference {
  return {
    customerName: link.customerName,
    detailPath: link.quoteType === 'freight' ? ROUTES.freightQuoteDetail(link.quoteId) : ROUTES.quoteDetail(link.quoteId),
    entityType: link.quoteType === 'freight' ? 'freight-quote' : 'quote',
    expiresAt: '',
    id: link.quoteId,
    key: `${link.quoteType}:${link.quoteId}`,
    number: link.quoteNumber,
    status: link.status,
    total: link.total,
    type: link.quoteType,
  }
}

function uniqueQuoteReferences(references: QuoteReference[]) {
  const byKey = new Map<string, QuoteReference>()

  references.forEach((reference) => {
    byKey.set(reference.key, reference)
  })

  return [...byKey.values()]
}

function quoteTypeToEntityType(type: CommunicationQuoteType) {
  return type === 'freight' ? 'freight-quote' : 'quote'
}
