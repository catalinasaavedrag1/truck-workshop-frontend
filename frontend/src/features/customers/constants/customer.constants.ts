import type { CustomerRiskLevel, CustomerStatus } from '../types/customer.types'

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  suspended: 'Suspendido',
}

export const CUSTOMER_STATUS_OPTIONS: Array<{ label: string; value: CustomerStatus | 'all' }> = [
  { label: 'Todos', value: 'all' },
  { label: CUSTOMER_STATUS_LABELS.active, value: 'active' },
  { label: CUSTOMER_STATUS_LABELS.suspended, value: 'suspended' },
  { label: CUSTOMER_STATUS_LABELS.inactive, value: 'inactive' },
]

export const CUSTOMER_RISK_LABELS: Record<CustomerRiskLevel, string> = {
  high: 'Alto',
  low: 'Bajo',
  medium: 'Medio',
}

export const CUSTOMER_RISK_OPTIONS: Array<{ label: string; value: CustomerRiskLevel | 'all' }> = [
  { label: 'Todos', value: 'all' },
  { label: CUSTOMER_RISK_LABELS.low, value: 'low' },
  { label: CUSTOMER_RISK_LABELS.medium, value: 'medium' },
  { label: CUSTOMER_RISK_LABELS.high, value: 'high' },
]

export const CREDIT_FILTER_OPTIONS = [
  { label: 'Todos', value: 'all' },
  { label: 'Con credito', value: 'with-credit' },
  { label: 'Sin credito', value: 'without-credit' },
]

export const INTERNAL_CUSTOMER_VALUE = '__internal__'
