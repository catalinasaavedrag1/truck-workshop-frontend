import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
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
import { purchaseOrdersMock } from '../../purchase-orders/mocks/purchaseOrders.mock'
import type { PurchaseOrder } from '../../purchase-orders/types/purchaseOrder.types'
import { createSupplierInvoice, getCurrentActorName } from '../services/purchaseInvoices.service'
import type { SupplierInvoiceItem, SupplierPaymentTerms } from '../types/supplierInvoice.types'
import { computeInvoiceTotals, resolveDueDate } from '../utils/reconciliation'

const termsOptions = [
  { label: 'Contado', value: 'CONTADO' },
  { label: '15 dias', value: 'DIAS_15' },
  { label: '30 dias', value: 'DIAS_30' },
  { label: '60 dias', value: 'DIAS_60' },
]

function itemsFromPurchaseOrder(order: PurchaseOrder): SupplierInvoiceItem[] {
  return order.items.map((item) => ({
    sku: item.sku,
    name: item.name,
    orderedQuantity: item.quantity,
    receivedQuantity: item.quantity,
    invoicedQuantity: item.quantity,
    unitPrice: item.estimatedUnitCost,
  }))
}

export function SupplierInvoiceForm() {
  const navigate = useNavigate()
  const { data: purchaseOrders } = useResourceList<PurchaseOrder>('/purchase-orders', purchaseOrdersMock, {
    order: 'desc',
    sort: 'createdAt',
  })
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [terms, setTerms] = useState<SupplierPaymentTerms>('DIAS_30')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const selectedOrder = purchaseOrders.find((order) => order.id === selectedOrderId)
  const previewItems = useMemo(() => (selectedOrder ? itemsFromPurchaseOrder(selectedOrder) : []), [selectedOrder])
  const totals = useMemo(() => computeInvoiceTotals(previewItems), [previewItems])

  const orderOptions = [
    { label: 'Selecciona una orden de compra', value: '' },
    ...purchaseOrders.map((order) => ({
      label: `${order.purchaseOrderNumber} - ${order.supplierName}`,
      value: order.id,
    })),
  ]

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedOrder) {
      setErrorMessage('Selecciona la orden de compra que respalda la factura.')
      return
    }

    const formData = new FormData(event.currentTarget)
    const invoiceNumber = String(formData.get('invoiceNumber') || '').trim()

    if (!invoiceNumber) {
      setErrorMessage('Ingresa el folio de la factura del proveedor.')
      return
    }

    const invoiceDate = String(formData.get('invoiceDate') || '') || new Date().toISOString()
    const items = itemsFromPurchaseOrder(selectedOrder)
    const { net, tax, total } = computeInvoiceTotals(items)

    setIsSaving(true)
    setErrorMessage('')

    try {
      const invoice = await createSupplierInvoice({
        invoiceNumber,
        supplierName: selectedOrder.supplierName,
        purchaseOrderId: selectedOrder.id,
        purchaseOrderNumber: selectedOrder.purchaseOrderNumber,
        status: 'REGISTERED',
        invoiceDate,
        receivedAt: new Date().toISOString(),
        dueDate: resolveDueDate(invoiceDate, terms),
        paymentTerms: terms,
        items,
        net,
        tax,
        total,
        notes: String(formData.get('notes') || '').trim() || undefined,
      })

      toast.success('Factura registrada', `${invoice.invoiceNumber} quedo lista para conciliar.`)
      navigate(ROUTES.purchaseInvoiceDetail(invoice.id))
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
          <ErrorState description={errorMessage} title="No se pudo registrar la factura" />
        </div>
      ) : null}
      <Select
        label="Orden de compra"
        name="purchaseOrderId"
        onChange={(event) => setSelectedOrderId(event.target.value)}
        options={orderOptions}
        required
        value={selectedOrderId}
      />
      <Input label="Folio factura proveedor" name="invoiceNumber" placeholder="F-48213" required />
      <Input defaultValue={getCurrentActorName()} label="Recepcionada por" name="receivedBy" />
      <Input label="Fecha de emision" name="invoiceDate" type="date" />
      <Select
        label="Condicion de pago"
        name="paymentTerms"
        onChange={(event) => setTerms(event.target.value as SupplierPaymentTerms)}
        options={termsOptions}
        value={terms}
      />
      <Textarea className="span-2" label="Notas" name="notes" placeholder="Diferencias, respaldo, observaciones" />
      {selectedOrder ? (
        <div className="span-2 surface-panel stack-tight">
          <strong>
            {selectedOrder.purchaseOrderNumber} - {selectedOrder.supplierName}
          </strong>
          <p className="muted-text">
            {previewItems.length} item(s) - Neto {formatCurrency(totals.net)} + IVA {formatCurrency(totals.tax)} ={' '}
            <strong>{formatCurrency(totals.total)}</strong>
          </p>
        </div>
      ) : null}
      <div className="span-2 inline-actions">
        <Button icon={<Save size={18} />} loading={isSaving} type="submit">
          Registrar factura
        </Button>
      </div>
    </form>
  )
}
