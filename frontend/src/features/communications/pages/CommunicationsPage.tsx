import type { FormEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AtSign, CheckCircle2, Mail, MessageCircle, MessagesSquare, Plug, Plus, Send, Trash2, UserPlus } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { Input } from '../../../shared/components/Input/Input'
import { Modal } from '../../../shared/components/Modal/Modal'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { Select } from '../../../shared/components/Select/Select'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { toast } from '../../../shared/services/toastStore'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { freightQuotesMock } from '../../freight/mocks/freight.mock'
import type { FreightQuote } from '../../freight/types/freight.types'
import { quotesMock } from '../../quotes/mocks/quotes.mock'
import type { Quote } from '../../quotes/types/quote.types'
import {
  communicationConversationsMock,
  communicationMessagesMock,
  communicationProviderConfigsMock,
  communicationProfilesMock,
  communicationQuoteLinksMock,
} from '../mocks/communications.mock'
import {
  createCommunicationConversation,
  createCommunicationProviderConfig,
  createCommunicationProfile,
  createCommunicationQuoteLink,
  deleteCommunicationProviderConfig,
  sendCommunicationMessage,
  testCommunicationProviderConfig,
  updateCommunicationConversation,
  updateCommunicationProviderConfig,
  updateCommunicationProfile,
} from '../services/communications.service'
import type {
  CommunicationChannel,
  CommunicationConversation,
  CommunicationConversationPayload,
  CommunicationDeliveryMode,
  CommunicationMessage,
  CommunicationProvider,
  CommunicationProviderConfig,
  CommunicationProviderConfigPayload,
  CommunicationProfile,
  CommunicationProfilePayload,
  CommunicationQuoteLink,
  ConversationPriority,
  ConversationStatus,
  MessageStatus,
} from '../types/communication.types'
import {
  channelOptions,
  deliveryModeOptions,
  priorityOptions,
  profileStatusOptions,
  providerOptions,
  relatedEntityOptions,
} from '../utils/communicationOptions'
import type { ConversationFilter, QuoteReference } from '../utils/communicationViewModel'
import {
  buildQuoteLinkPayload,
  byLastMessageDesc,
  bySentAtAsc,
  byUpdatedDesc,
  defaultProviderForChannel,
  deliveryModeLabel,
  findIntegrationForConversation,
  getConversationQuoteReferences,
  isConversationLinkedToEntity,
  isProviderForChannel,
  isQuoteConversation,
  matchesConversationFilter,
  mergeById,
  normalizeSearch,
  providerLabel,
  splitTags,
} from '../utils/communicationViewModel'
import styles from '../components/CommunicationsModule.module.css'

