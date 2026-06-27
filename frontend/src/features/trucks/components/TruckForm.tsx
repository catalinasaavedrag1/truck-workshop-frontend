import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RotateCcw, Save } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { createResource } from '../../../shared/services/resourceApi'
import { toast } from '../../../shared/services/toastStore'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import styles from './TruckModule.module.css'

const truckStatusOptions = [
  { label: 'Disponible', value: 'AVAILABLE' },
  { label: 'En taller', value: 'IN_WORKSHOP' },
  { label: 'Bloqueado', value: 'BLOCKED' },
  { label: 'En ruta', value: 'ON_ROUTE' },
]

export function TruckForm() {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const plate = String(formData.get('plate') || '').trim().toUpperCase()
    const vin = String(formData.get('vin') || '').trim().toUpperCase()
    const brand = String(formData.get('brand') || '').trim()
    const model = String(formData.get('model') || '').trim()
    const year = Number(formData.get('year') || new Date().getFullYear())
    const odometer = Number(formData.get('odometer') || 0)
    const status = String(formData.get('status') || 'AVAILABLE') as FleetTruck['operationalStatus']
    const bodyType = String(formData.get('bodyType') || 'Tracto').trim()
    const loadCapacityKg = Number(formData.get('loadCapacityKg') || 0)

    setIsSaving(true)
    setErrorMessage('')

    try {
      const truck = await createResource<FleetTruck, Partial<FleetTruck>>('/fleet/trucks', {
        acquisitionCost: 0,
        acquisitionDate: new Date().toISOString(),
        brand,
        bodyType,
        chassisNumber: '',
        currentOdometer: odometer,
        engineNumber: '',
        fuelType: 'DIESEL',
        loadCapacityKg,
        model,
        operationalStatus: status,
        ownerType: 'OWNED',
        plate,
        vin,
        year,
      })

      toast.success('Camion creado', `${truck.plate} quedo registrado en la flota.`)
      navigate(ROUTES.fleetTruckDetail(truck.id))
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className={styles.formCard}>
      <form className={styles.formStack} onSubmit={handleSubmit}>
        {errorMessage ? <ErrorState description={errorMessage} title="No se pudo crear el camion" /> : null}
        <section className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <h2>Identificacion</h2>
            <p className={styles.formHint}>Datos que se usan para busqueda, documentos y trazabilidad.</p>
          </div>
          <div className="form-grid">
            <Input helperText="Formato sugerido: HH-RR-24" label="Patente" name="plate" placeholder="HH-RR-24" required />
            <Input helperText="Numero de chasis completo" label="VIN" name="vin" placeholder="YV2RT60A0MB912345" required />
          </div>
        </section>
        <section className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <h2>Caracteristicas</h2>
            <p className={styles.formHint}>Mantiene el inventario claro para taller, fletes y reportes.</p>
          </div>
          <div className="form-grid">
            <Input label="Marca" name="brand" placeholder="Volvo" required />
            <Input label="Modelo" name="model" placeholder="FH 540" required />
            <Input label="Ano" max={2030} min={1990} name="year" placeholder="2024" type="number" />
            <Input label="Tipo carroceria" name="bodyType" placeholder="Tracto 6x4" />
            <Input label="Capacidad kg" min={0} name="loadCapacityKg" placeholder="28000" type="number" />
            <Input
              helperText="Lectura actual del odometro"
              label="Kilometraje"
              min={0}
              name="odometer"
              placeholder="284100"
              type="number"
            />
          </div>
        </section>
        <section className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <h2>Operacion</h2>
            <p className={styles.formHint}>Define como aparecera en disponibilidad y prioridades de taller.</p>
          </div>
          <Select label="Estado inicial" name="status" options={truckStatusOptions} />
        </section>
        <div className={styles.formActions}>
          <Button disabled={isSaving} icon={<RotateCcw size={18} />} onClick={() => setErrorMessage('')} type="reset" variant="secondary">
            Limpiar
          </Button>
          <Button icon={<Save size={18} />} loading={isSaving} type="submit">
            Guardar camion
          </Button>
        </div>
      </form>
    </Card>
  )
}
