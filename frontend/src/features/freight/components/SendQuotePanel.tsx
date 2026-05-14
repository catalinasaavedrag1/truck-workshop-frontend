import { useState } from 'react'
import { Mail, MessageCircle } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import type { FreightQuote, QuoteDeliveryChannel } from '../types/freight.types'

interface SendQuotePanelProps {
  quote: FreightQuote
}

export function SendQuotePanel({ quote }: SendQuotePanelProps) {
  const [sentBy, setSentBy] = useState<QuoteDeliveryChannel | undefined>(quote.sentBy)
  const [sentAt, setSentAt] = useState<string | undefined>(quote.sentAt)

  function markSent(channel: QuoteDeliveryChannel) {
    setSentBy(channel)
    setSentAt(new Date().toISOString())
  }

  return (
    <Card>
      <div className="stack">
        <h2 className="section-title">Envio de cotizacion</h2>
        <div className="inline-actions">
          <Button icon={<MessageCircle size={18} />} onClick={() => markSent('WHATSAPP')} type="button" variant="secondary">
            Enviar por WhatsApp
          </Button>
          <Button icon={<Mail size={18} />} onClick={() => markSent('EMAIL')} type="button" variant="secondary">
            Enviar por correo
          </Button>
        </div>
        {sentBy && sentAt ? (
          <p className="muted-text">
            Cotizacion enviada por {sentBy === 'WHATSAPP' ? 'WhatsApp' : 'correo'} el{' '}
            {new Intl.DateTimeFormat('es-CL', {
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              month: 'short',
            }).format(new Date(sentAt))}
          </p>
        ) : (
          <p className="muted-text">Aun no se ha enviado esta cotizacion.</p>
        )}
      </div>
    </Card>
  )
}
