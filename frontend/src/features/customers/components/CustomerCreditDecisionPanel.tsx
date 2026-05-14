import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { Customer } from '../types/customer.types'
import { getCustomerCreditDecision } from '../utils/customerPricing'
import type { CustomerCreditDecisionStatus, CustomerCreditQuoteReference } from '../utils/customerPricing'

interface CustomerCreditDecisionPanelProps {
  currentQuoteId?: string
  customer?: Customer
  customerName?: string
  quoteReferences?: CustomerCreditQuoteReference[]
  quoteTotal?: number
  title?: string
}

const decisionTone: Record<CustomerCreditDecisionStatus, BadgeTone> = {
  attention: 'warning',
  blocked: 'danger',
  'cash-only': 'warning',
  ok: 'success',
}

export function CustomerCreditDecisionPanel({
  currentQuoteId,
  customer,
  customerName,
  quoteReferences = [],
  quoteTotal = 0,
  title = 'Credito del cliente',
}: CustomerCreditDecisionPanelProps) {
  if (!customer) {
    return (
      <div className="surface-panel stack-tight">
        <div className="split-row">
          <strong>{title}</strong>
          <Badge tone="warning">Sin ficha</Badge>
        </div>
        <p className="muted-text">
          {customerName || 'Este cliente'} no tiene una ficha comercial vinculada. La cotizacion no puede validar cupo,
          plazo ni riesgo automaticamente.
        </p>
      </div>
    )
  }

  const decision = getCustomerCreditDecision(customer, {
    currentQuoteId,
    quoteReferences,
    quoteTotal,
  })

  return (
    <div className="surface-panel stack-tight">
      <div className="split-row">
        <strong>{title}</strong>
        <Badge tone={decisionTone[decision.status]}>{decision.label}</Badge>
      </div>
      <p className="muted-text">{decision.message}</p>
      <div className="three-column-grid compact-grid">
        <CreditMetric label="Usado actual" value={formatCurrency(decision.creditUsed)} />
        <CreditMetric label="Cotizaciones vigentes" value={formatCurrency(decision.quoteExposure)} />
        <CreditMetric label="Proyectado" value={formatCurrency(decision.projectedUsed)} />
      </div>
      <div className="three-column-grid compact-grid">
        <CreditMetric label="Cupo total" value={customer.creditEnabled ? formatCurrency(decision.creditLimit) : 'Sin linea'} />
        <CreditMetric label="Disponible final" value={formatCurrency(decision.availableCredit)} />
        <CreditMetric label="Plazo" value={`${customer.paymentTermsDays || 0} dias`} />
      </div>
      {quoteTotal > 0 ? (
        <p className="muted-text">
          Esta cotizacion agrega {formatCurrency(decision.quoteTotal)} al analisis comercial antes de enviarla o aprobarla.
        </p>
      ) : null}
    </div>
  )
}

interface CreditMetricProps {
  label: string
  value: string
}

function CreditMetric({ label, value }: CreditMetricProps) {
  return (
    <div className="surface-panel stack-tight">
      <span className="muted-text">{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
