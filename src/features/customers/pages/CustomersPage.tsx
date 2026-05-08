import { useMemo, useState } from 'react'
import { FilterBar } from '../../../shared/components/FilterBar/FilterBar'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { Select } from '../../../shared/components/Select/Select'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { CARGO_TYPE_LABELS, CARGO_TYPE_OPTIONS } from '../../freight/constants/cargoType.constants'
import type { CargoType } from '../../freight/types/freight.types'
import { CustomerForm } from '../components/CustomerForm'
import { CustomerSummaryCards } from '../components/CustomerSummaryCards'
import { CustomerTable } from '../components/CustomerTable'
import { CREDIT_FILTER_OPTIONS, CUSTOMER_RISK_LABELS, CUSTOMER_RISK_OPTIONS, CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_OPTIONS } from '../constants/customer.constants'
import { customersMock } from '../mocks/customers.mock'
import { deleteCustomer } from '../services/customers.service'
import type { Customer, CustomerRiskLevel, CustomerStatus } from '../types/customer.types'

type CreditFilter = 'all' | 'with-credit' | 'without-credit'

export function CustomersPage() {
  const [savedCustomers, setSavedCustomers] = useState<Customer[]>([])
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [deletingId, setDeletingId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<CustomerStatus | 'all'>('all')
  const [riskLevel, setRiskLevel] = useState<CustomerRiskLevel | 'all'>('all')
  const [creditFilter, setCreditFilter] = useState<CreditFilter>('all')
  const [cargoType, setCargoType] = useState<CargoType | 'all'>('all')
  const { data: customersData, isLoading } = useResourceList<Customer>('/customers', customersMock, {
    order: 'asc',
    sort: 'name',
  })

  const customers = useMemo(() => {
    const savedById = new Map(savedCustomers.map((customer) => [customer.id, customer]))

    return [
      ...customersData.filter((customer) => !deletedIds.includes(customer.id) && !savedById.has(customer.id)),
      ...savedCustomers.filter((customer) => !deletedIds.includes(customer.id)),
    ].sort((first, second) => first.name.localeCompare(second.name))
  }, [customersData, deletedIds, savedCustomers])

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return customers.filter((customer) => {
      const searchable = [
        customer.name,
        customer.rut || '',
        customer.contactName || '',
        customer.phone || '',
        customer.email || '',
        customer.billingAddress || '',
        customer.preferredOrigins.join(' '),
        customer.preferredDestinations.join(' '),
        customer.freightTypes.map((type) => CARGO_TYPE_LABELS[type]).join(' '),
      ].join(' ').toLowerCase()
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery)
      const matchesStatus = status === 'all' || customer.status === status
      const matchesRisk = riskLevel === 'all' || customer.riskLevel === riskLevel
      const matchesCredit =
        creditFilter === 'all' ||
        (creditFilter === 'with-credit' && customer.creditEnabled) ||
        (creditFilter === 'without-credit' && !customer.creditEnabled)
      const matchesCargo = cargoType === 'all' || customer.freightTypes.includes(cargoType)

      return matchesQuery && matchesStatus && matchesRisk && matchesCredit && matchesCargo
    })
  }, [cargoType, creditFilter, customers, query, riskLevel, status])

  const handleSaved = (customer: Customer) => {
    setSavedCustomers((current) => [
      customer,
      ...current.filter((item) => item.id !== customer.id),
    ])
    setDeletedIds((current) => current.filter((id) => id !== customer.id))
    setSelectedCustomer(null)
    setErrorMessage('')
  }

  const handleDelete = async (customer: Customer) => {
    if (!window.confirm(`Eliminar cliente ${customer.name}?`)) {
      return
    }

    setDeletingId(customer.id)
    setErrorMessage('')

    try {
      await deleteCustomer(customer.id)
      setDeletedIds((current) => Array.from(new Set([...current, customer.id])))
      setSelectedCustomer((current) => (current?.id === customer.id ? null : current))
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setDeletingId('')
    }
  }

  const activeFilters = [
    ...(query ? [{ label: 'Busqueda', onRemove: () => setQuery(''), value: query }] : []),
    ...(status !== 'all'
      ? [{ label: 'Estado', onRemove: () => setStatus('all'), value: CUSTOMER_STATUS_LABELS[status] }]
      : []),
    ...(riskLevel !== 'all'
      ? [{ label: 'Riesgo', onRemove: () => setRiskLevel('all'), value: CUSTOMER_RISK_LABELS[riskLevel] }]
      : []),
    ...(creditFilter !== 'all'
      ? [{
          label: 'Credito',
          onRemove: () => setCreditFilter('all'),
          value: CREDIT_FILTER_OPTIONS.find((option) => option.value === creditFilter)?.label,
        }]
      : []),
    ...(cargoType !== 'all'
      ? [{ label: 'Flete', onRemove: () => setCargoType('all'), value: CARGO_TYPE_LABELS[cargoType] }]
      : []),
  ]

  return (
    <PageContainer>
      <PageHeader
        description="Clientes mandantes con tarifas diferenciales, credito, rutas frecuentes y tipos de flete asociados."
        title="Clientes transportista"
      />
      <CustomerSummaryCards customers={customers} />
      {errorMessage ? <ErrorState description={errorMessage} title="No se pudo eliminar el cliente" /> : null}
      <FilterBar
        activeCount={activeFilters.length}
        activeFilters={activeFilters}
        description="Filtra por datos comerciales, cupo de credito, riesgo y tipo de flete solicitado."
        onClear={() => {
          setQuery('')
          setStatus('all')
          setRiskLevel('all')
          setCreditFilter('all')
          setCargoType('all')
        }}
        title="Buscar clientes"
      >
        <Input
          label="Busqueda"
          name="customerSearch"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cliente, RUT, contacto, ruta..."
          value={query}
        />
        <Select
          label="Estado"
          name="customerStatus"
          onChange={(event) => setStatus(event.target.value as CustomerStatus | 'all')}
          options={CUSTOMER_STATUS_OPTIONS}
          value={status}
        />
        <Select
          label="Credito"
          name="customerCredit"
          onChange={(event) => setCreditFilter(event.target.value as CreditFilter)}
          options={CREDIT_FILTER_OPTIONS}
          value={creditFilter}
        />
        <Select
          label="Tipo de flete"
          name="customerCargoType"
          onChange={(event) => setCargoType(event.target.value as CargoType | 'all')}
          options={[{ label: 'Todos', value: 'all' }, ...CARGO_TYPE_OPTIONS]}
          value={cargoType}
        />
        <Select
          label="Riesgo"
          name="customerRisk"
          onChange={(event) => setRiskLevel(event.target.value as CustomerRiskLevel | 'all')}
          options={CUSTOMER_RISK_OPTIONS}
          value={riskLevel}
        />
      </FilterBar>
      <div className="two-column-grid">
        <Card>
          <div className="stack">
            <SectionHeader
              description="La tabla permite leer cliente, contacto, credito, condicion y tipos de flete sin entrar al detalle."
              title="Cartera operativa"
            />
            <CustomerTable
              customers={filteredCustomers}
              deletingId={deletingId}
              isLoading={isLoading}
              onDelete={handleDelete}
              onEdit={setSelectedCustomer}
            />
          </div>
        </Card>
        <Card>
          <div className="stack">
            <SectionHeader
              description={
                selectedCustomer
                  ? 'Actualiza datos comerciales, credito y tarifas diferenciales.'
                  : 'Crea el cliente y deja sus condiciones listas para solicitudes de flete.'
              }
              title={selectedCustomer ? `Editar ${selectedCustomer.name}` : 'Crear cliente'}
            />
            <CustomerForm
              customer={selectedCustomer}
              key={selectedCustomer?.id || 'new-customer'}
              onCancel={() => setSelectedCustomer(null)}
              onSaved={handleSaved}
            />
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
