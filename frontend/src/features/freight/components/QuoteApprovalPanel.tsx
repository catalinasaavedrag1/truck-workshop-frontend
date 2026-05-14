import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import type { FreightQuote, FreightQuoteStatus } from '../types/freight.types'
import { FreightRequestStatusBadge } from './FreightRequestStatusBadge'

interface QuoteApprovalPanelProps {
  quote: FreightQuote
}

export function QuoteApprovalPanel({ quote }: QuoteApprovalPanelProps) {
  const [status, setStatus] = useState<FreightQuoteStatus>(quote.status)

  return (
    <Card>
      <div className="stack">
        <div className="split-row">
          <h2 className="section-title">Decision del cliente</h2>
          <FreightRequestStatusBadge status={status} type="quote" />
        </div>
        <div className="inline-actions">
          <Button icon={<CheckCircle2 size={18} />} onClick={() => setStatus('APPROVED')} type="button">
            Marcar aprobada
          </Button>
          <Button icon={<XCircle size={18} />} onClick={() => setStatus('REJECTED')} type="button" variant="danger">
            Marcar rechazada
          </Button>
        </div>
        <p className="muted-text">La decision queda registrada para seguimiento comercial.</p>
      </div>
    </Card>
  )
}
