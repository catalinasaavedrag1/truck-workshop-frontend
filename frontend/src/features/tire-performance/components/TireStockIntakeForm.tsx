import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { PackagePlus, Save } from 'lucide-react'
import { partsMock } from '../../../mocks/parts.mock'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { purchaseOrdersMock } from '../../purchase-orders/mocks/purchaseOrders.mock'
import type { PurchaseOrder } from '../../purchase-orders/types/purchaseOrder.types'
import { suppliersMock } from '../../suppliers/mocks/suppliers.mock'
import type { Supplier } from '../../suppliers/types/supplier.types'
import type { Part } from '../../parts/types/part.types'
import {
  TIRE_TYPE_OPTIONS,
  TIRE_USAGE_OPTIONS,
} from '../constants/tirePerformance.constants'
import { createTireStockBatch, getCurrentActorName } from '../services/tirePerformance.service'
import type { TireLifecycle, TireType, TireUsageType } from '../types/tirePerformance.types'
import styles from './TireStockIntakeForm.module.css'

const today = new Date().toISOString().slice(0, 10)

export function TireStockIntakeForm() {
  const { data: parts, isLoading: isLoadingParts } = useResourceList<Part>('/parts', partsMock, {
    order: 'asc',
    sort: 'sku',
  })
  const { data: suppliers, isLoading: isLoadingSuppliers } = useResourceList<Supplier>('/suppliers', suppliersMock, {
    order: 'asc',
    sort: 'name',
  })
  const { data: purchaseOrders, isLoading: isLoadingPurchaseOrders } = useResourceList<PurchaseOrder>(
    '/purchase-orders',
    purchaseOrdersMock,
    { order: 'desc', sort: 'createdAt' },
  )
  const tireParts = useMemo(
    () =>
      parts.filter((part) =>
        `${part.category} ${part.name} ${part.sku}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes('neumatic'),
      ),
    [parts],
  )
  const tirePurchaseOrders = useMemo(
    () =>
      purchaseOrders.filter((purchaseOrder) =>
        purchaseOrder.items.some((item) =>
          `${item.sku} ${item.name}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes('neumatic'),
        ),
      ),
    [purchaseOrders],
  )
  const [skuId, setSkuId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [purchaseOrderId, setPurchaseOrderId] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [tireSize, setTireSize] = useState('')
  const [tireType, setTireType] = useState<TireType>('NEW')
  const [usageType, setUsageType] = useState<TireUsageType>('TRACTION')
  const [quantity, setQuantity] = useState('1')
  const [purchaseCost, setPurchaseCost] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(today)
  const [notes, setNotes] = useState('')
  const [savedTires, setSavedTires] = useState<TireLifecycle[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const selectedSkuId = skuId || tireParts[0]?.id || ''
  const selectedPart = tireParts.find((part) => part.id === selectedSkuId)
  const selectedPurchaseOrder = tirePurchaseOrders.find((purchaseOrder) => purchaseOrder.id === purchaseOrderId)
  const selectedSupplier =
    suppliers.find((supplier) => supplier.id === supplierId) ||
    suppliers.find((supplier) => supplier.name === selectedPurchaseOrder?.supplierName)
  const selectedCost = Number(purchaseCost || selectedPart?.unitCost || 0)
  const selectedQuantity = Number(quantity || 0)
  const isLoading = isLoadingParts || isLoadingSuppliers || isLoadingPurchaseOrders
  const errors = [
    tireParts.length === 0 ? 'No hay SKUs de neumaticos en repuestos. Crea primero el SKU en inventario.' : '',
    !selectedPart ? 'Selecciona el SKU del neumatico.' : '',
    !selectedSupplier && !selectedPurchaseOrder ? 'Selecciona proveedor u orden de compra recibida.' : '',
    !brand.trim() ? 'Ingresa marca del neumatico.' : '',
    selectedCost <= 0 ? 'Ingresa costo unitario mayor a cero.' : '',
    !Number.isInteger(selectedQuantity) || selectedQuantity < 1 ? 'La cantidad debe ser un entero mayor a cero.' : '',
    selectedQuantity > 100 ? 'La cantidad maxima por ingreso es 100 unidades.' : '',
    !purchaseDate ? 'Ingresa fecha de compra/recepcion.' : '',
  ].filter(Boolean)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (errors.length > 0 || !selectedPart) {
      return
    }

    setErrorMessage('')
    setSavedTires([])
    setIsSaving(true)

    try {
      const created = await createTireStockBatch({
        brand: brand.trim(),
        model: model.trim(),
        notes: notes.trim(),
        purchaseCost: selectedCost,
        purchaseDate: toIsoDate(purchaseDate),
        purchaseOrderId: selectedPurchaseOrder?.id,
        quantity: selectedQuantity,
        skuCode: selectedPart.sku,
        skuId: selectedPart.id,
        skuName: selectedPart.name,
        status: 'IN_STOCK',
        supplierId: selectedSupplier?.id,
        supplierName: selectedSupplier?.name || selectedPurchaseOrder?.supplierName || '',
        tireSize: tireSize.trim(),
        tireType,
        usageType,
      })

      setSavedTires(created)
      setQuantity('1')
      setNotes('')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={styles.intakeLayout}>
      <Card>
        <form className="form-grid" onSubmit={handleSubmit}>
          {errorMessage ? <ErrorState description={errorMessage} title="No se pudo ingresar stock" /> : null}
          <Select
            label="SKU de inventario"
            name="skuId"
            onChange={(event) => {
              const nextPart = tireParts.find((part) => part.id === event.target.value)

              setSkuId(event.target.value)
              if (nextPart && !purchaseCost) {
                setPurchaseCost(String(nextPart.unitCost))
              }
            }}
            options={
              tireParts.length > 0
                ? tireParts.map((part) => ({ label: `${part.sku} - ${part.name}`, value: part.id }))
                : [{ label: 'Sin SKUs de neumaticos', value: '' }]
            }
            value={selectedSkuId}
          />
          <Select
            label="Orden de compra"
            name="purchaseOrderId"
            onChange={(event) => setPurchaseOrderId(event.target.value)}
            options={[
              { label: 'Sin OC asociada', value: '' },
              ...tirePurchaseOrders.map((purchaseOrder) => ({
                label: `${purchaseOrder.purchaseOrderNumber} - ${purchaseOrder.supplierName}`,
                value: purchaseOrder.id,
              })),
            ]}
            value={purchaseOrderId}
          />
          <Select
            label="Proveedor"
            name="supplierId"
            onChange={(event) => setSupplierId(event.target.value)}
            options={[
              { label: selectedPurchaseOrder ? `Desde OC: ${selectedPurchaseOrder.supplierName}` : 'Selecciona proveedor', value: '' },
              ...suppliers.map((supplier) => ({ label: supplier.name, value: supplier.id })),
            ]}
            value={supplierId}
          />
          <Input label="Marca" name="brand" onChange={(event) => setBrand(event.target.value)} value={brand} />
          <Input label="Modelo" name="model" onChange={(event) => setModel(event.target.value)} value={model} />
          <Input label="Medida" name="tireSize" onChange={(event) => setTireSize(event.target.value)} placeholder="295/80R22.5" value={tireSize} />
          <Select
            label="Tipo"
            name="tireType"
            onChange={(event) => setTireType(event.target.value as TireType)}
            options={TIRE_TYPE_OPTIONS.filter((option) => option.value !== 'all')}
            value={tireType}
          />
          <Select
            label="Uso esperado"
            name="usageType"
            onChange={(event) => setUsageType(event.target.value as TireUsageType)}
            options={TIRE_USAGE_OPTIONS.filter((option) => option.value !== 'all')}
            value={usageType}
          />
          <Input
            label="Cantidad"
            min={1}
            name="quantity"
            onChange={(event) => setQuantity(event.target.value)}
            type="number"
            value={quantity}
          />
          <Input
            label="Costo unitario"
            min={0}
            name="purchaseCost"
            onChange={(event) => setPurchaseCost(event.target.value)}
            type="number"
            value={purchaseCost || String(selectedPart?.unitCost || '')}
          />
          <Input
            label="Fecha compra/recepcion"
            name="purchaseDate"
            onChange={(event) => setPurchaseDate(event.target.value)}
            type="date"
            value={purchaseDate}
          />
          <label className="span-2 text-field" htmlFor="tireIntakeNotes">
            <span>Observaciones</span>
            <textarea
              id="tireIntakeNotes"
              name="notes"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Lote, guia, condicion visual, bodega o comentario de recepcion"
              value={notes}
            />
          </label>
          <div className="span-2 stack">
            <Button disabled={errors.length > 0 || isSaving || isLoading} icon={<Save size={18} />} type="submit">
              {isSaving ? 'Ingresando...' : isLoading ? 'Cargando datos...' : 'Ingresar a stock'}
            </Button>
            {errors.length > 0 ? <p className="muted-text">{errors[0]}</p> : null}
          </div>
        </form>
      </Card>

      <Card className={styles.previewCard}>
        <div className="section-heading-row">
          <div>
            <h2 className="section-title">Vista previa operacional</h2>
            <p className="muted-text">Asi queda el inicio del ciclo antes de instalar.</p>
          </div>
          <PackagePlus aria-hidden size={20} />
        </div>
        <dl className="detail-list">
          <div>
            <dt>SKU</dt>
            <dd>{selectedPart ? `${selectedPart.sku} - ${selectedPart.name}` : 'Sin SKU'}</dd>
          </div>
          <div>
            <dt>Proveedor</dt>
            <dd>{selectedSupplier?.name || selectedPurchaseOrder?.supplierName || 'Pendiente'}</dd>
          </div>
          <div>
            <dt>Unidades</dt>
            <dd>{selectedQuantity > 0 ? selectedQuantity : 'Pendiente'}</dd>
          </div>
          <div>
            <dt>Total estimado</dt>
            <dd>{selectedCost > 0 && selectedQuantity > 0 ? formatCurrency(selectedCost * selectedQuantity) : 'Pendiente'}</dd>
          </div>
          <div>
            <dt>Registrado por</dt>
            <dd>{getCurrentActorName()}</dd>
          </div>
        </dl>
        <ul className={styles.stageList}>
          <li className={styles.stageItem}>
            <span className={styles.stageNumber}>1</span>
            <div>
              <strong>Ingreso a stock</strong>
              <span>Crea unidades individuales para poder medir cada ciclo real.</span>
            </div>
          </li>
          <li className={styles.stageItem}>
            <span className={styles.stageNumber}>2</span>
            <div>
              <strong>Instalacion en camion</strong>
              <span>Luego se amarra camion, posicion y kilometraje inicial.</span>
            </div>
          </li>
          <li className={styles.stageItem}>
            <span className={styles.stageNumber}>3</span>
            <div>
              <strong>Retiro y cierre</strong>
              <span>Al retirar se calcula km usados, costo/km y costo del camion.</span>
            </div>
          </li>
        </ul>
        {savedTires.length > 0 ? (
          <div className={styles.successBox}>
            <strong>{savedTires.length} unidades ingresadas</strong>
            <span>Quedaron disponibles para instalar desde stock.</span>
          </div>
        ) : null}
      </Card>
    </div>
  )
}

function toIsoDate(value: string) {
  return value ? new Date(value).toISOString() : new Date().toISOString()
}
