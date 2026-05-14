import { Link, useParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { EntityLink } from '../../../shared/components/EntityLink'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceItem } from '../../../shared/hooks/useResourceItem'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { QuoteCommunicationsPanel } from '../../communications/components/QuoteCommunicationsPanel'
import { CustomerCreditDecisionPanel } from '../../customers/components/CustomerCreditDecisionPanel'
import { customersMock } from '../../customers/mocks/customers.mock'
import type { Customer } from '../../customers/types/customer.types'
import type { CustomerCreditQuoteReference } from '../../customers/utils/customerPricing'
import { FreightCostBreakdown } from '../components/FreightCostBreakdown'
import { FreightFlowStepper } from '../components/FreightFlowStepper'
import { FreightQuoteItemsTable } from '../components/FreightQuoteItemsTable'
import { FreightRequestStatusBadge } from '../components/FreightRequestStatusBadge'
import { FreightRouteCard } from '../components/FreightRouteCard'
import { QuoteApprovalPanel } from '../components/QuoteApprovalPanel'
import { SendQuotePanel } from '../components/SendQuotePanel'
import { freightQuotesMock, freightRequestsMock } from '../mocks/freight.mock'
import type { FreightQuote, FreightRequest } from '../types/freight.types'
import styles from '../components/FreightModule.module.css'

export function FreightQuoteDetailPage() {
  const { quoteId } = useParams()
  const { data: quote } = useResourceItem('/freight/quotes', quoteId, freightQuotesMock)
  const { data: freightRequests } = useResourceList<FreightRequest>('/freight/requests', freightRequestsMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: customers } = useResourceList<Customer>('/customers', customersMock, {
    order: 'asc',
    sort: 'name',
  })
  const { data: freightQuotes } = useResourceList<FreightQuote>('/freight/quotes', freightQuotesMock, {
    order: 'desc',
    sort: 'createdAt',
  })

  if (!quote) {
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

  const request = freightRequests.find((item) => item.id === quote.requestId)
  const selectedCustomer = customers.find((customer) =>
    quote.customerId ? customer.id === quote.customerId : customer.name === quote.customerName,
  )
  const quoteReferences: CustomerCreditQuoteReference[] = freightQuotes.map((item) => ({
    customerId: item.customerId,
    customerName: item.customerName,
    id: item.id,
    quoteNumber: item.quoteNumber,
    source: 'freight',
    status: item.status,
    total: item.total,
  }))

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="inline-actions">
            {request ? (
              <Link to={ROUTES.freightRequestDetail(request.id)}>
                <Button size="sm" variant="secondary">
                  Ver solicitud
                </Button>
              </Link>
            ) : null}
            <Link to={ROUTES.freightAssignments}>
              <Button size="sm" variant="secondary">
                Asignar flete
              </Button>
            </Link>
          </div>
        }
        description={`${quote.customerName} - valida hasta ${formatDate(quote.validUntil)}`}
        title={
          <>
            <EntityLink id={quote.id} type="freightQuote">
              {quote.quoteNumber}
            </EntityLink>
          </>
        }
      />
      {request ? <FreightFlowStepper request={request} title="Flujo asociado a esta cotizacion" /> : null}
      <div className={styles.quoteComparison}>
        <div className="stack">
          {request ? <FreightRouteCard request={request} /> : null}
          <Card>
            <div className="stack">
              <h2 className="section-title">Desglose de items</h2>
              <FreightQuoteItemsTable quote={quote} />
            </div>
          </Card>
          <SendQuotePanel quote={quote} />
        </div>
        <div className="stack">
          <Card>
            <div className="stack">
              <div className="split-row">
                <h2 className="section-title">Resumen comercial</h2>
                <FreightRequestStatusBadge status={quote.status} type="quote" />
              </div>
              <div className={styles.priceHero}>
                <span className="muted-text">Total cotizado</span>
                <strong>{formatCurrency(quote.total)}</strong>
                <span>
                  Neto {formatCurrency(quote.subtotal)} / IVA {formatCurrency(quote.taxAmount)}
                </span>
              </div>
              <FreightCostBreakdown
                baseRate={quote.baseRate}
                cargoTypeSurcharge={quote.cargoTypeSurcharge}
                dieselPricePerLiter={quote.dieselPricePerLiter}
                estimatedKm={quote.estimatedKm}
                fuelCost={quote.fuelCost}
                fuelLiters={quote.fuelLiters}
                fuelPriceSource={quote.pricingSnapshot?.fuelPriceSource}
                kmRate={quote.kmRate}
                loadingCost={quote.loadingCost}
                marginAmount={quote.marginAmount}
                operationCost={quote.operationCost}
                operationCostPerKm={quote.operationCostPerKm}
                subtotal={quote.subtotal}
                taxAmount={quote.taxAmount}
                tollCost={quote.tollCost}
                total={quote.total}
                unloadingCost={quote.unloadingCost}
                waitingCost={quote.waitingCost}
              />
              <p className="muted-text">Valida hasta {formatDate(quote.validUntil)}</p>
            </div>
          </Card>
          <CustomerCreditDecisionPanel
            currentQuoteId={quote.id}
            customer={selectedCustomer}
            customerName={quote.customerName}
            quoteReferences={quoteReferences}
            quoteTotal={quote.total}
            title="Credito para esta cotizacion"
          />
          <QuoteCommunicationsPanel
            customerName={quote.customerName}
            quoteId={quote.id}
            quoteNumber={quote.quoteNumber}
            quoteStatus={quote.status}
            quoteTotal={quote.total}
            quoteType="freight"
          />
          <QuoteApprovalPanel quote={quote} />
        </div>
      </div>
    </PageContainer>
  )
}
