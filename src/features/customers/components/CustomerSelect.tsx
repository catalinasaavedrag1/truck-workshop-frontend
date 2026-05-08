import { Select } from '../../../shared/components/Select/Select'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { INTERNAL_CUSTOMER_VALUE } from '../constants/customer.constants'
import { customersMock } from '../mocks/customers.mock'
import type { Customer } from '../types/customer.types'

interface CustomerSelectProps {
  className?: string
  includeInternalOption?: boolean
  label?: string
  name?: string
  onCustomerChange: (customer: Customer | undefined, value: string) => void
  required?: boolean
  value: string
}

export function CustomerSelect({
  className,
  includeInternalOption = false,
  label = 'Cliente',
  name = 'customerId',
  onCustomerChange,
  required = false,
  value,
}: CustomerSelectProps) {
  const { data: customers } = useResourceList<Customer>('/customers', customersMock, { order: 'asc', sort: 'name' })
  const activeCustomers = customers.filter((customer) => customer.status !== 'inactive')
  const options = [
    { label: includeInternalOption ? 'Selecciona cliente u operacion interna' : 'Selecciona cliente', value: '' },
    ...(includeInternalOption ? [{ label: 'Operacion interna / sin cliente mandante', value: INTERNAL_CUSTOMER_VALUE }] : []),
    ...activeCustomers.map((customer) => ({
      label: `${customer.name}${customer.rut ? ` - ${customer.rut}` : ''}`,
      value: customer.id,
    })),
  ]

  return (
    <Select
      className={className}
      label={label}
      name={name}
      onChange={(event) => {
        const nextValue = event.target.value

        onCustomerChange(activeCustomers.find((customer) => customer.id === nextValue), nextValue)
      }}
      options={options}
      required={required}
      value={value}
    />
  )
}
