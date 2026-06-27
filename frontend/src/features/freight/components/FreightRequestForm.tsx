import type { FormEvent } from 'react'
import { useState } from 'react'
import { Save } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { Textarea } from '../../../shared/components/Textarea/Textarea'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { createResource } from '../../../shared/services/resourceApi'
import { toast } from '../../../shared/services/toastStore'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { CustomerCreditBadge } from '../../customers/components/CustomerCreditBadge'
import { CustomerSelect } from '../../customers/components/CustomerSelect'
import type { Customer } from '../../customers/types/customer.types'
import { getCustomerPriceForCargo } from '../../customers/utils/customerPricing'
import { RoutePlanner } from '../../maps/components/RoutePlanner'
import { CARGO_TYPE_LABELS, CARGO_TYPE_OPTIONS } from '../constants/cargoType.constants'
import type { FreightRequest } from '../types/freight.types'
import styles from './FreightModule.module.css'

export function FreightRequestForm() {
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>()
  const [cargoType, setCargoType] = useState<FreightRequest['cargoType']>('GENERAL')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [routePlannerKey, setRoutePlannerKey] = useState(0)
  const selectedPrice = getCustomerPriceForCargo(selectedCustomer, cargoType)

  const handleCustomerChange = (customer: Customer | undefined, customerId: string) => {
    setSelectedCustomerId(customerId)
    setSelectedCustomer(customer)

    if (customer?.freightTypes[0]) {
      setCargoType(customer.freightTypes[0])
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    setErrorMessage('')
    setIsSaving(true)

    try {
      if (!selectedCustomer) {
        setErrorMessage('Selecciona un cliente maestro antes de crear la solicitud.')
        setIsSaving(false)
        return
      }

      const originAddress = String(formData.get('originAddress') || '').trim()
      const destinationAddress = String(formData.get('destinationAddress') || '').trim()
      const estimatedKm = Number(formData.get('estimatedKm') || 0)

      if (!originAddress || !destinationAddress) {
        setErrorMessage('Selecciona origen y destino para crear la solicitud.')
        setIsSaving(false)
        return
      }

      if (estimatedKm <= 0) {
        setErrorMessage('Calcula la ruta desde backend o registra un km operativo manual.')
        setIsSaving(false)
        return
      }

      const request = await createResource<FreightRequest, Omit<FreightRequest, 'id' | 'createdAt' | 'updatedAt'>>('/freight/requests', {
        cargoDescription: String(formData.get('cargoDescription') || '').trim(),
        cargoType,
        customerEmail: selectedCustomer.email,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        destinationAddress,
        estimatedKm,
        originAddress,
        observations: String(formData.get('observations') || '').trim(),
        requestNumber: `FRE-${Date.now()}`,
        requestedPickupDate: toIsoDateTime(String(formData.get('requestedPickupDate') || '')),
        requiresLoadingHelp: formData.get('requiresLoadingHelp') === 'on',
        requiresUnloadingHelp: formData.get('requiresUnloadingHelp') === 'on',
        requiresWaitingTime: formData.get('requiresWaitingTime') === 'on',
        status: 'NEW',
        volumeM3: Number(formData.get('volumeM3') || 0),
        waitingHours: Number(formData.get('waitingHours') || 0),
        weightKg: Number(formData.get('weightKg') || 0),
      })

      toast.success('Solicitud creada', `${request.requestNumber} quedo registrada en backend.`)
      form.reset()
      setSelectedCustomerId('')
      setSelectedCustomer(undefined)
      setCargoType('GENERAL')
      setRoutePlannerKey((key) => key + 1)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <form className="form-grid" onSubmit={handleSubmit}>
        {errorMessage ? <ErrorState description={errorMessage} title="No se pudo crear la solicitud" /> : null}
        <h2 className={styles.formSectionTitle}>Cliente y condicion comercial</h2>
        <CustomerSelect
          className="span-2"
          label="Cliente registrado"
          name="customerId"
          onCustomerChange={handleCustomerChange}
          required
          value={selectedCustomerId}
        />
        {selectedCustomer ? (
          <div className="span-2 surface-panel stack-tight">
            <div className="split-row">
              <strong>{selectedCustomer.name}</strong>
              <CustomerCreditBadge customer={selectedCustomer} />
            </div>
            <p className="muted-text">
              {selectedCustomer.contactName || 'Sin contacto'} - {selectedCustomer.phone || 'sin telefono'} -{' '}
              {selectedCustomer.email || 'sin correo'}
            </p>
            <p className="muted-text">
              {selectedCustomer.paymentTermsDays || 0} dias de pago -{' '}
              {selectedCustomer.preferredOrigins.join(', ') || 'sin origen habitual'} a{' '}
              {selectedCustomer.preferredDestinations.join(', ') || 'sin destino habitual'}
            </p>
            <p className="muted-text">
              Tarifa {CARGO_TYPE_LABELS[cargoType]}:{' '}
              {selectedPrice
                ? `${formatCurrency(selectedPrice.baseRate)} base, ${formatCurrency(selectedPrice.kmRate)} / km, minimo ${formatCurrency(selectedPrice.minimumCharge)}`
                : 'usa tarifa general'}
            </p>
          </div>
        ) : (
          <div className="span-2 surface-panel split-row">
            <p className="muted-text">Para tarifas diferenciales y credito, crea o selecciona un cliente maestro.</p>
            <Link to={ROUTES.customers}>
              <Button size="sm" type="button" variant="secondary">
                Gestionar clientes
              </Button>
            </Link>
          </div>
        )}
        <h2 className={styles.formSectionTitle}>Ruta y ventana operacional</h2>
        <Input label="Fecha solicitada de retiro" name="requestedPickupDate" type="datetime-local" />
        <RoutePlanner className="span-2" key={routePlannerKey} />
        <Select
          label="Tipo de carga"
          name="cargoType"
          onChange={(event) => setCargoType(event.target.value as FreightRequest['cargoType'])}
          options={CARGO_TYPE_OPTIONS}
          value={cargoType}
        />
        <h2 className={styles.formSectionTitle}>Carga y servicios requeridos</h2>
        <Input className="span-2" label="Descripcion de carga" name="cargoDescription" placeholder="Detalle operacional de la carga" />
        <Input label="Peso kg" min={0} name="weightKg" placeholder="2800" type="number" />
        <Input label="Volumen m3" min={0} name="volumeM3" placeholder="18" type="number" />
        <Input label="Horas de espera" min={0} name="waitingHours" placeholder="0" type="number" />
        <label className="checkbox-row" htmlFor="requiresWaitingTime">
          <input id="requiresWaitingTime" name="requiresWaitingTime" type="checkbox" />
          <span>Requiere espera</span>
        </label>
        <label className="checkbox-row" htmlFor="requiresLoadingHelp">
          <input id="requiresLoadingHelp" name="requiresLoadingHelp" type="checkbox" />
          <span>Requiere ayuda de carga</span>
        </label>
        <label className="checkbox-row" htmlFor="requiresUnloadingHelp">
          <input id="requiresUnloadingHelp" name="requiresUnloadingHelp" type="checkbox" />
          <span>Requiere ayuda de descarga</span>
        </label>
        <Textarea
          className="span-2"
          label="Observaciones"
          name="observations"
          placeholder="Condiciones de retiro, restricciones o ventanas horarias"
        />
        <div className="span-2 inline-actions">
          <Button icon={<Save size={18} />} loading={isSaving} type="submit">
            Crear solicitud
          </Button>
        </div>
      </form>
    </Card>
  )
}

function toIsoDateTime(value: string) {
  return value ? new Date(value).toISOString() : undefined
}
