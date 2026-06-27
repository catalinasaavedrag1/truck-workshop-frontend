import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Save } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { trucksMock } from '../../../mocks/trucks.mock'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { toast } from '../../../shared/services/toastStore'
import type { Truck } from '../../trucks/types/truck.types'
import {
  TIRE_POSITION_OPTIONS,
  TIRE_USAGE_OPTIONS,
} from '../constants/tirePerformance.constants'
import { tirePerformanceMock } from '../mocks/tirePerformance.mock'
import { installTire } from '../services/tirePerformance.service'
import type { TireLifecycle } from '../types/tirePerformance.types'

export function TireInstallationForm() {
  const [searchParams] = useSearchParams()
  const requestedTireId = searchParams.get('tireId') || ''
  const { data: tires, isLoading: isLoadingTires } = useResourceList<TireLifecycle>(
    '/tire-performance/tires',
    tirePerformanceMock,
    { order: 'desc', sort: 'purchaseDate' },
  )
  const { data: trucks, isLoading: isLoadingTrucks } = useResourceList<Truck>(
    '/trucks',
    trucksMock,
    { order: 'asc', sort: 'plate' },
  )
  const [installedTireIds, setInstalledTireIds] = useState<string[]>([])
  const stockTires = useMemo(
    () =>
      tires.filter(
        (tire) =>
          (tire.status === 'IN_STOCK' || tire.status === 'PURCHASED') &&
          !installedTireIds.includes(tire.id),
      ),
    [installedTireIds, tires],
  )
  const tireSkus = useMemo(
    () =>
      Array.from(
        new Map(
          stockTires.map((tire) => [
            tire.skuId,
            {
              id: tire.skuId,
              label: `${tire.skuCode} - ${tire.skuName}`,
            },
          ]),
        ).values(),
      ),
    [stockTires],
  )
  const [skuId, setSkuId] = useState('')
  const [tireId, setTireId] = useState(requestedTireId)
  const [truckId, setTruckId] = useState('')
  const [odometer, setOdometer] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const requestedTire = stockTires.find((tire) => tire.id === tireId)
  const selectedSkuId = skuId || requestedTire?.skuId || tireSkus[0]?.id || ''

  const tireOptions = useMemo(
    () =>
      stockTires
        .filter((tire) => !selectedSkuId || tire.skuId === selectedSkuId)
        .map((tire) => ({
          label: `${tire.skuCode} - ${tire.brand} ${tire.model || ''}`,
          value: tire.id,
        })),
    [selectedSkuId, stockTires],
  )
  const selectedTireId = tireOptions.some((option) => option.value === tireId)
    ? tireId
    : tireOptions[0]?.value || ''
  const selectedTruckId = truckId || trucks[0]?.id || ''
  const selectedTire = stockTires.find((tire) => tire.id === selectedTireId)
  const selectedTruck = trucks.find((truck) => truck.id === selectedTruckId)
  const isLoading = isLoadingTires || isLoadingTrucks

  const errors = [
    stockTires.length === 0 ? 'No hay neumaticos comprados o en stock para instalar.' : '',
    trucks.length === 0 ? 'No hay camiones disponibles para asociar.' : '',
    !selectedSkuId ? 'Selecciona un SKU de neumatico.' : '',
    !selectedTireId ? 'Selecciona una unidad en stock.' : '',
    !selectedTruckId ? 'Selecciona un camion.' : '',
    !odometer ? 'Ingresa kilometraje inicial.' : '',
    Number(odometer) < 0 ? 'El kilometraje no puede ser negativo.' : '',
  ].filter(Boolean)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (errors.length > 0 || !selectedTruck) {
      return
    }

    const formData = new FormData(event.currentTarget)
    const tirePosition = String(formData.get('position') || '')

    setErrorMessage('')
    setIsSaving(true)

    try {
      await installTire(selectedTireId, {
        installedAt: toIsoDate(String(formData.get('installedAt') || '')) || new Date().toISOString(),
        notes: String(formData.get('notes') || '').trim(),
        odometerAtInstall: Number(formData.get('odometerAtInstall') || 0),
        tirePosition: tirePosition as TireLifecycle['tirePosition'],
        truckId: selectedTruckId,
        usageType: String(formData.get('usageType') || 'TRACTION') as TireLifecycle['usageType'],
      })

      toast.success('Instalacion registrada', 'El backend valido stock, posicion libre, camion y km inicial.')
      setInstalledTireIds((current) => [...current, selectedTireId])
      setTireId('')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <form className="form-grid" onSubmit={handleSubmit}>
        {errorMessage ? <ErrorState description={errorMessage} title="No se pudo registrar la instalacion" /> : null}
        <Select
          label="SKU neumatico"
          name="skuId"
          onChange={(event) => {
            setSkuId(event.target.value)
            setTireId('')
          }}
          options={tireSkus.length > 0 ? tireSkus.map((sku) => ({ label: sku.label, value: sku.id })) : [{ label: 'Sin SKU en stock', value: '' }]}
          value={selectedSkuId}
        />
        <Select
          label="Neumatico comprado/en stock"
          name="tireId"
          onChange={(event) => setTireId(event.target.value)}
          options={tireOptions.length > 0 ? tireOptions : [{ label: 'Sin unidades en stock para este SKU', value: '' }]}
          value={selectedTireId}
        />
        <Select
          label="Camion"
          name="truckId"
          onChange={(event) => setTruckId(event.target.value)}
          options={
            trucks.length > 0
              ? trucks.map((truck) => ({
                  label: `${truck.plate} - ${truck.brand} ${truck.model} (${truck.odometer.toLocaleString('es-CL')} km)`,
                  value: truck.id,
                }))
              : [{ label: 'Sin camiones disponibles', value: '' }]
          }
          value={selectedTruckId}
        />
        <Select
          label="Posicion"
          name="position"
          options={TIRE_POSITION_OPTIONS.filter((option) => option.value !== 'all')}
        />
        <Select
          label="Tipo de uso"
          name="usageType"
          options={TIRE_USAGE_OPTIONS.filter((option) => option.value !== 'all')}
        />
        <Input label="Fecha instalacion" name="installedAt" type="date" />
        <Input
          label="Kilometraje al instalar"
          min={0}
          name="odometerAtInstall"
          onChange={(event) => setOdometer(event.target.value)}
          type="number"
          value={odometer}
        />
        <label className="span-2 text-field" htmlFor="installationNotes">
          <span>Observaciones</span>
          <textarea id="installationNotes" name="notes" placeholder="Condicion visual, presion, eje o caso asociado" />
        </label>
        <div className="span-2 stack">
          <div className="surface-panel">
            <div className="section-heading-row">
              <strong>Vista previa de instalacion</strong>
              <span className="muted-text">paso 2 de 5 del ciclo</span>
            </div>
            <dl className="detail-list">
              <div>
                <dt>Unidad seleccionada</dt>
                <dd>{selectedTire ? `${selectedTire.skuCode} - ${selectedTire.brand}` : 'Sin unidad'}</dd>
              </div>
              <div>
                <dt>Camion destino</dt>
                <dd>
                  {selectedTruck ? `${selectedTruck.plate} - ${selectedTruck.odometer.toLocaleString('es-CL')} km` : 'Sin camion'}
                </dd>
              </div>
              <div>
                <dt>Estado resultante</dt>
                <dd>INSTALLED</dd>
              </div>
            </dl>
          </div>
          <Button
            disabled={errors.length > 0 || isLoading}
            icon={<Save size={18} />}
            loading={isSaving}
            type="submit"
          >
            {isLoading ? 'Cargando datos...' : 'Registrar instalacion'}
          </Button>
          {errors.length > 0 ? <p className="muted-text">{errors[0]}</p> : null}
        </div>
      </form>
    </Card>
  )
}

function toIsoDate(value: string) {
  return value ? new Date(value).toISOString() : undefined
}
