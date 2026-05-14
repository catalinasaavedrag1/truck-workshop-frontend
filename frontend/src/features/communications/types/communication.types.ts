export type CommunicationChannel = 'whatsapp' | 'email'
export type CommunicationProvider = 'whatsapp_cloud' | 'microsoft_graph'
export type CommunicationDeliveryMode = 'simulation' | 'live'
export type CommunicationProfileStatus = 'active' | 'inactive'
export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'archived'
export type ConversationPriority = 'low' | 'medium' | 'high' | 'urgent'
export type MessageDirection = 'inbound' | 'outbound'
export type MessageStatus = 'draft' | 'queued' | 'sent' | 'delivered' | 'read' | 'failed'
export type CommunicationQuoteType = 'workshop' | 'freight'

export interface CommunicationProfile {
  id: string
  name: string
  channel: CommunicationChannel
  address: string
  ownerName: string
  department: string
  status: CommunicationProfileStatus
  isDefault: boolean
  signature?: string
  notes?: string
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface CommunicationProviderConfig {
  id: string
  name: string
  channel: CommunicationChannel
  provider: CommunicationProvider
  deliveryMode: CommunicationDeliveryMode
  profileId?: string
  profileName?: string
  isActive: boolean
  fromAddress?: string
  whatsappPhoneNumberId?: string
  whatsappBusinessAccountId?: string
  whatsappAccessToken?: string
  whatsappApiVersion?: string
  whatsappWebhookVerifyToken?: string
  whatsappAppSecret?: string
  outlookTenantId?: string
  outlookClientId?: string
  outlookClientSecret?: string
  outlookUserPrincipalName?: string
  outlookSaveToSentItems?: boolean
  hasWhatsappAccessToken?: boolean
  hasWhatsappAppSecret?: boolean
  hasOutlookClientSecret?: boolean
  lastTestAt?: string
  lastTestStatus?: string
  lastError?: string
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface CommunicationConversation {
  id: string
  channel: CommunicationChannel
  profileId: string
  profileName: string
  contactName: string
  contactAddress: string
  relatedEntityType?: string
  relatedEntityId?: string
  relatedEntityLabel?: string
  subject: string
  status: ConversationStatus
  priority: ConversationPriority
  assignedTo: string
  lastMessageAt: string
  lastMessagePreview: string
  unreadCount: number
  tags: string[]
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface CommunicationMessage {
  id: string
  conversationId: string
  channel: CommunicationChannel
  profileId: string
  direction: MessageDirection
  status: MessageStatus
  fromName: string
  fromAddress: string
  toName: string
  toAddress: string
  subject?: string
  body: string
  sentAt: string
  deliveredAt?: string
  readAt?: string
  errorMessage?: string
  attachments: string[]
  provider?: CommunicationProvider | 'simulation'
  providerConfigId?: string
  providerMessageId?: string
  providerStatus?: string
  sentByIntegration?: boolean
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface CommunicationQuoteLink {
  id: string
  conversationId: string
  quoteType: CommunicationQuoteType
  quoteId: string
  quoteNumber: string
  customerName: string
  status: string
  total: number
  linkedBy: string
  notes?: string
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
  createdAt?: string
  updatedAt?: string
}

export type CommunicationProfilePayload = Omit<CommunicationProfile, 'id' | 'createdAt' | 'updatedAt' | 'deletedBy'>
export type CommunicationProviderConfigPayload = Omit<
  CommunicationProviderConfig,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedBy'
  | 'hasWhatsappAccessToken'
  | 'hasWhatsappAppSecret'
  | 'hasOutlookClientSecret'
>
export type CommunicationConversationPayload = Omit<CommunicationConversation, 'id' | 'createdAt' | 'updatedAt' | 'deletedBy'>
export type CommunicationMessagePayload = Omit<CommunicationMessage, 'id' | 'createdAt' | 'updatedAt' | 'deletedBy'>
export type CommunicationQuoteLinkPayload = Omit<CommunicationQuoteLink, 'id' | 'createdAt' | 'updatedAt' | 'deletedBy'>

export interface CommunicationSendPayload {
  attachments?: string[]
  body: string
  conversationId: string
  createdBy?: string
  profileId?: string
  subject?: string
  updatedBy?: string
}

export interface CommunicationSendResponse {
  conversation: CommunicationConversation
  message: CommunicationMessage
  providerResult: {
    mode: CommunicationDeliveryMode
    provider: CommunicationProvider | 'simulation'
    providerMessageId?: string
    providerStatus: string
    simulated?: boolean
  }
}

export interface CommunicationProviderTestResponse {
  config: CommunicationProviderConfig
  result: {
    mode: CommunicationDeliveryMode
    ok: boolean
    provider: CommunicationProvider
    status: string
  }
}
