import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Save } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { toast } from '../../../shared/services/toastStore'
import {
  TIRE_POSITION_LABELS,
  TIRE_REMOVAL_REASON_OPTIONS,
  calculateCostPerKm,
} from '../constants/tirePerformance.constants'
import { tirePerformanceMock } from '../mocks/tirePerformance.mock'
import { removeTire } from '../services/tirePerformance.service'
import type { TireLifecycle, TireRemovalReason } from '../types/tirePerformance.types'

export function TireRemovalForm() {
  const [searchParams] = useSearchParams()
  const requestedTireId = searchParams.get('tireId') || ''
  const { data: tires, isLoading } = useResourceList<TireLifecycle>(
    '/tire-performance/tires',
    tirePerformanceMock,
    { order: 'desc', sort: 'installedAt', status: 'INSTALLED' },
  )
  const [removedTireIds, setRemovedTireIds] = useState<string[]>([])
  const installedTires = useMemo(
    () => tires.filter((tire) => tire.status === 'INSTALLED' && !removedTireIds.includes(tire.id)),
    [removedTireIds, tires],
  )
  const [tireId, setTireId] = useState(requestedTireId)
  const [odometerAtRemoval, setOdometerAtRemoval] = useState('')
  const [reason, setReason] = useState<TireRemovalReason | 'all'>('all')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const selectedTireId = installedTires.some((tire) => tire.id === tireId)
    ? tireId
    : installedTires[0]?.id || ''
  const selectedTire = useMemo(
    () => installedTires.find((tire) => tire.id === selectedTireId),
    [installedTires, selectedTireId],
  )
  const removalKm = Number(odometerAtRemoval)
  const kmUsed =
    selectedTire?.odometerAtInstall !== undefined && odometerAtRemoval
      ? removalKm - selectedTire.odometerAtInstall
      : undefined
  const costPerKm = selectedTire ? calculateCostPerKm(selectedTire.purchaseCost, kmUsed) : undefined
  const errors = [
    !selectedTire ? 'Selecciona un neumatico instalado.' : '',
    !odometerAtRemoval ? 'Ingresa kilometraje de retiro.' : '',
    selectedTire && odometerAtRemoval && removalKm <= (selectedTire.odometerAtInstall || 0)
      ? 'Kilometraje de retiro debe ser mayor al kilometraje de instalacion.'
      : '',
    reason === 'all' ? 'Selecciona motivo de retiro.' : '',
  ].filter(Boolean)
  const resultingStatus =
    reason === 'RETREAD'
      ? 'RETREADED'
      : reason === 'WARRANTY'
        ? 'WARRANTY_CLAIM'
        : reason === 'NORMAL_WEAR' || reason === 'PREVENTIVE_CHANGE'
          ? 'REMOVED'
          : reason === 'all'
            ? 'Pendiente'
            : 'DISCARDED'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (errors.length > 0 || !selectedTire || reason === 'all') {
      return
    }

    const formData = new FormData(event.currentTarget)

    setErrorMessage('')
    setIsSaving(true)

    try {
      await removeTire(selectedTireId, {
        notes: String(formData.get('notes') || '').trim(),
        odometerAtRemoval: removalKm,
        removalReason: reason,
        removedAt: toIsoDate(String(formData.get('removedAt') || '')) || new Date().toISOString(),
      })

      toast.success('Retiro registrado', 'El backend calculo km usados, costo/km y costo del camion.')
      setRemovedTireIds((current) => [...current, selectedTireId])
      setTireId('')
      setOdometerAtRemoval('')
      setReason('all')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <form className="form-grid" onSubmit={handleSubmit}>
        {errorMessage ? <ErrorState description={errorMessage} title="No se pudo registrar el retiro" /> : null}
        <Select
          label="Neumatico instalado"
          name="tireId"
          onChange={(event) => setTireId(event.target.value)}
          options={
            installedTires.length > 0
              ? installedTires.map((tire) => ({
                  label: `${tire.skuCode} - ${tire.truckPlate} - ${tire.tirePosition ? TIRE_POSITION_LABELS[tire.tirePosition] : 'Sin posicion'}`,
                  value: tire.id,
                }))
              : [{ label: 'Sin neumaticos instalados', value: '' }]
          }
          value={selectedTireId}
        />
        <Input label="Fecha retiro" name="removedAt" type="date" />
        <Input
          label="Kilometraje retiro"
          min={0}
          name="odometerAtRemoval"
          onChange={(event) => setOdometerAtRemoval(event.target.value)}
          type="number"
          value={odometerAtRemoval}
        />
        <Select
          label="Motivo retiro"
          name="removalReason"
          onChange={(event) => setReason(event.target.value as TireRemovalReason | 'all')}
          options={TIRE_REMOVAL_REASON_OPTIONS}
          value={reason}
        />
        <label className="span-2 text-field" htmlFor="removalNotes">
          <span>Observaciones</span>
          <textarea id="removalNotes" name="notes" placeholder="Condicion al retirar, dano, profundidad o destino del neumatico" />
        </label>
        {selectedTire ? (
          <div className="span-2 surface-panel">
            <dl className="detail-list">
              <div>
                <dt>Camion actual</dt>
                <dd>{selectedTire.truckPlate}</dd>
              </div>
              <div>
                <dt>Posicion actual</dt>
                <dd>{selectedTire.tirePosition ? TIRE_POSITION_LABELS[selectedTire.tirePosition] : 'Sin posicion'}</dd>
              </div>
              <div>
                <dt>Km instalacion</dt>
                <dd>{selectedTire.odometerAtInstall?.toLocaleString('es-CL')} km</dd>
              </div>
              <div>
                <dt>Km rendidos</dt>
                <dd>{kmUsed && kmUsed > 0 ? `${kmUsed.toLocaleString('es-CL')} km` : 'Pendiente'}</dd>
              </div>
              <div>
                <dt>Costo/km</dt>
                <dd>{costPerKm ? `$${costPerKm.toFixed(2)}/km` : 'Pendiente'}</dd>
              </div>
              <div>
                <dt>Estado resultante</dt>
                <dd>{resultingStatus}</dd>
              </div>
            </dl>
          </div>
        ) : null}
        <div className="span-2 stack">
          <Button
            disabled={errors.length > 0 || isLoading}
            icon={<Save size={18} />}
            loading={isSaving}
            type="submit"
          >
            {isLoading ? 'Cargando datos...' : 'Registrar retiro'}
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
