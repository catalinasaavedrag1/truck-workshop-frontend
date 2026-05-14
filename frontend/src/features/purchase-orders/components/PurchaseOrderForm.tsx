import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { casesMock } from '../../../mocks/cases.mock'
import { partsMock } from '../../../mocks/parts.mock'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { Part } from '../../parts/types/part.types'
import { suppliersMock } from '../../suppliers/mocks/suppliers.mock'
import type { Supplier } from '../../suppliers/types/supplier.types'
import { warehouseStockMock } from '../../warehouse/mocks/warehouse.mock'
import { getStockLabel, getStockTone } from '../../warehouse/services/warehouseInsights.service'
import type { WarehouseStockItem } from '../../warehouse/types/warehouse.types'
import { createPurchaseOrder, getCurrentActorName } from '../services/purchaseOrders.service'
import type { PurchaseOrderStatus } from '../types/purchaseOrder.types'

const caseOptions = [
  { label: 'Sin caso relacionado', value: '' },
  ...casesMock.map((workshopCase) => ({
    label: `${workshopCase.caseNumber} - ${workshopCase.customerName}`,
    value: workshopCase.id,
  })),
]

const statusOptions = [
  { label: 'Borrador', value: 'DRAFT' },
  { label: 'Solicitada', value: 'REQUESTED' },
  { label: 'Aprobada', value: 'APPROVED' },
]

export function PurchaseOrderForm() {
  const navigate = useNavigate()
  const [selectedPartId, setSelectedPartId] = useState(partsMock[0]?.id || '')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { data: suppliers } = useResourceList<Supplier>('/suppliers', suppliersMock, { order: 'asc', sort: 'name' })
  const { data: parts } = useResourceList<Part>('/parts', partsMock, { order: 'asc', sort: 'sku' })
  const { data: stockItems } = useResourceList<WarehouseStockItem>('/warehouse/stock', warehouseStockMock, {
    order: 'asc',
    sort: 'sku',
  })
  const selectedPart = parts.find((part) => part.id === selectedPartId) || parts[0]
  const selectedStock = stockItems.find((item) => item.partId === selectedPart?.id || item.sku === selectedPart?.sku)
  const selectedQuantity = selectedStock?.quantity ?? selectedPart?.stock ?? 0
  const selectedMinStock = selectedStock?.minStock ?? selectedPart?.minStock ?? 0
  const reorderSuggestion = Math.max(selectedMinStock * 2 - selectedQuantity, 0)
  const supplierOptions = useMemo(
    () => suppliers
      .filter((supplier) => supplier.status !== 'inactive')
      .map((supplier) => ({ label: supplier.name, value: supplier.name })),
    [suppliers],
  )
  const partOptions = useMemo(
    () => parts.map((part) => ({ label: `${part.sku} - ${part.name}`, value: part.id })),
    [parts],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const relatedCaseId = String(formData.get('relatedCaseId') || '').trim()
    const quantity = Number(formData.get('quantity') || 1)
    const estimatedUnitCost = Number(formData.get('estimatedUnitCost') || selectedPart?.unitCost || 0)
    const itemName = String(formData.get('itemName') || selectedPart?.name || '').trim()
    const sku = String(formData.get('sku') || selectedPart?.sku || '').trim().toUpperCase()

    setIsSaving(true)
    setErrorMessage('')

    try {
      const purchaseOrder = await createPurchaseOrder({
        approvedBy: String(formData.get('approvedBy') || '').trim() || undefined,
        expectedDeliveryDate: String(formData.get('expectedDeliveryDate') || defaultDeliveryDate()),
        items: [
          {
            estimatedUnitCost,
            name: itemName,
            partId: selectedPart?.id || sku,
            quantity,
            requiredForCaseId: relatedCaseId || undefined,
            sku,
          },
        ],
        relatedCaseId: relatedCaseId || undefined,
        requestedBy: String(formData.get('requestedBy') || getCurrentActorName()).trim(),
        status: String(formData.get('status') || 'REQUESTED') as PurchaseOrderStatus,
        supplierName: String(formData.get('supplierName') || '').trim(),
        totalEstimated: quantity * estimatedUnitCost,
      })

      navigate(ROUTES.purchaseOrderDetail(purchaseOrder.id))
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
          <ErrorState description={errorMessage} title="No se pudo crear la orden de compra" />
        </div>
      ) : null}
      <Select label="Proveedor" name="supplierName" options={supplierOptions} required />
      <Select label="Caso relacionado" name="relatedCaseId" options={caseOptions} />
      <Input defaultValue={getCurrentActorName()} label="Solicitado por" name="requestedBy" placeholder="Felipe Araya" required />
      <Input defaultValue={defaultDeliveryDate()} label="Entrega esperada" name="expectedDeliveryDate" required type="date" />
      <Select defaultValue="REQUESTED" label="Estado inicial" name="status" options={statusOptions} />
      <Input label="Aprobado por" name="approvedBy" placeholder="Pendiente" />
      <Select
        className="span-2"
        label="SKU / repuesto"
        name="partId"
        onChange={(event) => setSelectedPartId(event.target.value)}
        options={partOptions}
        value={selectedPart?.id || ''}
      />
      {selectedPart ? (
        <div className="span-2 surface-panel">
          <div className="list-row">
            <div className="stack-tight">
              <strong>{selectedPart.sku} - contexto de compra</strong>
              <span className="muted-text">
                {selectedPart.category} - ubicacion {selectedStock?.locationCode || 'sin ubicacion'} - costo{' '}
                {formatCurrency(selectedPart.unitCost)}
              </span>
            </div>
            <div className="inline-actions">
              <Badge tone={selectedStock ? getStockTone(selectedStock.status) : 'neutral'}>
                {selectedStock ? getStockLabel(selectedStock.status) : 'Sin stock fisico'}
              </Badge>
              <Badge tone={reorderSuggestion > 0 ? 'warning' : 'success'}>Sugerido {reorderSuggestion} u.</Badge>
            </div>
          </div>
          <span className="muted-text">
            Stock actual {selectedQuantity}/{selectedMinStock}. Esta OC queda conectada al SKU, al proveedor y al caso si lo seleccionas.
          </span>
        </div>
      ) : null}
      <Input defaultValue={selectedPart?.sku} key={`sku-${selectedPart?.id}`} label="SKU" name="sku" placeholder="BRK-2210" required />
      <Input defaultValue={1} label="Cantidad" min={1} name="quantity" required type="number" />
      <Input
        className="span-2"
        defaultValue={selectedPart?.name}
        key={`name-${selectedPart?.id}`}
        label="Item principal"
        name="itemName"
        placeholder="Nombre del repuesto"
        required
      />
      <Input
        defaultValue={selectedPart?.unitCost ?? 0}
        key={`cost-${selectedPart?.id}`}
        label="Costo unitario estimado"
        min={0}
        name="estimatedUnitCost"
        step={100}
        type="number"
      />
      <div className="span-2 inline-actions">
        <Button disabled={isSaving} icon={<Save size={18} />} type="submit">
          {isSaving ? 'Guardando...' : 'Crear orden'}
        </Button>
        <Button disabled={isSaving} onClick={() => navigate(ROUTES.purchaseOrders)} type="button" variant="secondary">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function defaultDeliveryDate() {
  const date = new Date()
  date.setDate(date.getDate() + 3)

  return date.toISOString().slice(0, 10)
}