export function CommunicationsPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>('all')
  const [selectedConversationId, setSelectedConversationId] = useState('')
  const [isConversationOpen, setIsConversationOpen] = useState(searchParams.get('createChat') === '1')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isIntegrationOpen, setIsIntegrationOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<CommunicationProfile | null>(null)
  const [editingProviderConfig, setEditingProviderConfig] = useState<CommunicationProviderConfig | null>(null)
  const [integrationChannel, setIntegrationChannel] = useState<CommunicationChannel>('whatsapp')
  const [integrationProvider, setIntegrationProvider] = useState<CommunicationProvider>('whatsapp_cloud')
  const [savedConversations, setSavedConversations] = useState<CommunicationConversation[]>([])
  const [savedMessages, setSavedMessages] = useState<CommunicationMessage[]>([])
  const [savedProfiles, setSavedProfiles] = useState<CommunicationProfile[]>([])
  const [savedProviderConfigs, setSavedProviderConfigs] = useState<CommunicationProviderConfig[]>([])
  const [deletedProviderConfigIds, setDeletedProviderConfigIds] = useState<string[]>([])
  const [savedQuoteLinks, setSavedQuoteLinks] = useState<CommunicationQuoteLink[]>([])
  const [composerError, setComposerError] = useState('')
  const [composerNotice, setComposerNotice] = useState('')
  const [integrationError, setIntegrationError] = useState('')
  const [integrationNotice, setIntegrationNotice] = useState('')
  const [linkError, setLinkError] = useState('')
  const [modalError, setModalError] = useState('')
  const [isLinking, setIsLinking] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [testingConfigId, setTestingConfigId] = useState('')

  const { data: conversationData } = useResourceList<CommunicationConversation>(
    '/communications/conversations',
    communicationConversationsMock,
    { order: 'desc', sort: 'lastMessageAt' },
  )
  const { data: messageData } = useResourceList<CommunicationMessage>('/communications/messages', communicationMessagesMock, {
    order: 'asc',
    sort: 'sentAt',
  })
  const { data: profileData } = useResourceList<CommunicationProfile>('/communications/profiles', communicationProfilesMock, {
    order: 'asc',
    sort: 'name',
  })
  const { data: providerConfigData } = useResourceList<CommunicationProviderConfig>(
    '/communications/provider-configs',
    communicationProviderConfigsMock,
    { order: 'desc', sort: 'updatedAt' },
  )
  const { data: quoteLinkData } = useResourceList<CommunicationQuoteLink>(
    '/communications/quote-links',
    communicationQuoteLinksMock,
    { order: 'desc', sort: 'createdAt' },
  )
  const { data: workshopQuotes } = useResourceList<Quote>('/quotes', quotesMock, { order: 'desc', sort: 'createdAt' })
  const { data: freightQuotes } = useResourceList<FreightQuote>('/freight/quotes', freightQuotesMock, {
    order: 'desc',
    sort: 'validUntil',
  })

  const conversations = useMemo(
    () => mergeById(conversationData, savedConversations).sort(byLastMessageDesc),
    [conversationData, savedConversations],
  )
  const messages = useMemo(() => mergeById(messageData, savedMessages).sort(bySentAtAsc), [messageData, savedMessages])
  const profiles = useMemo(() => mergeById(profileData, savedProfiles).sort((a, b) => a.name.localeCompare(b.name, 'es-CL')), [profileData, savedProfiles])
  const providerConfigs = useMemo(
    () => mergeById(providerConfigData, savedProviderConfigs)
      .filter((config) => !deletedProviderConfigIds.includes(config.id))
      .sort(byUpdatedDesc),
    [deletedProviderConfigIds, providerConfigData, savedProviderConfigs],
  )
  const quoteLinks = useMemo(
    () => mergeById(quoteLinkData, savedQuoteLinks).sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()),
    [quoteLinkData, savedQuoteLinks],
  )
  const quoteReferences = useMemo<QuoteReference[]>(
    () => [
      ...workshopQuotes.map((quote) => ({
        customerName: quote.customerName,
        detailPath: ROUTES.quoteDetail(quote.id),
        entityType: 'quote' as const,
        expiresAt: quote.expiresAt,
        id: quote.id,
        key: `workshop:${quote.id}`,
        number: quote.quoteNumber,
        status: quote.status,
        total: quote.total,
        type: 'workshop' as const,
      })),
      ...freightQuotes.map((quote) => ({
        customerName: quote.customerName,
        detailPath: ROUTES.freightQuoteDetail(quote.id),
        entityType: 'freight-quote' as const,
        expiresAt: quote.validUntil,
        id: quote.id,
        key: `freight:${quote.id}`,
        number: quote.quoteNumber,
        status: quote.status,
        total: quote.total,
        type: 'freight' as const,
      })),
    ],
    [freightQuotes, workshopQuotes],
  )
  const linkedEntityType = searchParams.get('relatedEntityType')
  const linkedEntityId = searchParams.get('relatedEntityId')
  const hasRouteEntityFilter = Boolean(linkedEntityType && linkedEntityId)
  const activeQuoteReference = quoteReferences.find(
    (quote) => quote.entityType === linkedEntityType && quote.id === linkedEntityId,
  )
  const quoteOptions = useMemo(
    () => [
      { label: 'Sin cotizacion asociada', value: '' },
      ...quoteReferences.map((quote) => ({
        label: `${quote.type === 'freight' ? 'Flete' : 'Taller'} / ${quote.number} / ${quote.customerName} / ${formatCurrency(quote.total)}`,
        value: quote.key,
      })),
    ],
    [quoteReferences],
  )
  const filteredConversations = useMemo(() => {
    const normalizedQuery = normalizeSearch(query)

    return conversations.filter((conversation) => {
      const matchesFilter = matchesConversationFilter(conversation, activeFilter, messages, quoteLinks)
      const matchesRouteEntity = !linkedEntityType || !linkedEntityId || isConversationLinkedToEntity(
        conversation,
        quoteLinks,
        linkedEntityType,
        linkedEntityId,
      )
      const matchesQuery = !normalizedQuery || normalizeSearch([
        conversation.contactName,
        conversation.contactAddress,
        conversation.subject,
        conversation.relatedEntityLabel,
        conversation.assignedTo,
        conversation.lastMessagePreview,
        conversation.tags.join(' '),
      ].join(' ')).includes(normalizedQuery)

      return matchesFilter && matchesRouteEntity && matchesQuery
    })
  }, [activeFilter, conversations, linkedEntityId, linkedEntityType, messages, query, quoteLinks])

  const selectedConversation = filteredConversations.find((conversation) => conversation.id === selectedConversationId)
    || filteredConversations[0]
    || (hasRouteEntityFilter ? undefined : conversations[0])
  const selectedMessages = selectedConversation
    ? messages.filter((message) => message.conversationId === selectedConversation.id)
    : []
  const selectedProfile = selectedConversation
    ? profiles.find((profile) => profile.id === selectedConversation.profileId)
    : undefined
  const selectedIntegration = selectedConversation
    ? findIntegrationForConversation(providerConfigs, selectedConversation.channel, selectedProfile?.id || selectedConversation.profileId)
    : undefined
  const selectedQuoteReferences = selectedConversation
    ? getConversationQuoteReferences(selectedConversation, quoteLinks, quoteReferences)
    : []
  const sentMessages = messages.filter((message) => message.direction === 'outbound')

  const stats = {
    activeIntegrations: providerConfigs.filter((config) => config.isActive).length,
    activeProfiles: profiles.filter((profile) => profile.status === 'active').length,
    open: conversations.filter((conversation) => conversation.status === 'open').length,
    quoteLinked: conversations.filter((conversation) => isQuoteConversation(conversation, quoteLinks)).length,
    sent: sentMessages.length,
    unread: conversations.reduce((total, conversation) => total + conversation.unreadCount, 0),
  }

  const filters: Array<{ count: number; key: ConversationFilter; label: string }> = [
    { count: conversations.length, key: 'all', label: 'Todos' },
    { count: stats.open, key: 'open', label: 'Abiertos' },
    { count: conversations.filter((conversation) => conversation.status === 'pending').length, key: 'pending', label: 'Pendientes' },
    { count: conversations.filter((conversation) => conversation.priority === 'urgent').length, key: 'urgent', label: 'Urgentes' },
    { count: conversations.filter((conversation) => conversation.unreadCount > 0).length, key: 'unread', label: 'No leidos' },
    { count: stats.quoteLinked, key: 'quotes', label: 'Cotizaciones' },
    { count: conversations.filter((conversation) => conversation.channel === 'whatsapp').length, key: 'whatsapp', label: 'WhatsApp' },
    { count: conversations.filter((conversation) => conversation.channel === 'email').length, key: 'email', label: 'Correo' },
    { count: sentMessages.length, key: 'sent', label: 'Enviados' },
  ]

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedConversation || !selectedProfile) {
      setComposerError('Selecciona una conversacion con perfil activo antes de enviar.')
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    const body = String(formData.get('body') || '').trim()

    if (!body) {
      setComposerError('Escribe un mensaje antes de enviarlo.')
      return
    }

    setComposerError('')
    setComposerNotice('')
    setIsSending(true)

    try {
      const result = await sendCommunicationMessage({
        attachments: [],
        body,
        conversationId: selectedConversation.id,
        createdBy: selectedProfile.ownerName,
        profileId: selectedProfile.id,
        subject: selectedConversation.channel === 'email' ? selectedConversation.subject : undefined,
        updatedBy: selectedProfile.ownerName,
      })
      const providerName = providerLabel(result.providerResult.provider)

      setSavedMessages((current) => [result.message, ...current.filter((message) => message.id !== result.message.id)])
      setSavedConversations((current) => [
        result.conversation,
        ...current.filter((conversation) => conversation.id !== result.conversation.id),
      ])
      setComposerNotice(
        result.providerResult.simulated
          ? 'Mensaje registrado en simulacion. Activa envio real en Integraciones cuando tengas credenciales.'
          : `Mensaje enviado por ${providerName}.`,
      )
      form.reset()
    } catch (error) {
      setComposerError(getApiErrorMessage(error))
    } finally {
      setIsSending(false)
    }
  }

  const handleConversationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const profileId = String(formData.get('profileId') || '')
    const profile = profiles.find((item) => item.id === profileId) || profiles[0]
    const selectedQuote = quoteReferences.find((quote) => quote.key === String(formData.get('quoteKey') || ''))

    if (!profile) {
      setModalError('Crea un perfil de WhatsApp o correo antes de iniciar una conversacion.')
      return
    }

    const now = new Date().toISOString()
    const typedTags = splitTags(String(formData.get('tags') || ''))
    const tags = selectedQuote
      ? [...new Set([...typedTags, 'cotizacion', selectedQuote.number])]
      : typedTags
    const payload: CommunicationConversationPayload = {
      assignedTo: String(formData.get('assignedTo') || profile.ownerName || '').trim(),
      channel: profile.channel,
      contactAddress: String(formData.get('contactAddress') || '').trim(),
      contactName: String(formData.get('contactName') || selectedQuote?.customerName || '').trim(),
      createdBy: 'Mesa comunicaciones',
      lastMessageAt: now,
      lastMessagePreview: 'Conversacion creada. Lista para enviar seguimiento.',
      priority: String(formData.get('priority') || 'medium') as ConversationPriority,
      profileId: profile.id,
      profileName: profile.name,
      relatedEntityId: selectedQuote?.id || String(formData.get('relatedEntityId') || '').trim(),
      relatedEntityLabel: selectedQuote?.number || String(formData.get('relatedEntityLabel') || '').trim(),
      relatedEntityType: selectedQuote?.entityType || String(formData.get('relatedEntityType') || 'general'),
      status: 'open',
      subject: String(formData.get('subject') || (selectedQuote ? `Seguimiento cotizacion ${selectedQuote.number}` : '')).trim(),
      tags,
      unreadCount: 0,
      updatedBy: 'Mesa comunicaciones',
    }

    if (!payload.contactName || !payload.subject) {
      setModalError('Indica contacto y asunto, o selecciona una cotizacion para completar el contexto automaticamente.')
      return
    }

    setModalError('')

    try {
      const savedConversation = await createCommunicationConversation(payload)
      const savedQuoteLink = selectedQuote
        ? await createCommunicationQuoteLink(buildQuoteLinkPayload(savedConversation.id, selectedQuote, profile.ownerName, 'Asociada al crear chat.'))
        : undefined
      setSavedConversations((current) => [
        savedConversation,
        ...current.filter((conversation) => conversation.id !== savedConversation.id),
      ])
      if (savedQuoteLink) {
        setSavedQuoteLinks((current) => [
          savedQuoteLink,
          ...current.filter((link) => link.id !== savedQuoteLink.id),
        ])
      }
      setSelectedConversationId(savedConversation.id)
      setIsConversationOpen(false)
      form.reset()
    } catch (error) {
      setModalError(getApiErrorMessage(error))
    }
  }

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload: CommunicationProfilePayload = {
      address: String(formData.get('address') || '').trim(),
      channel: String(formData.get('channel') || 'whatsapp') as CommunicationChannel,
      createdBy: editingProfile?.createdBy || 'Admin comunicaciones',
      department: String(formData.get('department') || '').trim(),
      isDefault: formData.get('isDefault') === 'on',
      name: String(formData.get('name') || '').trim(),
      notes: String(formData.get('notes') || '').trim(),
      ownerName: String(formData.get('ownerName') || '').trim(),
      signature: String(formData.get('signature') || '').trim(),
      status: String(formData.get('status') || 'active') as CommunicationProfile['status'],
      updatedBy: 'Admin comunicaciones',
    }

    setModalError('')

    try {
      const savedProfile = editingProfile
        ? await updateCommunicationProfile(editingProfile.id, payload)
        : await createCommunicationProfile(payload)

      setSavedProfiles((current) => [savedProfile, ...current.filter((profile) => profile.id !== savedProfile.id)])
      setEditingProfile(null)
      setIsProfileOpen(false)
      form.reset()
    } catch (error) {
      setModalError(getApiErrorMessage(error))
    }
  }

  const handleQuoteLinkSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedConversation) {
      setLinkError('Selecciona una conversacion antes de asociar una cotizacion.')
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    const quoteKey = String(formData.get('quoteKey') || '')
    const selectedQuote = quoteReferences.find((quote) => quote.key === quoteKey)

    if (!selectedQuote) {
      setLinkError('Selecciona una cotizacion valida para asociarla al chat.')
      return
    }

    const alreadyLinked = quoteLinks.some(
      (link) =>
        link.conversationId === selectedConversation.id &&
        link.quoteId === selectedQuote.id &&
        link.quoteType === selectedQuote.type,
    )

    if (alreadyLinked) {
      setLinkError('Esta cotizacion ya esta asociada a la conversacion.')
      return
    }

    setIsLinking(true)
    setLinkError('')

    try {
      const savedQuoteLink = await createCommunicationQuoteLink(
        buildQuoteLinkPayload(
          selectedConversation.id,
          selectedQuote,
          selectedProfile?.ownerName || selectedConversation.assignedTo || 'Mesa comunicaciones',
          String(formData.get('notes') || '').trim(),
        ),
      )
      setSavedQuoteLinks((current) => [
        savedQuoteLink,
        ...current.filter((link) => link.id !== savedQuoteLink.id),
      ])
      form.reset()
    } catch (error) {
      setLinkError(getApiErrorMessage(error))
    } finally {
      setIsLinking(false)
    }
  }

  const openIntegrationModal = (config?: CommunicationProviderConfig) => {
    const channel = config?.channel || 'whatsapp'

    setEditingProviderConfig(config || null)
    setIntegrationChannel(channel)
    setIntegrationProvider(config?.provider || defaultProviderForChannel(channel))
    setIntegrationError('')
    setIntegrationNotice('')
    setIsIntegrationOpen(true)
  }

  const handleIntegrationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const profileId = String(formData.get('profileId') || '').trim()
    const profile = profiles.find((item) => item.id === profileId)

    if (!profile) {
      setIntegrationError('Selecciona un perfil operacional para asociar la integracion.')
      return
    }

    const deliveryMode = String(formData.get('deliveryMode') || 'simulation') as CommunicationDeliveryMode
    const payload: CommunicationProviderConfigPayload = {
      channel: integrationChannel,
      createdBy: editingProviderConfig?.createdBy || 'Admin comunicaciones',
      deliveryMode,
      fromAddress: String(formData.get('fromAddress') || profile.address || '').trim(),
      isActive: formData.get('isActive') === 'on',
      name: String(formData.get('name') || '').trim(),
      profileId: profile.id,
      profileName: profile.name,
      provider: integrationProvider,
      updatedBy: 'Admin comunicaciones',
    }

    if (!payload.name) {
      setIntegrationError('Indica un nombre claro para la integracion.')
      return
    }

    if (integrationChannel === 'whatsapp') {
      const accessToken = String(formData.get('whatsappAccessToken') || '').trim()
      const appSecret = String(formData.get('whatsappAppSecret') || '').trim()

      payload.whatsappPhoneNumberId = String(formData.get('whatsappPhoneNumberId') || '').trim()
      payload.whatsappBusinessAccountId = String(formData.get('whatsappBusinessAccountId') || '').trim()
      payload.whatsappApiVersion = String(formData.get('whatsappApiVersion') || 'v25.0').trim()
      payload.whatsappWebhookVerifyToken = String(formData.get('whatsappWebhookVerifyToken') || '').trim()
      if (accessToken) payload.whatsappAccessToken = accessToken
      if (appSecret) payload.whatsappAppSecret = appSecret
    }

    if (integrationChannel === 'email') {
      const clientSecret = String(formData.get('outlookClientSecret') || '').trim()

      payload.outlookTenantId = String(formData.get('outlookTenantId') || '').trim()
      payload.outlookClientId = String(formData.get('outlookClientId') || '').trim()
      payload.outlookUserPrincipalName = String(formData.get('outlookUserPrincipalName') || '').trim()
      payload.outlookSaveToSentItems = formData.get('outlookSaveToSentItems') === 'on'
      if (clientSecret) payload.outlookClientSecret = clientSecret
    }

    setIntegrationError('')
    setIntegrationNotice('')

    try {
      const savedConfig = editingProviderConfig
        ? await updateCommunicationProviderConfig(editingProviderConfig.id, payload)
        : await createCommunicationProviderConfig(payload)

      setSavedProviderConfigs((current) => [savedConfig, ...current.filter((config) => config.id !== savedConfig.id)])
      setDeletedProviderConfigIds((current) => current.filter((id) => id !== savedConfig.id))
      setIntegrationNotice(
        savedConfig.deliveryMode === 'live'
          ? 'Integracion guardada. Usa Probar antes de enviar trafico real.'
          : 'Integracion guardada en modo simulacion segura.',
      )
      setEditingProviderConfig(savedConfig)
      form.reset()
    } catch (error) {
      setIntegrationError(getApiErrorMessage(error))
    }
  }

  const handleIntegrationTest = async (configId: string) => {
    setTestingConfigId(configId)
    setIntegrationError('')
    setIntegrationNotice('')

    try {
      const response = await testCommunicationProviderConfig(configId)

      setSavedProviderConfigs((current) => [
        response.config,
        ...current.filter((config) => config.id !== response.config.id),
      ])
      setIntegrationNotice(
        response.result.ok
          ? `Conexion validada: ${response.result.status}.`
          : `Prueba completada con alerta: ${response.result.status}.`,
      )
    } catch (error) {
      setIntegrationError(getApiErrorMessage(error))
    } finally {
      setTestingConfigId('')
    }
  }

  const handleIntegrationDelete = async (configId: string) => {
    setIntegrationError('')
    setIntegrationNotice('')

    try {
      await deleteCommunicationProviderConfig(configId)
      setDeletedProviderConfigIds((current) => [...new Set([...current, configId])])
      setSavedProviderConfigs((current) => current.filter((config) => config.id !== configId))
      if (editingProviderConfig?.id === configId) {
        setEditingProviderConfig(null)
        setIsIntegrationOpen(false)
      }
    } catch (error) {
      setIntegrationError(getApiErrorMessage(error))
    }
  }

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <>
              <Button
                icon={<Plug size={18} />}
                onClick={() => openIntegrationModal()}
                variant="secondary"
              >
                Integraciones
              </Button>
              <Button
                icon={<UserPlus size={18} />}
                onClick={() => {
                  setEditingProfile(null)
                  setModalError('')
                  setIsProfileOpen(true)
                }}
                variant="secondary"
              >
                Nuevo perfil
              </Button>
              <Button
                icon={<Plus size={18} />}
                onClick={() => {
                  setModalError('')
                  setIsConversationOpen(true)
                }}
              >
                Nuevo chat
              </Button>
            </>
          }
          description="WhatsApp y correo: conversaciones, perfiles y seguimiento."
          title="Comunicaciones"
        />

        <div className={styles.metricGrid}>
          <MetricItem helper="con seguimiento activo" icon={<MessageCircle size={18} />} label="Chats abiertos" value={stats.open} />
          <MetricItem helper="mensajes pendientes de leer" icon={<AtSign size={18} />} label="No leidos" value={stats.unread} />
          <MetricItem helper="chats unidos a cotizaciones" icon={<AtSign size={18} />} label="Cotizaciones" value={stats.quoteLinked} />
          <MetricItem helper="historial saliente registrado" icon={<Send size={18} />} label="Enviados" value={stats.sent} />
          <MetricItem helper="cuentas disponibles" icon={<Mail size={18} />} label="Perfiles activos" value={stats.activeProfiles} />
          <MetricItem helper="proveedores listos o simulados" icon={<Plug size={18} />} label="Integraciones" value={stats.activeIntegrations} />
        </div>

        {activeQuoteReference ? (
          <div className={styles.activeContext}>
            <div>
              <span className={styles.helper}>Contexto desde cotizacion</span>
              <strong>{activeQuoteReference.number} / {activeQuoteReference.customerName}</strong>
            </div>
            <Badge tone="info">{formatCurrency(activeQuoteReference.total)}</Badge>
          </div>
        ) : null}

        <div className={styles.toolbar}>
          <Input
            label="Buscar conversaciones"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cliente, caso, chofer, asunto o mensaje"
            type="search"
            value={query}
          />
          <div className={styles.quickFilters}>
            {filters.map((filter) => (
              <button
                className={[
                  styles.filterButton,
                  activeFilter === filter.key ? styles.filterButtonActive : '',
                ].filter(Boolean).join(' ')}
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                type="button"
              >
                <span>{filter.label}</span>
                <span className={styles.filterCount}>{filter.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.inboxGrid}>
          <Card className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Bandeja</h2>
                <p>Ordenada por urgencia, lectura y ultimo movimiento.</p>
              </div>
            </div>
            <div className={styles.conversationList}>
              {filteredConversations.map((conversation) => (
                <button
                  className={[
                    styles.conversationItem,
                    selectedConversation?.id === conversation.id ? styles.conversationItemActive : '',
                  ].filter(Boolean).join(' ')}
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  type="button"
                >
                  <div className={styles.conversationTop}>
                    <strong>{conversation.contactName}</strong>
                    <ChannelBadge channel={conversation.channel} />
                  </div>
                  <span className={styles.conversationMeta}>{conversation.subject}</span>
                  <span className={styles.conversationPreview}>{conversation.lastMessagePreview}</span>
                  <div className={styles.badgeLine}>
                    <StatusBadge status={conversation.status} />
                    <PriorityBadge priority={conversation.priority} />
                    {isQuoteConversation(conversation, quoteLinks) ? <Badge tone="warning">Cotizacion</Badge> : null}
                    {conversation.unreadCount > 0 ? <Badge tone="info">{conversation.unreadCount} nuevos</Badge> : null}
                  </div>
                </button>
              ))}
              {filteredConversations.length === 0 ? (
                <EmptyState
                  description={
                    activeQuoteReference
                      ? 'No hay conversaciones asociadas a esta cotizacion.'
                      : 'Ajusta los filtros o inicia una nueva conversacion.'
                  }
                  icon={<MessagesSquare size={22} />}
                  title="Sin conversaciones"
                />
              ) : null}
            </div>
          </Card>

          <Card className={styles.chatPanel}>
            {selectedConversation ? (
              <>
                <div className={styles.chatHeader}>
                  <div className={styles.chatTitle}>
                    <h2>{selectedConversation.contactName}</h2>
                    <span className={styles.conversationMeta}>
                      {selectedConversation.relatedEntityLabel || 'Sin entidad'} / {selectedConversation.contactAddress}
                    </span>
                    <div className={styles.badgeLine}>
                      <ChannelBadge channel={selectedConversation.channel} />
                      <StatusBadge status={selectedConversation.status} />
                      <PriorityBadge priority={selectedConversation.priority} />
                      {selectedIntegration ? <IntegrationBadge config={selectedIntegration} /> : <Badge tone="warning">Sin integracion</Badge>}
                    </div>
                  </div>
                  <div className={styles.profileActions}>
                    <Button
                      onClick={async () => {
                        const willResolve = selectedConversation.status !== 'resolved'
                        try {
                          const updatedConversation = await updateCommunicationConversation(selectedConversation.id, {
                            status: willResolve ? 'resolved' : 'open',
                            unreadCount: 0,
                            updatedBy: selectedConversation.assignedTo,
                          })
                          setSavedConversations((current) => [
                            updatedConversation,
                            ...current.filter((conversation) => conversation.id !== updatedConversation.id),
                          ])
                          toast.success(
                            willResolve ? 'Conversacion resuelta' : 'Conversacion reabierta',
                            `${updatedConversation.contactName} quedo como ${willResolve ? 'resuelta' : 'abierta'}.`,
                          )
                        } catch (error) {
                          toast.error('No se pudo actualizar la conversacion', getApiErrorMessage(error))
                        }
                      }}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      {selectedConversation.status === 'resolved' ? 'Reabrir' : 'Resolver'}
                    </Button>
                  </div>
                </div>

                {selectedQuoteReferences.length > 0 ? (
                  <div className={styles.quoteContextList}>
                    {selectedQuoteReferences.map((quote) => (
                      <QuoteReferenceCard key={quote.key} quote={quote} />
                    ))}
                  </div>
                ) : null}

                <div className={styles.messageList}>
                  {selectedMessages.map((message) => (
                    <article
                      className={[
                        styles.messageBubble,
                        message.direction === 'outbound' ? styles.messageOutbound : styles.messageInbound,
                      ].join(' ')}
                      key={message.id}
                    >
                      <div className={styles.messageMeta}>
                        <strong>{message.fromName}</strong>
                        <MessageStatusBadge status={message.status} />
                        <span>{formatDate(message.sentAt)}</span>
                      </div>
                      {message.subject ? <strong>{message.subject}</strong> : null}
                      <p className={styles.messageBody}>{message.body}</p>
                      {message.attachments.length > 0 ? (
                        <span className={styles.helper}>Adjuntos: {message.attachments.join(', ')}</span>
                      ) : null}
                      {message.provider ? (
                        <span className={styles.helper}>
                          Proveedor: {providerLabel(message.provider)} / {message.providerStatus || message.status}
                        </span>
                      ) : null}
                      {message.errorMessage ? <span className={styles.emptyText}>{message.errorMessage}</span> : null}
                    </article>
                  ))}
                </div>

                <form className={styles.composer} onSubmit={handleSendMessage}>
                  <textarea className={styles.textarea} name="body" placeholder="Escribe respuesta rapida para WhatsApp o correo..." />
                  {composerError ? <span className={styles.emptyText}>{composerError}</span> : null}
                  {composerNotice ? <span className={styles.successText}>{composerNotice}</span> : null}
                  <div className={styles.composerActions}>
                    <span className={styles.helper}>
                      Envia desde {selectedProfile?.name || selectedConversation.profileName} a {selectedConversation.contactName}
                      {selectedIntegration
                        ? ` / ${providerLabel(selectedIntegration.provider)} (${deliveryModeLabel(selectedIntegration.deliveryMode)})`
                        : ' / sin integracion activa, se guardara en simulacion'}
                    </span>
                    <Button disabled={isSending} icon={<Send size={18} />} type="submit">
                      {isSending ? 'Enviando...' : 'Enviar mensaje'}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <p className={styles.emptyText}>Selecciona o crea una conversacion para iniciar seguimiento.</p>
            )}
          </Card>

          <Card className={[styles.panel, styles.sidePanel].join(' ')}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Perfiles y enviados</h2>
                <p>Cuentas configuradas e historial saliente reciente.</p>
              </div>
            </div>
            <form className={styles.quoteLinkForm} onSubmit={handleQuoteLinkSubmit}>
              <div>
                <h3>Asociar cotizacion</h3>
                <p>Vincula este chat con una cotizacion de taller o flete para mantener trazabilidad comercial.</p>
              </div>
              <Select label="Cotizacion" name="quoteKey" options={quoteOptions} />
              <Input label="Nota" name="notes" placeholder="Ej: enviada por correo, pendiente aprobacion" />
              {linkError ? <span className={styles.emptyText}>{linkError}</span> : null}
              <Button disabled={isLinking || !selectedConversation} size="sm" type="submit" variant="secondary">
                {isLinking ? 'Asociando...' : 'Asociar al chat'}
              </Button>
            </form>
            <div className={styles.integrationList}>
              <div className={styles.integrationHeader}>
                <div>
                  <h3>Integraciones</h3>
                  <p>Configura envio real o simulacion por canal.</p>
                </div>
                <Button onClick={() => openIntegrationModal()} size="sm" type="button" variant="secondary">
                  Nueva
                </Button>
              </div>
              {integrationNotice ? <span className={styles.successText}>{integrationNotice}</span> : null}
              {integrationError ? <span className={styles.emptyText}>{integrationError}</span> : null}
              {providerConfigs.map((config) => (
                <div className={styles.integrationItem} key={config.id}>
                  <div className={styles.profileTop}>
                    <strong>{config.name}</strong>
                    <IntegrationBadge config={config} />
                  </div>
                  <div className={styles.integrationMeta}>
                    <span>{providerLabel(config.provider)} / {config.profileName || 'sin perfil'}</span>
                    <span>{config.lastTestStatus ? `Ultima prueba: ${config.lastTestStatus}` : 'Sin prueba tecnica'}</span>
                    {config.lastError ? <span>{config.lastError}</span> : null}
                  </div>
                  <div className={styles.integrationActions}>
                    <Button
                      disabled={testingConfigId === config.id}
                      onClick={() => handleIntegrationTest(config.id)}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      {testingConfigId === config.id ? 'Probando...' : 'Probar'}
                    </Button>
                    <Button onClick={() => openIntegrationModal(config)} size="sm" type="button" variant="secondary">
                      Editar
                    </Button>
                    <Button
                      aria-label={`Eliminar ${config.name}`}
                      icon={<Trash2 size={16} />}
                      onClick={() => handleIntegrationDelete(config.id)}
                      size="sm"
                      type="button"
                      variant="ghost"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.profileList}>
              {profiles.map((profile) => (
                <div className={styles.profileItem} key={profile.id}>
                  <div className={styles.profileTop}>
                    <strong>{profile.name}</strong>
                    <ChannelBadge channel={profile.channel} />
                    {profile.isDefault ? <Badge tone="success">Default</Badge> : null}
                  </div>
                  <div className={styles.profileMeta}>
                    <span>{profile.address}</span>
                    <span>{profile.ownerName} / {profile.department}</span>
                  </div>
                  <div className={styles.profileActions}>
                    <Button
                      onClick={() => {
                        setEditingProfile(profile)
                        setModalError('')
                        setIsProfileOpen(true)
                      }}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.profileList}>
              {sentMessages.slice(0, 5).map((message) => (
                <div className={styles.profileItem} key={message.id}>
                  <div className={styles.profileTop}>
                    <strong>{message.toName}</strong>
                    <MessageStatusBadge status={message.status} />
                  </div>
                  <span className={styles.conversationPreview}>{message.body}</span>
                  <span className={styles.profileMeta}>{formatDate(message.sentAt)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal onClose={() => setIsConversationOpen(false)} open={isConversationOpen} title="Nuevo chat">
        <form className={styles.formGrid} onSubmit={handleConversationSubmit}>
          {modalError ? <p className={styles.emptyText}>{modalError}</p> : null}
          <Select
            label="Perfil"
            name="profileId"
            options={profiles.map((profile) => ({ label: `${profile.name} / ${profile.address}`, value: profile.id }))}
          />
          <Select label="Prioridad" name="priority" options={priorityOptions} />
          <Select
            className={styles.span2}
            defaultValue={activeQuoteReference?.key || ''}
            label="Cotizacion relacionada"
            name="quoteKey"
            options={quoteOptions}
          />
          <Input
            defaultValue={activeQuoteReference?.customerName || ''}
            label="Contacto"
            name="contactName"
            placeholder="Nombre cliente, chofer o proveedor"
          />
          <Input label="Destino" name="contactAddress" placeholder="+56 9... o correo@dominio.cl" required />
          <Input
            className={styles.span2}
            defaultValue={activeQuoteReference ? `Seguimiento cotizacion ${activeQuoteReference.number}` : ''}
            label="Asunto"
            name="subject"
            placeholder="Motivo operacional"
          />
          <Select defaultValue={activeQuoteReference?.entityType || 'general'} label="Relacion" name="relatedEntityType" options={relatedEntityOptions} />
          <Input defaultValue={activeQuoteReference?.id || ''} label="ID relacionado" name="relatedEntityId" placeholder="case-002, customer-ruta..." />
          <Input defaultValue={activeQuoteReference?.number || ''} label="Etiqueta relacionada" name="relatedEntityLabel" placeholder="TW-2026-002, Ruta Norte..." />
          <Input label="Responsable" name="assignedTo" placeholder="Mesa operaciones" />
          <Input label="Tags" name="tags" placeholder="flete, cliente, retiro" />
          <div className={styles.span2}>
            <Button icon={<Plus size={18} />} type="submit">Crear chat</Button>
          </div>
        </form>
      </Modal>

      <Modal
        onClose={() => {
          setIsProfileOpen(false)
          setEditingProfile(null)
        }}
        open={isProfileOpen}
        title={editingProfile ? 'Editar perfil' : 'Nuevo perfil'}
      >
        <form className={styles.formGrid} onSubmit={handleProfileSubmit}>
          {modalError ? <p className={styles.emptyText}>{modalError}</p> : null}
          <Input defaultValue={editingProfile?.name || ''} label="Nombre perfil" name="name" required />
          <Select defaultValue={editingProfile?.channel || 'whatsapp'} label="Canal" name="channel" options={channelOptions} />
          <Input defaultValue={editingProfile?.address || ''} label="Cuenta / numero" name="address" required />
          <Input defaultValue={editingProfile?.ownerName || ''} label="Responsable" name="ownerName" required />
          <Input defaultValue={editingProfile?.department || ''} label="Area" name="department" required />
          <Select defaultValue={editingProfile?.status || 'active'} label="Estado" name="status" options={profileStatusOptions} />
          <Input className={styles.span2} defaultValue={editingProfile?.signature || ''} label="Firma" name="signature" />
          <Input className={styles.span2} defaultValue={editingProfile?.notes || ''} label="Notas de uso" name="notes" />
          <label className={styles.span2}>
            <input defaultChecked={editingProfile?.isDefault || false} name="isDefault" type="checkbox" /> Perfil predeterminado
          </label>
          <div className={styles.span2}>
            <Button icon={<UserPlus size={18} />} type="submit">
              {editingProfile ? 'Actualizar perfil' : 'Crear perfil'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        onClose={() => {
          setIsIntegrationOpen(false)
          setEditingProviderConfig(null)
          setIntegrationError('')
          setIntegrationNotice('')
        }}
        open={isIntegrationOpen}
        title={editingProviderConfig ? 'Editar integracion' : 'Configurar integracion'}
      >
        <form
          className={styles.formGrid}
          key={`${editingProviderConfig?.id || 'new'}-${integrationChannel}`}
          onSubmit={handleIntegrationSubmit}
        >
          {integrationError ? <p className={styles.emptyText}>{integrationError}</p> : null}
          {integrationNotice ? <p className={styles.successText}>{integrationNotice}</p> : null}
          <Input defaultValue={editingProviderConfig?.name || ''} label="Nombre" name="name" placeholder="WhatsApp operaciones" required />
          <Select
            label="Canal"
            name="channel"
            onChange={(event) => {
              const channel = event.target.value as CommunicationChannel

              setIntegrationChannel(channel)
              setIntegrationProvider(defaultProviderForChannel(channel))
            }}
            options={channelOptions}
            value={integrationChannel}
          />
          <Select
            label="Proveedor"
            name="provider"
            onChange={(event) => setIntegrationProvider(event.target.value as CommunicationProvider)}
            options={providerOptions.filter((option) => isProviderForChannel(option.value as CommunicationProvider, integrationChannel))}
            value={integrationProvider}
          />
          <Select
            defaultValue={editingProviderConfig?.deliveryMode || 'simulation'}
            label="Modo"
            name="deliveryMode"
            options={deliveryModeOptions}
          />
          <Select
            defaultValue={
              profiles.some((profile) => profile.id === editingProviderConfig?.profileId && profile.channel === integrationChannel)
                ? editingProviderConfig?.profileId
                : profiles.find((profile) => profile.channel === integrationChannel)?.id || ''
            }
            label="Perfil asociado"
            name="profileId"
            options={profiles
              .filter((profile) => profile.channel === integrationChannel)
              .map((profile) => ({ label: `${profile.name} / ${profile.address}`, value: profile.id }))}
            required
          />
          <Input
            defaultValue={editingProviderConfig?.fromAddress || ''}
            label="Remitente visible"
            name="fromAddress"
            placeholder={integrationChannel === 'whatsapp' ? '+569...' : 'operaciones@empresa.cl'}
          />
          <label className={styles.checkboxLine}>
            <input defaultChecked={editingProviderConfig?.isActive ?? true} name="isActive" type="checkbox" />
            Integracion activa para envios
          </label>

          {integrationChannel === 'whatsapp' ? (
            <div className={[styles.configSection, styles.span2].join(' ')}>
              <div className={styles.configSectionTitle}>
                <strong>Meta WhatsApp Cloud</strong>
                <span>Datos del phone number, token permanente y webhook de verificacion.</span>
              </div>
              <div className={styles.formGrid}>
                <Input
                  defaultValue={editingProviderConfig?.whatsappPhoneNumberId || ''}
                  label="Phone Number ID"
                  name="whatsappPhoneNumberId"
                  placeholder="123456789012345"
                />
                <Input
                  defaultValue={editingProviderConfig?.whatsappBusinessAccountId || ''}
                  label="Business Account ID"
                  name="whatsappBusinessAccountId"
                  placeholder="WABA ID"
                />
                <Input
                  defaultValue={editingProviderConfig?.whatsappApiVersion || 'v25.0'}
                  label="Version API"
                  name="whatsappApiVersion"
                  placeholder="v25.0"
                />
                <Input
                  defaultValue={editingProviderConfig?.whatsappWebhookVerifyToken || ''}
                  label="Verify token webhook"
                  name="whatsappWebhookVerifyToken"
                  placeholder="token-interno-webhook"
                />
                <Input
                  helperText={editingProviderConfig?.hasWhatsappAccessToken ? 'Ya existe token guardado. Completa solo para reemplazar.' : undefined}
                  label="Access token"
                  name="whatsappAccessToken"
                  placeholder="Pega el token permanente"
                  type="password"
                />
                <Input
                  helperText={editingProviderConfig?.hasWhatsappAppSecret ? 'Ya existe app secret guardado. Completa solo para reemplazar.' : undefined}
                  label="App secret"
                  name="whatsappAppSecret"
                  placeholder="Opcional para validacion futura"
                  type="password"
                />
              </div>
            </div>
          ) : null}

          {integrationChannel === 'email' ? (
            <div className={[styles.configSection, styles.span2].join(' ')}>
              <div className={styles.configSectionTitle}>
                <strong>Outlook Microsoft Graph</strong>
                <span>Usa una app de Entra ID con permiso Mail.Send y credenciales client credentials.</span>
              </div>
              <div className={styles.formGrid}>
                <Input
                  defaultValue={editingProviderConfig?.outlookTenantId || ''}
                  label="Tenant ID"
                  name="outlookTenantId"
                  placeholder="GUID o dominio tenant"
                />
                <Input
                  defaultValue={editingProviderConfig?.outlookClientId || ''}
                  label="Client ID"
                  name="outlookClientId"
                  placeholder="Application client ID"
                />
                <Input
                  helperText={editingProviderConfig?.hasOutlookClientSecret ? 'Ya existe secret guardado. Completa solo para reemplazar.' : undefined}
                  label="Client secret"
                  name="outlookClientSecret"
                  placeholder="Valor del secret"
                  type="password"
                />
                <Input
                  defaultValue={editingProviderConfig?.outlookUserPrincipalName || ''}
                  label="Buzon emisor"
                  name="outlookUserPrincipalName"
                  placeholder="operaciones@empresa.cl"
                />
                <label className={styles.checkboxLine}>
                  <input
                    defaultChecked={editingProviderConfig?.outlookSaveToSentItems ?? true}
                    name="outlookSaveToSentItems"
                    type="checkbox"
                  />
                  Guardar copia en enviados de Outlook
                </label>
              </div>
            </div>
          ) : null}

          <div className={[styles.span2, styles.modalActions].join(' ')}>
            {editingProviderConfig ? (
              <Button
                disabled={testingConfigId === editingProviderConfig.id}
                icon={<CheckCircle2 size={18} />}
                onClick={() => handleIntegrationTest(editingProviderConfig.id)}
                type="button"
                variant="secondary"
              >
                {testingConfigId === editingProviderConfig.id ? 'Probando...' : 'Probar conexion'}
              </Button>
            ) : null}
            <Button icon={<Plug size={18} />} type="submit">
              {editingProviderConfig ? 'Guardar integracion' : 'Crear integracion'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  )
}

interface MetricItemProps {
  helper: string
  icon: ReactNode
  label: string
  value: number | string
}

function MetricItem({ helper, icon, label, value }: MetricItemProps) {
  return (
    <div className={styles.metricItem}>
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
      <span className={styles.helper}>{helper}</span>
    </div>
  )
}

function ChannelBadge({ channel }: { channel: CommunicationChannel }) {
  return <Badge tone={channel === 'whatsapp' ? 'success' : 'info'}>{channel === 'whatsapp' ? 'WhatsApp' : 'Correo'}</Badge>
}

function IntegrationBadge({ config }: { config: CommunicationProviderConfig }) {
  if (!config.isActive) {
    return <Badge tone="neutral">Inactiva</Badge>
  }

  return (
    <Badge tone={config.deliveryMode === 'live' ? 'success' : 'warning'}>
      {config.deliveryMode === 'live' ? 'Envio real' : 'Simulacion'}
    </Badge>
  )
}

function StatusBadge({ status }: { status: ConversationStatus }) {
  const labels: Record<ConversationStatus, string> = {
    archived: 'Archivado',
    open: 'Abierto',
    pending: 'Pendiente',
    resolved: 'Resuelto',
  }
  const tones: Record<ConversationStatus, BadgeTone> = {
    archived: 'neutral',
    open: 'info',
    pending: 'warning',
    resolved: 'success',
  }

  return <Badge tone={tones[status]}>{labels[status]}</Badge>
}

function PriorityBadge({ priority }: { priority: ConversationPriority }) {
  const labels: Record<ConversationPriority, string> = {
    high: 'Alta',
    low: 'Baja',
    medium: 'Media',
    urgent: 'Urgente',
  }
  const tones: Record<ConversationPriority, BadgeTone> = {
    high: 'warning',
    low: 'neutral',
    medium: 'info',
    urgent: 'danger',
  }

  return <Badge tone={tones[priority]}>{labels[priority]}</Badge>
}

function MessageStatusBadge({ status }: { status: MessageStatus }) {
  const labels: Record<MessageStatus, string> = {
    delivered: 'Entregado',
    draft: 'Borrador',
    failed: 'Error',
    queued: 'En cola',
    read: 'Leido',
    sent: 'Enviado',
  }
  const tones: Record<MessageStatus, BadgeTone> = {
    delivered: 'success',
    draft: 'neutral',
    failed: 'danger',
    queued: 'warning',
    read: 'success',
    sent: 'info',
  }

  return <Badge tone={tones[status]}>{labels[status]}</Badge>
}

function QuoteReferenceCard({ quote }: { quote: QuoteReference }) {
  return (
    <Link className={styles.quoteContextCard} to={quote.detailPath}>
      <div>
        <span className={styles.helper}>{quote.type === 'freight' ? 'Cotizacion de flete' : 'Cotizacion taller'}</span>
        <strong>{quote.number}</strong>
      </div>
      <div className={styles.quoteContextMeta}>
        <span>{quote.customerName}</span>
        <Badge tone="info">{quote.status}</Badge>
        <strong>{formatCurrency(quote.total)}</strong>
      </div>
    </Link>
  )
}
