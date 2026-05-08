import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { getCreditUsagePercent } from '../utils/customerPricing'
import type { Customer } from '../types/customer.types'

interface CustomerCreditBadgeProps {
  customer: Customer
}

export function CustomerCreditBadge({ customer }: CustomerCreditBadgeProps) {
  if (!customer.creditEnabled) {
    return <Badge tone="neutral">Sin credito</Badge>
  }

  const usage = getCreditUsagePercent(customer)
  const tone: BadgeTone = usage >= 90 ? 'danger' : usage >= 70 ? 'warning' : 'success'

  return (
    <Badge tone={tone}>
      {formatCurrency(customer.creditUsed)} / {formatCurrency(customer.creditLimit)}
    </Badge>
  )
}
