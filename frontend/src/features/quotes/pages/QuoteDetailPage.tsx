import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Send, XCircle } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceItem } from '../../../shared/hooks/useResourceItem'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { QuoteCommunicationsPanel } from '../../communications/components/QuoteCommunicationsPanel'
import { CustomerCreditDecisionPanel } from '../../customers/components/CustomerCreditDecisionPanel'
import { customersMock } from '../../customers/mocks/customers.mock'
import type { Customer } from '../../customers/types/customer.types'
import type { CustomerCreditQuoteReference } from '../../customers/utils/customerPricing'
import { QuoteItemsTable } from '../components/QuoteItemsTable'
import { QuoteStatusBadge } from '../components/QuoteStatusBadge'
import { quotesMock } from '../mocks/quotes.mock'
import { changeWorkshopQuoteStatus } from '../services/quotes.service'
import type { Quote, QuoteStatus } from '../types/quote.types'

export function QuoteDetailPage() {
  const { quoteId } = useParams()
  const { data: quote, isLoading } = useResourceItem<Quote>('/quotes', quoteId, quotesMock)
  const { data: customers } = useResourceList<Customer>('/customers', customersMock, {
    order: 'asc',
    sort: 'name',
  })
  const { data: workshopQuotes } = useResourceList<Quote>('/quotes', quotesMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const [localQuote, setLocalQuote] = useState<Quote | undefined>()
  const [actionError, setActionError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const visibleQuote = localQuote?.id === quoteId ? localQuote : quote

  if (isLoading && !visibleQuote) {
    return (
      <PageContainer>
        <LoadingState label="Cargando cotizacion" />
      </PageContainer>
    )
  }

  if (!visibleQuote) {
    return (
      <PageContainer>
        <EmptyState
          description="Revisa el identificador o vuelve al listado de cotizaciones."
          icon={<AlertCircle size={22} />}
          title="Cotizacion no encontrada"
        />
      </PageContainer>
    )
  }

  const selectedCustomer = customers.find((customer) =>
    visibleQuote.customerId ? customer.id === visibleQuote.customerId : customer.name === visibleQuote.customerName,
  )
  const quoteReferences: CustomerCreditQuoteReference[] = workshopQuotes.map((item) => ({
    customerId: item.customerId,
    customerName: item.customerName,
    id: item.id,
    quoteNumber: item.quoteNumber,
    source: 'workshop',
    status: item.status,
    total: item.total,
  }))

  const handleStatusChange = async (status: QuoteStatus) => {
    setActionError('')
    setIsSaving(true)

    try {
      const updatedQuote = await changeWorkshopQuoteStatus(
        visibleQuote,
        status,
        status === 'APPROVED' ? visibleQuote.customerName || 'Operacion interna' : undefined,
      )

      setLocalQuote(updatedQuote)
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader description={visibleQuote.customerName} title={visibleQuote.quoteNumber} />
      <div className="two-column-grid">
        <Card>
          <QuoteItemsTable items={visibleQuote.items} />
        </Card>
        <Card>
          <div className="stack">
            {actionError ? <ErrorState description={actionError} title="No se pudo actualizar la cotizacion" /> : null}
            <div className="split-row">
              <div>
                <h2 className="section-title">Flujo de cotizacion</h2>
                <p className="muted-text">Estado comercial y efecto sobre el caso de taller.</p>
              </div>
              <QuoteStatusBadge status={visibleQuote.status} />
            </div>
            <div className="inline-actions">
              {visibleQuote.status === 'DRAFT' ? (
                <Button
                  disabled={isSaving}
                  icon={<Send size={18} />}
                  onClick={() => void handleStatusChange('SENT')}
                  type="button"
                >
                  {isSaving ? 'Enviando...' : 'Enviar a aprobacion'}
                </Button>
              ) : null}
              {visibleQuote.status === 'SENT' ? (
                <>
                  <Button
                    disabled={isSaving}
                    icon={<CheckCircle2 size={18} />}
                    onClick={() => void handleStatusChange('APPROVED')}
                    type="button"
                  >
                    {isSaving ? 'Aprobando...' : 'Aprobar'}
                  </Button>
                  <Button
                    disabled={isSaving}
                    icon={<XCircle size={18} />}
                    onClick={() => void handleStatusChange('REJECTED')}
                    type="button"
                    variant="danger"
                  >
                    {isSaving ? 'Rechazando...' : 'Rechazar'}
                  </Button>
                </>
              ) : null}
            </div>
            <dl className="detail-list">
              <div>
                <dt>Caso</dt>
                <dd>{visibleQuote.caseNumber}</dd>
              </div>
              <div>
                <dt>Diagnostico</dt>
                <dd>{visibleQuote.diagnosisSummary}</dd>
              </div>
              <div>
                <dt>Creada</dt>
                <dd>{formatDate(visibleQuote.createdAt)}</dd>
              </div>
              <div>
                <dt>Expira</dt>
                <dd>{formatDate(visibleQuote.expiresAt)}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>{formatCurrency(visibleQuote.total)}</dd>
              </div>
              <div>
                <dt>Aprobada por</dt>
                <dd>{visibleQuote.approvedBy || 'Pendiente'}</dd>
              </div>
            </dl>
          </div>
        </Card>
        <QuoteCommunicationsPanel
          customerName={visibleQuote.customerName}
          quoteId={visibleQuote.id}
          quoteNumber={visibleQuote.quoteNumber}
          quoteStatus={visibleQuote.status}
          quoteTotal={visibleQuote.total}
          quoteType="workshop"
        />
        <CustomerCreditDecisionPanel
          currentQuoteId={visibleQuote.id}
          customer={selectedCustomer}
          customerName={visibleQuote.customerName}
          quoteReferences={quoteReferences}
          quoteTotal={visibleQuote.total}
          title="Credito para esta cotizacion"
        />
      </div>
    </PageContainer>
  )
}
