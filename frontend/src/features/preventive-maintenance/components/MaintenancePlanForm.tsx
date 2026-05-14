import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { createResource } from '../../../shared/services/resourceApi'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import { preventiveMaintenanceMock } from '../mocks/preventiveMaintenance.mock'
import type { MaintenanceType, PreventiveMaintenancePlan } from '../types/preventiveMaintenance.types'
import { getTruckPreventiveSummary } from '../utils/preventiveMaintenanceOperations'
import { MaintenanceTruckContextPanel } from './MaintenanceTruckContextPanel'
import styles from './PreventiveMaintenance.module.css'

const maintenanceTypeOptions: Array<{ label: string; value: MaintenanceType }> = [
  { label: 'Cambio aceite', value: 'OIL_CHANGE' },
  { label: 'Filtros', value: 'FILTERS' },
  { label: 'Frenos', value: 'BRAKES' },
  { label: 'Neumaticos', value: 'TIRES' },
  { label: 'Alineacion', value: 'ALIGNMENT' },
  { label: 'Bateria', value: 'BATTERY' },
  { label: 'Suspension', value: 'SUSPENSION' },
  { label: 'Revision tecnica', value: 'TECHNICAL_INSPECTION' },
  { label: 'Servicio por km', value: 'KM_SERVICE' },
]

export function MaintenancePlanForm() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [selectedTruckId, setSelectedTruckId] = useState('')
  const { data: fleetTrucks } = useResourceList<FleetTruck>('/fleet/trucks', fleetTrucksMock, {
    order: 'asc',
    sort: 'plate',
  })
  const { data: existingPlans } = useResourceList<PreventiveMaintenancePlan>(
    '/preventive-maintenance/plans',
    preventiveMaintenanceMock,
    { order: 'asc', sort: 'nextDueAt' },
  )
  const selectedTruck = fleetTrucks.find((truck) => truck.id === selectedTruckId) || fleetTrucks[0]
  const truckPlans = useMemo(
    () => existingPlans.filter((plan) => plan.truckId === selectedTruck?.id),
    [existingPlans, selectedTruck?.id],
  )
  const truckSummary = selectedTruck ? getTruckPreventiveSummary(selectedTruck, existingPlans) : undefined

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const everyKm = Number(formData.get('everyKm') || 0)
    const everyDays = Number(formData.get('everyDays') || 0)
    const lastDoneOdometer = Number(formData.get('lastDoneOdometer') || 0)
    const nextDueOdometer = Number(formData.get('nextDueOdometer') || 0)
    const truckId = String(formData.get('truckId') || selectedTruck?.id || '')

    setErrorMessage('')
    setIsSaving(true)

    try {
      const savedPlan = await createResource<PreventiveMaintenancePlan, Omit<PreventiveMaintenancePlan, 'id'>>('/preventive-maintenance/plans', {
        assignedTo: String(formData.get('assignedTo') || 'Taller').trim(),
        description: String(formData.get('description') || '').trim(),
        everyDays: everyDays > 0 ? everyDays : undefined,
        everyKm: everyKm > 0 ? everyKm : undefined,
        frequencyType: everyKm > 0 && everyDays > 0 ? 'BOTH' : everyKm > 0 ? 'KM' : 'DATE',
        lastDoneAt: String(formData.get('lastDoneAt') || '') || undefined,
        lastDoneOdometer: lastDoneOdometer > 0 ? lastDoneOdometer : undefined,
        maintenanceType: String(formData.get('maintenanceType') || 'KM_SERVICE') as MaintenanceType,
        nextDueAt: String(formData.get('nextDueAt') || '') || undefined,
        nextDueOdometer: nextDueOdometer > 0 ? nextDueOdometer : undefined,
        notes: String(formData.get('notes') || '').trim(),
        riskStatus: 'OK',
        truckId,
      })

      navigate(ROUTES.preventiveMaintenanceDetail(savedPlan.id))
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={styles.formShell}>
      <div className={styles.formGrid}>
        <Card className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Nuevo plan preventivo</h2>
              <p>Primero selecciona la unidad. El plan queda conectado al odometro, estado y ficha del camion.</p>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            {errorMessage ? <ErrorState description={errorMessage} title="No se pudo guardar el plan" /> : null}
            <Select
              label="Camion"
              name="truckId"
              onChange={(event) => setSelectedTruckId(event.target.value)}
              options={fleetTrucks.map((truck) => ({
                label: `${truck.plate} - ${truck.brand} ${truck.model} - ${truck.currentOdometer.toLocaleString('es-CL')} km`,
                value: truck.id,
              }))}
              value={selectedTruck?.id || ''}
            />
            <Select
              label="Tipo mantencion"
              name="maintenanceType"
              options={maintenanceTypeOptions}
            />
            <Input
              helperText={selectedTruck ? `Odometro actual: ${selectedTruck.currentOdometer.toLocaleString('es-CL')} km` : undefined}
              label="Cada km"
              min={0}
              name="everyKm"
              placeholder="15000"
              type="number"
            />
            <Input label="Cada dias" min={0} name="everyDays" placeholder="90" type="number" />
            <Input label="Ultima fecha realizada" name="lastDoneAt" type="date" />
            <Input label="Proxima fecha objetivo" name="nextDueAt" type="date" />
            <Input label="Ultimo odometro" min={0} name="lastDoneOdometer" type="number" />
            <Input label="Proximo odometro objetivo" min={0} name="nextDueOdometer" type="number" />
            <Input className="span-2" label="Descripcion" name="description" placeholder="Ej: cambio aceite motor y filtros principales" required />
            <Input className="span-2" label="Responsable" name="assignedTo" placeholder="Jefe taller, mecanico, backoffice flota" />
            <Input className="span-2" label="Notas operativas" name="notes" placeholder="Impacto en ruta, repuestos requeridos o ventana sugerida" />
            <div className="span-2 inline-actions">
              <Button disabled={isSaving} type="submit">{isSaving ? 'Guardando...' : 'Guardar plan'}</Button>
            </div>
          </form>
        </Card>

        <div className={styles.formPreview}>
          <MaintenanceTruckContextPanel plans={truckPlans} truck={selectedTruck} />
          {truckSummary ? (
            <p className={styles.formHint}>
              Este camion ya tiene {truckSummary.plans.length} planes. Revisa si el nuevo plan complementa o duplica cobertura.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
