import { Link, useParams } from 'react-router-dom'
import { AlertCircle, Plus } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { useResourceItem } from '../../../shared/hooks/useResourceItem'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { CARGO_TYPE_LABELS } from '../../freight/constants/cargoType.constants'
import { FreightRequestStatusBadge } from '../../freight/components/FreightRequestStatusBadge'
import { FreightRequestTable } from '../../freight/components/FreightRequestTable'
import { freightQuotesMock, freightRequestsMock } from '../../freight/mocks/freight.mock'
import type { FreightQuote, FreightRequest } from '../../freight/types/freight.types'
import { CustomerCreditBadge } from '../components/CustomerCreditBadge'
import { CustomerPriceListTable } from '../components/CustomerPriceListTable'
import { CustomerStatusBadge } from '../components/CustomerStatusBadge'
import { customersMock } from '../mocks/customers.mock'
import type { Customer } from '../types/customer.types'
import { getCreditUsagePercent } from '../utils/customerPricing'

export function CustomerDetailPage() {
  const { customerId } = useParams()
  const { data: customer } = useResourceItem<Customer>('/customers', customerId, customersMock)
  const { data: freightRequests } = useResourceList<FreightRequest>('/freight/requests', freightRequestsMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const { data: freightQuotes } = useResourceList<FreightQuote>('/freight/quotes', freightQuotesMock, {
    order: 'desc',
    sort: 'createdAt',
  })

  if (!customer) {
    return (
      <PageContainer>
        <EmptyState
          description="Revisa el identificador o vuelve al listado de clientes."
          icon={<AlertCircle size={22} />}
          title="Cliente no encontrado"
        />
      </PageContainer>
    )
  }

  const relatedRequests = freightRequests.filter((request) => matchesCustomer(request, customer))
  const relatedQuotes = freightQuotes.filter((quote) => quote.customerId === customer.id || quote.customerName === customer.name)
  const quoteColumns: TableColumn<FreightQuote>[] = [
    {
      header: 'Cotizacion',
      key: 'quoteNumber',
      render: (quote) => (
        <div>
          <strong>{quote.quoteNumber}</strong>
          <p className="muted-text">{CARGO_TYPE_LABELS[quote.cargoType]}</p>
        </div>
      ),
    },
    { align: 'right', header: 'KM', key: 'estimatedKm', render: (quote) => `${quote.estimatedKm.toLocaleString('es-CL')} km` },
    { align: 'right', header: 'Total', key: 'total', render: (quote) => formatCurrency(quote.total) },
    { header: 'Estado', key: 'status', render: (quote) => <FreightRequestStatusBadge status={quote.status} type="quote" /> },
    { header: 'Valida hasta', key: 'validUntil', render: (quote) => formatDate(quote.validUntil) },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (quote) => (
        <Link to={ROUTES.freightQuoteDetail(quote.id)}>
          <Button size="sm" variant="secondary">
            Ver
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        actions={
          <Link to={ROUTES.freightRequestNew}>
            <Button icon={<Plus size={18} />}>Nueva solicitud</Button>
          </Link>
        }
        description={`${customer.contactName || 'Sin contacto'} - ${customer.phone || 'sin telefono'}`}
        title={customer.name}
      />
      <div className="two-column-grid">
        <div className="stack">
          <Card>
            <div className="stack">
              <SectionHeader
                description="Condiciones comerciales que afectan solicitudes, cotizaciones y aprobaciones de flete."
                title="Condicion comercial"
              />
              <div className="three-column-grid compact-grid">
                <div className="surface-panel">
                  <p className="muted-text">Credito</p>
                  <strong>{customer.creditEnabled ? `${getCreditUsagePercent(customer)}% usado` : 'Sin credito'}</strong>
                  <p className="muted-text">{customer.creditEnabled ? <CustomerCreditBadge customer={customer} /> : 'Pago anticipado o contado'}</p>
                </div>
                <div className="surface-panel">
                  <p className="muted-text">Plazo de pago</p>
                  <strong>{customer.paymentTermsDays || 0} dias</strong>
                  <p className="muted-text">{customer.creditEnabled ? 'Cuenta corriente activa' : 'Sin cuenta corriente'}</p>
                </div>
                <div className="surface-panel">
                  <p className="muted-text">Estado</p>
                  <CustomerStatusBadge status={customer.status} />
                  <p className="muted-text">Riesgo {customer.riskLevel}</p>
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="stack">
              <SectionHeader
                description="Tarifas por tipo de carga usadas como referencia comercial al crear solicitudes y cotizaciones."
                title="Lista de precios"
              />
              <CustomerPriceListTable priceList={customer.priceList} />
            </div>
          </Card>
          <Card>
            <div className="stack">
              <SectionHeader
                description="Solicitudes vinculadas por cliente para ver continuidad operacional y estado del flujo."
                title="Solicitudes asociadas"
              />
              <FreightRequestTable requests={relatedRequests} />
            </div>
          </Card>
        </div>
        <div className="stack">
          <Card>
            <dl className="detail-list">
              <div>
                <dt>RUT</dt>
                <dd>{customer.rut || 'Sin RUT'}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{customer.email || 'Sin correo'}</dd>
              </div>
              <div>
                <dt>Facturacion</dt>
                <dd>{customer.billingAddress || 'Sin direccion'}</dd>
              </div>
              <div>
                <dt>Origenes</dt>
                <dd>{customer.preferredOrigins.join(', ') || 'Sin origenes'}</dd>
              </div>
              <div>
                <dt>Destinos</dt>
                <dd>{customer.preferredDestinations.join(', ') || 'Sin destinos'}</dd>
              </div>
              <div>
                <dt>Tipos de flete</dt>
                <dd>{customer.freightTypes.map((type) => CARGO_TYPE_LABELS[type]).join(', ')}</dd>
              </div>
              <div>
                <dt>Creado por</dt>
                <dd>{customer.createdBy || 'Sistema'}</dd>
              </div>
              <div>
                <dt>Ultima modificacion</dt>
                <dd>{customer.updatedBy || 'Sistema'}</dd>
              </div>
            </dl>
          </Card>
          <Card>
            <div className="stack">
              <SectionHeader
                description="Cotizaciones del cliente con monto, vigencia y decision."
                title="Cotizaciones"
              />
              <Table
                columns={quoteColumns}
                data={relatedQuotes}
                density="compact"
                emptyDescription="Aun no hay cotizaciones asociadas a este cliente."
                emptyLabel="Sin cotizaciones"
                getRowHref={(quote) => ROUTES.freightQuoteDetail(quote.id)}
                getRowKey={(quote) => quote.id}
                getRowLabel={(quote) => `Abrir cotizacion ${quote.quoteNumber}`}
              />
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

function matchesCustomer(request: FreightRequest, customer: Customer) {
  return request.customerId === customer.id || request.customerName === customer.name
}
