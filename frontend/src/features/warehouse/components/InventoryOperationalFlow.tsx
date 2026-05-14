import { Badge } from '../../../shared/components/Badge/Badge'
import { Card } from '../../../shared/components/Card/Card'
import styles from './InventoryModule.module.css'

const steps = [
  {
    helper: 'El taller pide SKU desde diagnostico, solucion o caso.',
    label: '1. Demanda taller',
  },
  {
    helper: 'Bodega valida existencia, ubicacion y stock minimo.',
    label: '2. Stock y ubicacion',
  },
  {
    helper: 'Si falta stock, se crea solicitud u OC ligada al SKU.',
    label: '3. Compra',
  },
  {
    helper: 'Recepcion actualiza stock y deja trazabilidad de movimiento.',
    label: '4. Recepcion',
  },
  {
    helper: 'Entrega a caso, mecanico o camion y desbloquea operacion.',
    label: '5. Entrega',
  },
]

export function InventoryOperationalFlow() {
  return (
    <Card>
      <div className={styles.reportPanel}>
        <div className={styles.flowHeader}>
          <div>
            <h2>Flujo operativo de inventario</h2>
            <p className={styles.muted}>Una sola lectura para entender demanda, stock, compras, recepcion y entrega.</p>
          </div>
          <Badge tone="info">Bodega + SKUs + Compras</Badge>
        </div>
        <div className={styles.flowGrid}>
          {steps.map((step) => (
            <div className={styles.flowStep} key={step.label}>
              <strong>{step.label}</strong>
              <span>{step.helper}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
