import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { toast } from '../../../shared/services/toastStore'
import type { FreightQuote, FreightQuoteStatus } from '../types/freight.types'
import { FreightRequestStatusBadge } from './FreightRequestStatusBadge'

interface QuoteApprovalPanelProps {
  quote: FreightQuote
}

export function QuoteApprovalPanel({ quote }: QuoteApprovalPanelProps) {
  const [status, setStatus] = useState<FreightQuoteStatus>(quote.status)

  const handleApprove = () => {
    setStatus('APPROVED')
    toast.success('Cotizacion aprobada', `${quote.quoteNumber} quedo marcada como aprobada.`)
  }

  const handleReject = () => {
    setStatus('REJECTED')
    toast.warning('Cotizacion rechazada', `${quote.quoteNumber} quedo marcada como rechazada.`)
  }

  return (
    <Card>
      <div className="stack">
        <div className="split-row">
          <h2 className="section-title">Decision del cliente</h2>
          <FreightRequestStatusBadge status={status} type="quote" />
        </div>
        <div className="inline-actions">
          <Button disabled={status === 'APPROVED'} icon={<CheckCircle2 size={18} />} onClick={handleApprove} type="button">
            Marcar aprobada
          </Button>
          <Button
            disabled={status === 'REJECTED'}
            icon={<XCircle size={18} />}
            onClick={handleReject}
            type="button"
            variant="danger"
          >
            Marcar rechazada
          </Button>
        </div>
        <p className="muted-text">La decision queda registrada para seguimiento comercial.</p>
      </div>
    </Card>
  )
}
