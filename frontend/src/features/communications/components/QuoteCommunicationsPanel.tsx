import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import {
  communicationConversationsMock,
  communicationQuoteLinksMock,
} from '../mocks/communications.mock'
import type {
  CommunicationConversation,
  CommunicationQuoteLink,
  CommunicationQuoteType,
} from '../types/communication.types'
import styles from './CommunicationsModule.module.css'

interface QuoteCommunicationsPanelProps {
  customerName: string
  quoteId: string
  quoteNumber: string
  quoteStatus: string
  quoteTotal: number
  quoteType: CommunicationQuoteType
}

export function QuoteCommunicationsPanel({
  customerName,
  quoteId,
  quoteNumber,
  quoteStatus,
  quoteTotal,
  quoteType,
}: QuoteCommunicationsPanelProps) {
  const entityType = quoteType === 'freight' ? 'freight-quote' : 'quote'
  const communicationsUrl = `${ROUTES.communications}?relatedEntityType=${entityType}&relatedEntityId=${encodeURIComponent(quoteId)}`
  const createChatUrl = `${communicationsUrl}&createChat=1`
  const { data: conversations } = useResourceList<CommunicationConversation>(
    '/communications/conversations',
    communicationConversationsMock,
    { order: 'desc', sort: 'lastMessageAt' },
  )
  const { data: quoteLinks } = useResourceList<CommunicationQuoteLink>(
    '/communications/quote-links',
    communicationQuoteLinksMock,
    { order: 'desc', quoteId, quoteType, sort: 'createdAt' },
  )
  const linkedConversationIds = new Set(
    quoteLinks
      .filter((link) => link.quoteId === quoteId && link.quoteType === quoteType)
      .map((link) => link.conversationId),
  )
  const relatedConversations = conversations
    .filter(
      (conversation) =>
        linkedConversationIds.has(conversation.id) ||
        (conversation.relatedEntityType === entityType && conversation.relatedEntityId === quoteId),
    )
    .sort((first, second) => new Date(second.lastMessageAt).getTime() - new Date(first.lastMessageAt).getTime())
  const unreadCount = relatedConversations.reduce((total, conversation) => total + conversation.unreadCount, 0)

  return (
    <Card>
      <div className="stack">
        <div className="split-row">
          <div>
            <h2 className="section-title">Comunicaciones de cotizacion</h2>
            <p className="muted-text">Chats y correos asociados directamente a esta cotizacion.</p>
          </div>
          <Badge tone={relatedConversations.length > 0 ? 'success' : 'warning'}>
            {relatedConversations.length} chats
          </Badge>
        </div>

        <div className={styles.quoteContextCard}>
          <div>
            <span className={styles.helper}>{quoteType === 'freight' ? 'Cotizacion de flete' : 'Cotizacion taller'}</span>
            <strong>{quoteNumber}</strong>
          </div>
          <div className={styles.quoteContextMeta}>
            <span>{customerName}</span>
            <Badge tone="info">{quoteStatus}</Badge>
            <strong>{formatCurrency(quoteTotal)}</strong>
          </div>
        </div>

        <div className={styles.profileList}>
          {relatedConversations.slice(0, 3).map((conversation) => (
            <Link className={styles.profileItem} key={conversation.id} to={communicationsUrl}>
              <div className={styles.profileTop}>
                <strong>{conversation.contactName}</strong>
                {conversation.unreadCount > 0 ? <Badge tone="info">{conversation.unreadCount} nuevos</Badge> : null}
              </div>
              <span className={styles.conversationPreview}>{conversation.lastMessagePreview}</span>
              <span className={styles.profileMeta}>{formatDate(conversation.lastMessageAt)}</span>
            </Link>
          ))}
          {relatedConversations.length === 0 ? (
            <p className={styles.emptyText}>Sin chats asociados todavia. Abre comunicaciones para crear seguimiento.</p>
          ) : null}
        </div>

        <Link to={relatedConversations.length > 0 ? communicationsUrl : createChatUrl}>
          <Button icon={<MessageCircle size={18} />} type="button" variant={relatedConversations.length > 0 ? 'secondary' : 'primary'}>
            {relatedConversations.length > 0 ? `Ver historial (${unreadCount} nuevos)` : 'Crear seguimiento'}
          </Button>
        </Link>
      </div>
    </Card>
  )
}
