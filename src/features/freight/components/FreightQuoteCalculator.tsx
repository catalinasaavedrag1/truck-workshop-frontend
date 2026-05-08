import type { SetStateAction } from 'react'
import { useEffect, useState } from 'react'
import { Calculator, Save, Settings2 } from 'lucide-react'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { createResource, updateResource } from '../../../shared/services/resourceApi'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { CARGO_TYPE_OPTIONS } from '../constants/cargoType.constants'
import { calculateFreightQuote } from '../constants/freightPricing.constants'
import {
  buildPricingPayloadFromRequest,
  calculateFreightPricing,
  getActiveFreightPricingSettings,
  updateActiveFreightPricingSettings,
} from '../services/freightPricing.service'
import type { CargoType, FreightPricingCalculation, FreightPricingSettings, FreightQuote, FreightRequest } from '../types/freight.types'
import { FreightCostBreakdown } from './FreightCostBreakdown'

interface FreightQuoteCalculatorProps {
  request?: FreightRequest
}

export function FreightQuoteCalculator({ request }: FreightQuoteCalculatorProps) {
  const [estimatedKm, setEstimatedKm] = useState(request?.estimatedKm || 120)
  const [cargoType, setCargoType] = useState<CargoType>(request?.cargoType || 'GENERAL')
  const [waitingHours, setWaitingHours] = useState(request?.requiresWaitingTime ? request.waitingHours || 0 : 0)
  const [requiresLoadingHelp, setRequiresLoadingHelp] = useState(Boolean(request?.requiresLoadingHelp))
  const [requiresUnloadingHelp, setRequiresUnloadingHelp] = useState(Boolean(request?.requiresUnloadingHelp))
  const [manualTollCost, setManualTollCost] = useState('')
  const [calculation, setCalculation] = useState<FreightPricingCalculation | null>(null)
  const [pricingSettings, setPricingSettings] = useState<FreightPricingSettings | null>(null)
  const [settingsDraft, setSettingsDraft] = useState<Partial<FreightPricingSettings>>({})
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [settingsVersion, setSettingsVersion] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  const fallbackCalculation = calculateFreightQuote({
    cargoType,
    estimatedKm,
    requiresLoadingHelp,
    requiresUnloadingHelp,
    waitingHours,
  })
  const activeCalculation = calculation || {
    ...fallbackCalculation,
    dieselPricePerLiter: undefined,
    estimatedKm,
    fuelCost: undefined,
    fuelLiters: undefined,
    fuelPriceSource: undefined,
    marginAmount: undefined,
    operationCost: undefined,
    operationCostPerKm: undefined,
    tollCost: undefined,
  }

  useEffect(() => {
    let isMounted = true

    getActiveFreightPricingSettings()
      .then((settings) => {
        if (isMounted) {
          setPricingSettings(settings)
          setSettingsDraft(settings)
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(getApiErrorMessage(error))
        }
      })

    return () => {
      isMounted = false
    }
  }, [settingsVersion])

  useEffect(() => {
    let isMounted = true
    const timeout = window.setTimeout(() => {
      calculateFreightPricing({
        ...(request ? buildPricingPayloadFromRequest(request) : {}),
        cargoType,
        estimatedKm,
        requiresLoadingHelp,
        requiresUnloadingHelp,
        tollCost: manualTollCost ? Number(manualTollCost) : undefined,
        waitingHours,
      })
        .then((nextCalculation) => {
          if (isMounted) {
            setCalculation(nextCalculation)
            setErrorMessage('')
          }
        })
        .catch((error) => {
          if (isMounted) {
            setCalculation(null)
            setErrorMessage(getApiErrorMessage(error))
          }
        })
    }, 320)

    return () => {
      isMounted = false
      window.clearTimeout(timeout)
    }
  }, [cargoType, estimatedKm, manualTollCost, request, requiresLoadingHelp, requiresUnloadingHelp, settingsVersion, waitingHours])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      const saved = await updateActiveFreightPricingSettings(settingsDraft)
      setPricingSettings(saved)
      setSettingsDraft(saved)
      setSettingsVersion((version) => version + 1)
      setStatusMessage('Configuracion de tarifa actualizada en backend.')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateQuote = async () => {
    if (!request || !calculation) {
      setStatusMessage('Abre una solicitud para guardar la cotizacion como borrador.')
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const quote = await createResource<FreightQuote, Partial<FreightQuote>>('/freight/quotes', {
        baseRate: calculation.baseRate,
        cargoType,
        cargoTypeSurcharge: calculation.cargoTypeSurcharge,
        customerId: request.customerId,
        customerName: request.customerName,
        dieselPricePerLiter: calculation.dieselPricePerLiter,
        estimatedKm: calculation.estimatedKm,
        fuelCost: calculation.fuelCost,
        fuelKmPerLiter: calculation.fuelKmPerLiter,
        fuelLiters: calculation.fuelLiters,
        kmRate: calculation.kmRate,
        loadingCost: calculation.loadingCost,
        marginAmount: calculation.marginAmount,
        operationCost: calculation.operationCost,
        operationCostPerKm: calculation.operationCostPerKm,
        pricingConfigId: calculation.pricingConfigId,
        pricingSnapshot: calculation.pricingSnapshot,
        quoteNumber: `FQ-${Date.now()}`,
        requestId: request.id,
        routePricingSnapshot: calculation.routePricingSnapshot,
        status: 'DRAFT',
        subtotal: calculation.subtotal,
        taxAmount: calculation.taxAmount,
        tollCost: calculation.tollCost,
        total: calculation.total,
        unloadingCost: calculation.unloadingCost,
        validUntil,
        waitingCost: calculation.waitingCost,
      })

      await updateResource<FreightRequest>('/freight/requests', request.id, {
        quoteId: quote.id,
        status: 'QUOTING',
      })
      setStatusMessage(`Cotizacion ${quote.quoteNumber} guardada con petroleo, peajes y margen.`)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <div className="stack">
        <div className="split-row">
          <h2 className="section-title">Calculadora de cotizacion</h2>
          <span className="muted-text">
            {calculation?.tolls?.priceKnown
              ? `Peajes Google ${formatCurrency(calculation.tolls.totalAmount)}`
              : calculation?.tolls?.hasTolls
                ? 'Ruta con peaje sin precio publicado'
                : 'Peajes desde backend'}
          </span>
        </div>
        {errorMessage ? <ErrorState description={errorMessage} title="Pricing backend no disponible" /> : null}
        <div className="form-grid">
          <Input
            label="Kilometraje estimado"
            min={0}
            name="quoteEstimatedKm"
            onChange={(event) => setEstimatedKm(Number(event.target.value))}
            type="number"
            value={estimatedKm}
          />
          <Input
            label="Peajes manuales"
            min={0}
            name="quoteManualTollCost"
            onChange={(event) => setManualTollCost(event.target.value)}
            placeholder="Se detecta por ruta si Google lo informa"
            type="number"
            value={manualTollCost}
          />
          <Select
            label="Tipo de carga"
            name="quoteCargoType"
            onChange={(event) => setCargoType(event.target.value as CargoType)}
            options={CARGO_TYPE_OPTIONS}
            value={cargoType}
          />
          <Input
            label="Horas de espera"
            min={0}
            name="quoteWaitingHours"
            onChange={(event) => setWaitingHours(Number(event.target.value))}
            type="number"
            value={waitingHours}
          />
          <label className="checkbox-row" htmlFor="quoteLoadingHelp">
            <input
              checked={requiresLoadingHelp}
              id="quoteLoadingHelp"
              onChange={(event) => setRequiresLoadingHelp(event.target.checked)}
              type="checkbox"
            />
            <span>Ayuda de carga</span>
          </label>
          <label className="checkbox-row" htmlFor="quoteUnloadingHelp">
            <input
              checked={requiresUnloadingHelp}
              id="quoteUnloadingHelp"
              onChange={(event) => setRequiresUnloadingHelp(event.target.checked)}
              type="checkbox"
            />
            <span>Ayuda de descarga</span>
          </label>
        </div>
        <FreightCostBreakdown
          baseRate={activeCalculation.baseRate}
          cargoTypeSurcharge={activeCalculation.cargoTypeSurcharge}
          dieselPricePerLiter={activeCalculation.dieselPricePerLiter}
          estimatedKm={estimatedKm}
          fuelCost={activeCalculation.fuelCost}
          fuelLiters={activeCalculation.fuelLiters}
          fuelPriceSource={activeCalculation.fuelPriceSource}
          kmRate={activeCalculation.kmRate}
          loadingCost={activeCalculation.loadingCost}
          marginAmount={activeCalculation.marginAmount}
          operationCost={activeCalculation.operationCost}
          operationCostPerKm={activeCalculation.operationCostPerKm}
          subtotal={activeCalculation.subtotal}
          taxAmount={activeCalculation.taxAmount}
          tollCost={activeCalculation.tollCost}
          total={activeCalculation.total}
          unloadingCost={activeCalculation.unloadingCost}
          waitingCost={activeCalculation.waitingCost}
        />
        <div className="surface-panel stack-tight">
          <div className="split-row">
            <strong>Configuracion operativa</strong>
            <span className="muted-text">{pricingSettings?.name || 'Tarifa activa backend'}</span>
          </div>
          <div className="surface-panel stack-tight">
            <div className="split-row">
              <strong>Petroleo usado en cotizacion</strong>
              <span className="muted-text">
                {activeCalculation.fuelPriceSource?.isOfficial ? 'CNE oficial' : 'Fallback configurable'}
              </span>
            </div>
            <span className="muted-text">
              {activeCalculation.dieselPricePerLiter
                ? `${formatCurrency(activeCalculation.dieselPricePerLiter)} por litro`
                : 'Esperando calculo backend'}
              {activeCalculation.fuelPriceSource?.regionName ? ` - ${activeCalculation.fuelPriceSource.regionName}` : ''}
            </span>
          </div>
          <div className="form-grid">
            <ConfigInput label="Tarifa base" name="baseRate" onChange={setSettingsDraft} settings={settingsDraft} />
            <ConfigInput label="Fallback petroleo $/L" name="dieselPricePerLiter" onChange={setSettingsDraft} settings={settingsDraft} />
            <ConfigInput label="Rendimiento km/L" name="fuelKmPerLiter" onChange={setSettingsDraft} settings={settingsDraft} step="0.1" />
            <ConfigInput label="Operacion $/km" name="operationCostPerKm" onChange={setSettingsDraft} settings={settingsDraft} />
            <ConfigInput label="Margen %" name="marginPercent" onChange={setSettingsDraft} settings={settingsDraft} step="0.1" />
            <ConfigInput label="IVA %" name="taxPercent" onChange={setSettingsDraft} settings={settingsDraft} step="0.1" />
            <ConfigInput label="Markup peajes %" name="tollMarkupPercent" onChange={setSettingsDraft} settings={settingsDraft} step="0.1" />
          </div>
          <div className="inline-actions">
            <Button disabled={isSaving} icon={<Settings2 size={17} />} onClick={handleSaveSettings} size="sm" type="button" variant="secondary">
              Guardar configuracion
            </Button>
            <span className="muted-text">Se persiste en SQL Server y afecta nuevas cotizaciones.</span>
          </div>
        </div>
        <div className="inline-actions">
          <Button disabled={isSaving || !calculation} icon={<Save size={18} />} onClick={handleCreateQuote} type="button">
            {isSaving ? 'Guardando...' : 'Guardar borrador'}
          </Button>
          <Button disabled={isSaving} icon={<Calculator size={18} />} onClick={() => setSettingsVersion((version) => version + 1)} type="button" variant="secondary">
            Recalcular
          </Button>
          {statusMessage ? <span className="muted-text">{statusMessage}</span> : null}
        </div>
      </div>
    </Card>
  )
}

type ConfigField = 'baseRate' | 'dieselPricePerLiter' | 'fuelKmPerLiter' | 'marginPercent' | 'operationCostPerKm' | 'taxPercent' | 'tollMarkupPercent'

interface ConfigInputProps {
  label: string
  name: ConfigField
  onChange: (value: SetStateAction<Partial<FreightPricingSettings>>) => void
  settings: Partial<FreightPricingSettings>
  step?: string
}

function ConfigInput({ label, name, onChange, settings, step = '1' }: ConfigInputProps) {
  return (
    <Input
      label={label}
      min={0}
      name={name}
      onChange={(event) =>
        onChange((current) => ({
          ...current,
          [name]: Number(event.target.value),
        }))
      }
      step={step}
      type="number"
      value={settings[name] ?? ''}
    />
  )
}
