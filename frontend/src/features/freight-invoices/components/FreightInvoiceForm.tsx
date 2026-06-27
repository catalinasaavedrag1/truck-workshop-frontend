import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Save } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { Textarea } from '../../../shared/components/Textarea/Textarea'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { toast } from '../../../shared/services/toastStore'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { customersMock } from '../../customers/mocks/customers.mock'
import type { Customer } from '../../customers/types/customer.types'
import { freightRequestsMock } from '../../freight/mocks/freight.mock'
import type { FreightRequest } from '../../freight/types/freight.types'
import { FreightInvoiceLinesTable } from './FreightInvoiceLinesTable'
import { createFreightInvoice, getCurrentActorName } from '../services/freightInvoices.service'
import type { FreightInvoiceLine, FreightPaymentTerms } from '../types/freightInvoice.types'
import { FREIGHT_RATE_PER_KM, computeFreightInvoiceTotals, resolveDueDate } from '../utils/freightInvoiceTotals'

const termsOptions = [
  { label: 'Contado', value: 'CONTADO' },
  { label: '15 dias', value: 'DIAS_15' },
  { label: '30 dias', value: 'DIAS_30' },
  { label: '60 dias', value: 'DIAS_60' },
]

const BILLABLE_STATUSES = new Set(['APPROVED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'])

function lineFromRequest(request: FreightRequest, date: string): FreightInvoiceLine {
  return {
    date,
    description: `Flete ${request.originAddress} -> ${request.destinationAddress}`,
    reference: request.requestNumber,
    freightRequestId: request.id,
    kind: 'FREIGHT',
    amount: Math.max(0, Math.round(request.estimatedKm * FREIGHT_RATE_PER_KM)),
  }
}

export function FreightInvoiceForm() {
  const navigate = useNavigate()
  const { data: customers } = useResourceList<Customer>('/customers', customersMock, { order: 'asc', sort: 'name' })
  const { data: requests } = useResourceList<FreightRequest>('/freight/requests', freightRequestsMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const [customerId, setCustomerId] = useState('')
  const [terms, setTerms] = useState<FreightPaymentTerms>('DIAS_30')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const issueDate = new Date().toISOString()
  const customer = customers.find((item) => item.id === customerId)
  const billableRequests = useMemo(
    () =>
      requests.filter(
        (request) => (request.customerId === customerId || request.customerName === customer?.name) && BILLABLE_STATUSES.has(request.status),
      ),
    [requests, customerId, customer],
  )
  const previewLines = useMemo(
    () => billableRequests.map((request) => lineFromRequest(request, issueDate)),
    [billableRequests, issueDate],
  )
  const totals = computeFreightInvoiceTotals(previewLines)

  const customerOptions = [
    { label: 'Selecciona un cliente', value: '' },
    ...customers.map((item) => ({ label: item.name, value: item.id })),
  ]

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!customer) {
      setErrorMessage('Selecciona el cliente a facturar.')
      return
    }
    if (previewLines.length === 0) {
      setErrorMessage('Este cliente no tiene fletes facturables en el periodo.')
      return
    }

    const formData = new FormData(event.currentTarget)
    const invoiceNumber = String(formData.get('invoiceNumber') || '').trim()

    if (!invoiceNumber) {
      setErrorMessage('Ingresa el folio de la factura electronica.')
      return
    }

    const { net, tax, total } = computeFreightInvoiceTotals(previewLines)

    setIsSaving(true)
    setErrorMessage('')

    try {
      const invoice = await createFreightInvoice({
        invoiceNumber,
        customerId: customer.id,
        customerName: customer.name,
        status: 'ISSUED',
        issueDate,
        dueDate: resolveDueDate(issueDate, terms),
        paymentTerms: terms,
        lines: previewLines,
        backupDocuments: ['Carta de porte', 'Comprobante de entrega', 'Registro GPS'],
        net,
        tax,
        total,
        notes: String(formData.get('notes') || '').trim() || undefined,
      })

      toast.success('Factura emitida', `${invoice.invoiceNumber} consolido ${previewLines.length} flete(s).`)
      navigate(ROUTES.freightInvoiceDetail(invoice.id))
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {errorMessage ? (
        <div className="span-2">
          <ErrorState description={errorMessage} title="No se pudo emitir la factura" />
        </div>
      ) : null}
      <Select
        label="Cliente"
        name="customerId"
        onChange={(event) => setCustomerId(event.target.value)}
        options={customerOptions}
        required
        value={customerId}
      />
      <Input label="Folio factura electronica" name="invoiceNumber" placeholder="F-001245" required />
      <Input defaultValue={getCurrentActorName()} label="Emitida por" name="issuedBy" />
      <Select
        label="Condicion de pago"
        name="paymentTerms"
        onChange={(event) => setTerms(event.target.value as FreightPaymentTerms)}
        options={termsOptions}
        value={terms}
      />
      <Textarea className="span-2" label="Notas" name="notes" placeholder="Periodo consolidado, observaciones" />
      {customer ? (
        <div className="span-2 stack">
          <div className="surface-panel split-row">
            <span>
              <FileText aria-hidden size={15} /> Consolidado de {previewLines.length} flete(s) de {customer.name}
            </span>
            <strong>{formatCurrency(totals.total)}</strong>
          </div>
          {previewLines.length > 0 ? <FreightInvoiceLinesTable lines={previewLines} /> : (
            <p className="muted-text">Sin fletes facturables (estados APPROVED, ASSIGNED, IN_TRANSIT, DELIVERED o COMPLETED).</p>
          )}
        </div>
      ) : null}
      <div className="span-2 inline-actions">
        <Button icon={<Save size={18} />} loading={isSaving} type="submit">
          Emitir factura
        </Button>
      </div>
    </form>
  )
}
