import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Camera, CircleDollarSign, Gauge, ReceiptText, Save, ShieldCheck, TriangleAlert } from 'lucide-react'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { Input } from '../../../shared/components/Input/Input'
import { Select } from '../../../shared/components/Select/Select'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { toast } from '../../../shared/services/toastStore'
import { createResource } from '../../../shared/services/resourceApi'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { driversMock } from '../../drivers/mocks/drivers.mock'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import { useFuelPrice } from '../hooks/useFuelPrice'
import type { FuelRecord } from '../types/fuel.types'
import styles from './FuelModule.module.css'

export function FuelRecordForm() {
  const [liters, setLiters] = useState(0)
  const [pricePerLiter, setPricePerLiter] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const { errorMessage: fuelPriceError, fuelPrice, isLoading: isFuelPriceLoading } = useFuelPrice()
  const effectivePricePerLiter = pricePerLiter || fuelPrice?.pricePerLiter || 0
  const total = useMemo(() => liters * effectivePricePerLiter, [effectivePricePerLiter, liters])
  const averageTicket = liters > 0 ? total / liters : 0

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const payloadLiters = Number(formData.get('liters') || 0)
    const payloadPricePerLiter = Number(formData.get('pricePerLiter') || 0)

    setErrorMessage('')
    setIsSaving(true)

    try {
      const record = await createResource<FuelRecord, Omit<FuelRecord, 'id'>>('/fuel/records', {
        date: toIsoDateTime(String(formData.get('date') || '')) || new Date().toISOString(),
        deviationStatus: 'NORMAL',
        driverId: String(formData.get('driverId') || ''),
        kmPerLiter: undefined,
        liters: payloadLiters,
        odometer: Number(formData.get('odometer') || 0),
        pricePerLiter: payloadPricePerLiter,
        receiptNumber: String(formData.get('receiptNumber') || '').trim(),
        stationName: String(formData.get('stationName') || '').trim(),
        totalAmount: payloadLiters * payloadPricePerLiter,
        truckId: String(formData.get('truckId') || ''),
      })

      toast.success('Carga registrada', `Carga ${record.receiptNumber || record.id} guardada en backend.`)
      setLiters(0)
      form.reset()
      setPricePerLiter(0)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={styles.formShell}>
      <Card className={styles.formCard}>
        <form className={styles.formStack} onSubmit={handleSubmit}>
          {errorMessage ? <ErrorState description={errorMessage} title="No se pudo guardar la carga" /> : null}
          <section className={styles.formSection}>
            <div className={styles.formSectionHeader}>
              <div className={styles.formHeaderCopy}>
                <h2>Contexto de carga</h2>
                <p className={styles.muted}>Identifica unidad, chofer y punto de abastecimiento.</p>
              </div>
              <Badge tone="info">Captura</Badge>
            </div>
            <div className="form-grid">
              <Select
                label="Camion"
                name="truckId"
                options={fleetTrucksMock.map((truck) => ({ label: `${truck.plate} - ${truck.brand} ${truck.model}`, value: truck.id }))}
              />
              <Select
                label="Chofer"
                name="driverId"
                options={driversMock.map((driver) => ({ label: driver.name, value: driver.id }))}
              />
              <Input label="Estacion" name="stationName" placeholder="Copec Quilicura" />
              <Input label="Numero comprobante" name="receiptNumber" placeholder="B-77891" />
            </div>
          </section>
          <section className={styles.formSection}>
            <div className={styles.formSectionHeader}>
              <div className={styles.formHeaderCopy}>
                <h2>Lectura de combustible</h2>
                <p className={styles.muted}>Litros, precio y odometro alimentan rendimiento y desviacion.</p>
              </div>
              <Badge tone="warning">Costo</Badge>
            </div>
            <div className="form-grid">
              <Input
                label="Litros"
                min={0}
                name="liters"
                onChange={(event) => setLiters(Number(event.target.value))}
                placeholder="180"
                type="number"
              />
              <Input
                helperText={
                  fuelPriceError ||
                  (isFuelPriceLoading
                    ? 'Consultando precio...'
                    : fuelPrice?.status === 'OK'
                      ? `${fuelPrice.source} - ${fuelPrice.regionName || 'Chile'}`
                      : 'Fallback configurable')
                }
                label="Precio por litro"
                min={0}
                name="pricePerLiter"
                onChange={(event) => setPricePerLiter(Number(event.target.value))}
                placeholder="1090"
                type="number"
                value={effectivePricePerLiter || ''}
              />
              <Input label="Odometro" min={0} name="odometer" placeholder="94120" type="number" />
              <Input label="Fecha carga" name="date" type="datetime-local" />
            </div>
          </section>
          <section className={styles.formSection}>
            <div className={styles.formSectionHeader}>
              <div className={styles.formHeaderCopy}>
                <h2>Control calculado</h2>
                <p className={styles.muted}>Resumen inmediato antes de guardar el registro.</p>
              </div>
              <CircleDollarSign aria-hidden size={18} />
            </div>
            <div className={styles.calculationPanel}>
              <div className={styles.calculationCard}>
                <span>Total calculado</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <div className={styles.calculationCard}>
                <span>Precio efectivo</span>
                <strong>{formatCurrency(averageTicket)} / l</strong>
              </div>
              <div className={styles.calculationCard}>
                <span>Validacion</span>
                <strong>{liters > 0 && effectivePricePerLiter > 0 ? 'Lista' : 'Pendiente'}</strong>
              </div>
            </div>
          </section>
          <section className={styles.formSection}>
            <div className={styles.formSectionHeader}>
              <div className={styles.formHeaderCopy}>
                <h2>Evidencia</h2>
                <p className={styles.muted}>Respalda cargas caras o desviadas con lectura visual.</p>
              </div>
              <Camera aria-hidden size={18} />
            </div>
            <div className={styles.evidencePanel}>
              <div className={styles.evidenceHeader}>
                <div>
                  <strong>Respaldo operativo</strong>
                  <p className={styles.muted}>Preparado para conectar adjuntos reales.</p>
                </div>
                <span className={styles.evidenceIcon}>
                  <ReceiptText aria-hidden size={17} />
                </span>
              </div>
              <div className={styles.evidenceSlots}>
                <span className={styles.evidenceSlot}>Comprobante</span>
                <span className={styles.evidenceSlot}>Odometro</span>
                <span className={styles.evidenceSlot}>Surtidor</span>
              </div>
            </div>
          </section>
          <div className={styles.formActions}>
            <Button disabled={liters <= 0 || effectivePricePerLiter <= 0} icon={<Save size={18} />} loading={isSaving} type="submit">
              Guardar carga
            </Button>
            <span className={styles.muted}>El rendimiento se evaluara contra historico por camion.</span>
          </div>
        </form>
      </Card>
      <Card className={styles.asideCard}>
        <div>
          <h2 className="section-title">Patrones de validacion</h2>
          <p className={styles.muted}>Usa esta lectura para decidir si una carga entra normal o a revision.</p>
        </div>
        <div className={styles.ruleList}>
          <div className={styles.ruleItem}>
            <span className={styles.ruleIcon}>
              <ShieldCheck aria-hidden size={16} />
            </span>
            <div>
              <strong>Registro normal</strong>
              <p className={styles.muted}>Litros, precio, odometro y boleta coinciden.</p>
            </div>
          </div>
          <div className={styles.ruleItem}>
            <span className={styles.ruleIcon}>
              <Gauge aria-hidden size={16} />
            </span>
            <div>
              <strong>Desviacion</strong>
              <p className={styles.muted}>El rendimiento queda bajo el promedio esperado.</p>
            </div>
          </div>
          <div className={styles.ruleItem}>
            <span className={styles.ruleIcon}>
              <TriangleAlert aria-hidden size={16} />
            </span>
            <div>
              <strong>Investigar</strong>
              <p className={styles.muted}>Caida fuerte, comprobante faltante o odometro inconsistente.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function toIsoDateTime(value: string) {
  return value ? new Date(value).toISOString() : undefined
}
