import { ROUTES } from '../../../config/routes'
import { MetricCard } from '../../../shared/components/MetricCard/MetricCard'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { getCreditUsagePercent } from '../utils/customerPricing'
import type { Customer } from '../types/customer.types'

interface CustomerSummaryCardsProps {
  customers: Customer[]
}

export function CustomerSummaryCards({ customers }: CustomerSummaryCardsProps) {
  const activeCustomers = customers.filter((customer) => customer.status === 'active').length
  const creditCustomers = customers.filter((customer) => customer.creditEnabled).length
  const creditExposure = customers.reduce((total, customer) => total + (customer.creditEnabled ? customer.creditUsed : 0), 0)
  const highRiskCustomers = customers.filter((customer) => customer.riskLevel === 'high' || getCreditUsagePercent(customer) >= 90).length

  return (
    <div className="metric-grid">
      <MetricCard helper="Disponibles para nuevas solicitudes" label="Clientes activos" to={`${ROUTES.customers}?status=active`} value={activeCustomers} />
      <MetricCard helper={`${creditCustomers} con cuenta corriente`} label="Credito usado" to={ROUTES.customers} value={formatCurrency(creditExposure)} />
      <MetricCard helper="Tarifas comerciales configuradas" label="Listas de precio" to={ROUTES.customers} value={customers.reduce((total, customer) => total + customer.priceList.length, 0)} />
      <MetricCard
        helper={highRiskCustomers > 0 ? 'Revisar antes de aprobar' : 'Sin alertas comerciales'}
        label="Riesgo comercial"
        tone={highRiskCustomers > 0 ? 'warning' : 'neutral'}
        to={ROUTES.customers}
        value={highRiskCustomers}
      />
    </div>
  )
}
