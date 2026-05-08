import type { FormEvent } from 'react'
import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { CARGO_TYPE_LABELS, CARGO_TYPE_OPTIONS } from '../../freight/constants/cargoType.constants'
import type { CargoType } from '../../freight/types/freight.types'
import { CUSTOMER_RISK_OPTIONS, CUSTOMER_STATUS_OPTIONS } from '../constants/customer.constants'
import { createCustomer, updateCustomer } from '../services/customers.service'
import type { Customer, CustomerPayload, CustomerPriceListItem, CustomerRiskLevel, CustomerStatus } from '../types/customer.types'
import { getDefaultPriceListItem } from '../utils/customerPricing'

interface CustomerFormProps {
  customer?: Customer | null
  onCancel?: () => void
  onSaved?: (customer: Customer) => void
}

export function CustomerForm({ customer, onCancel, onSaved }: CustomerFormProps) {
  const [selectedTypes, setSelectedTypes] = useState<CargoType[]>(getInitialFreightTypes(customer))
  const [creditEnabled, setCreditEnabled] = useState(Boolean(customer?.creditEnabled))
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const priceByCargoType = new Map(customer?.priceList.map((item) => [item.cargoType, item]) || [])

  const handleToggleType = (cargoType: CargoType) => {
    setSelectedTypes((current) => {
      if (current.includes(cargoType)) {
        return current.length === 1 ? current : current.filter((type) => type !== cargoType)
      }

      return [...current, cargoType]
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (selectedTypes.length === 0) {
      setErrorMessage('Selecciona al menos un tipo de flete para el cliente.')
      return
    }

    const formData = new FormData(event.currentTarget)
    const payload: CustomerPayload = {
      billingAddress: String(formData.get('billingAddress') || '').trim(),
      contactName: String(formData.get('contactName') || '').trim(),
      creditEnabled,
      creditLimit: creditEnabled ? Number(formData.get('creditLimit') || 0) : 0,
      creditUsed: creditEnabled ? Number(formData.get('creditUsed') || 0) : 0,
      email: String(formData.get('email') || '').trim(),
      freightTypes: selectedTypes,
      name: String(formData.get('name') || '').trim(),
      notes: String(formData.get('notes') || '').trim(),
      paymentTermsDays: creditEnabled ? Number(formData.get('paymentTermsDays') || 0) : 0,
      phone: String(formData.get('phone') || '').trim(),
      preferredDestinations: parseList(String(formData.get('preferredDestinations') || '')),
      preferredOrigins: parseList(String(formData.get('preferredOrigins') || '')),
      priceList: buildPriceList(formData, selectedTypes, priceByCargoType),
      riskLevel: String(formData.get('riskLevel') || 'low') as CustomerRiskLevel,
      rut: String(formData.get('rut') || '').trim(),
      status: String(formData.get('status') || 'active') as CustomerStatus,
    }

    setIsSaving(true)
    setErrorMessage('')

    try {
      const savedCustomer = customer
        ? await updateCustomer(customer.id, payload)
        : await createCustomer(payload)

      onSaved?.(savedCustomer)
      if (!customer) {
        event.currentTarget.reset()
        setSelectedTypes(['GENERAL'])
        setCreditEnabled(false)
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="form-grid" key={customer?.id || 'new-customer'} onSubmit={handleSubmit}>
      {errorMessage ? (
        <div className="span-2">
          <ErrorState description={errorMessage} title="No se pudo guardar el cliente" />
        </div>
      ) : null}
      <Input defaultValue={customer?.name} label="Cliente" name="name" placeholder="Empresa mandante" required />
      <Input defaultValue={customer?.rut} label="RUT" name="rut" placeholder="76.000.000-0" />
      <Input defaultValue={customer?.contactName} label="Contacto operacional" name="contactName" placeholder="Nombre contacto" />
      <Input defaultValue={customer?.phone} label="Telefono" name="phone" placeholder="+56 ..." />
      <Input defaultValue={customer?.email} label="Correo" name="email" placeholder="operaciones@cliente.cl" type="email" />
      <Input defaultValue={customer?.billingAddress} label="Direccion facturacion" name="billingAddress" placeholder="Direccion comercial" />
      <Input
        className="span-2"
        defaultValue={customer?.preferredOrigins?.join(', ')}
        helperText="Separar por coma para usarlo en busqueda y solicitudes de flete."
        label="Origenes habituales"
        name="preferredOrigins"
        placeholder="Santiago, Quilicura, San Bernardo"
      />
      <Input
        className="span-2"
        defaultValue={customer?.preferredDestinations?.join(', ')}
        helperText="Separar por coma para rutas frecuentes."
        label="Destinos habituales"
        name="preferredDestinations"
        placeholder="Antofagasta, San Antonio, Concepcion"
      />
      <Select
        defaultValue={customer?.status || 'active'}
        label="Estado"
        name="status"
        options={CUSTOMER_STATUS_OPTIONS.filter((option) => option.value !== 'all')}
      />
      <Select
        defaultValue={customer?.riskLevel || 'low'}
        label="Riesgo comercial"
        name="riskLevel"
        options={CUSTOMER_RISK_OPTIONS.filter((option) => option.value !== 'all')}
      />
      <div className="span-2 surface-panel stack-tight">
        <strong>Tipos de flete que solicita</strong>
        <div className="inline-actions">
          {CARGO_TYPE_OPTIONS.map((option) => {
            const cargoType = option.value as CargoType

            return (
              <label className="checkbox-row" htmlFor={`customer-freight-${cargoType}`} key={cargoType}>
                <input
                  checked={selectedTypes.includes(cargoType)}
                  id={`customer-freight-${cargoType}`}
                  onChange={() => handleToggleType(cargoType)}
                  type="checkbox"
                />
                <span>{option.label}</span>
              </label>
            )
          })}
        </div>
      </div>
      <label className="span-2 checkbox-row" htmlFor="creditEnabled">
        <input
          checked={creditEnabled}
          id="creditEnabled"
          onChange={(event) => setCreditEnabled(event.target.checked)}
          type="checkbox"
        />
        <span>Cliente con credito asociado</span>
      </label>
      <Input
        defaultValue={customer?.creditLimit ?? 0}
        disabled={!creditEnabled}
        label="Cupo credito"
        min={0}
        name="creditLimit"
        step={10000}
        type="number"
      />
      <Input
        defaultValue={customer?.creditUsed ?? 0}
        disabled={!creditEnabled}
        label="Credito usado"
        min={0}
        name="creditUsed"
        step={10000}
        type="number"
      />
      <Input
        defaultValue={customer?.paymentTermsDays ?? 0}
        disabled={!creditEnabled}
        label="Plazo pago dias"
        min={0}
        name="paymentTermsDays"
        step={1}
        type="number"
      />
      <label className="span-2 text-field" htmlFor="customerNotes">
        <span>Notas operativas</span>
        <textarea
          defaultValue={customer?.notes}
          id="customerNotes"
          name="notes"
          placeholder="Restricciones comerciales, ventanas horarias, condiciones de aprobacion o contacto alternativo"
        />
      </label>
      <div className="span-2 surface-panel stack">
        <strong>Lista de precios diferencial</strong>
        <div className="matrix-wrap">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Flete</th>
                <th>Nombre tarifa</th>
                <th>Base</th>
                <th>KM</th>
                <th>Minimo</th>
                <th>Desc.</th>
              </tr>
            </thead>
            <tbody>
              {selectedTypes.map((cargoType) => {
                const price = priceByCargoType.get(cargoType) || getDefaultPriceListItem(cargoType)

                return (
                  <tr key={cargoType}>
                    <td>{CARGO_TYPE_LABELS[cargoType]}</td>
                    <td>
                      <Input defaultValue={price.label} name={`label-${cargoType}`} placeholder="Tarifa cliente" />
                    </td>
                    <td>
                      <Input defaultValue={price.baseRate} min={0} name={`baseRate-${cargoType}`} step={1000} type="number" />
                    </td>
                    <td>
                      <Input defaultValue={price.kmRate} min={0} name={`kmRate-${cargoType}`} step={50} type="number" />
                    </td>
                    <td>
                      <Input defaultValue={price.minimumCharge} min={0} name={`minimumCharge-${cargoType}`} step={1000} type="number" />
                    </td>
                    <td>
                      <Input defaultValue={price.discountPercent} max={100} min={0} name={`discountPercent-${cargoType}`} step={1} type="number" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="span-2 inline-actions">
        <Button disabled={isSaving} icon={<Save size={18} />} type="submit">
          {isSaving ? 'Guardando...' : customer ? 'Actualizar cliente' : 'Crear cliente'}
        </Button>
        {customer ? (
          <Button disabled={isSaving} onClick={onCancel} type="button" variant="secondary">
            Cancelar edicion
          </Button>
        ) : null}
      </div>
    </form>
  )
}

function getInitialFreightTypes(customer?: Customer | null): CargoType[] {
  return customer?.freightTypes?.length ? customer.freightTypes : ['GENERAL']
}

function parseList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function buildPriceList(
  formData: FormData,
  selectedTypes: CargoType[],
  priceByCargoType: Map<CargoType, CustomerPriceListItem>,
) {
  return selectedTypes.map((cargoType) => {
    const current = priceByCargoType.get(cargoType) || getDefaultPriceListItem(cargoType)

    return {
      cargoType,
      id: current.id || `price-${cargoType.toLowerCase()}`,
      label: String(formData.get(`label-${cargoType}`) || current.label).trim(),
      baseRate: Number(formData.get(`baseRate-${cargoType}`) || current.baseRate),
      kmRate: Number(formData.get(`kmRate-${cargoType}`) || current.kmRate),
      minimumCharge: Number(formData.get(`minimumCharge-${cargoType}`) || current.minimumCharge),
      discountPercent: Number(formData.get(`discountPercent-${cargoType}`) || current.discountPercent),
      notes: current.notes || '',
    }
  })
}
