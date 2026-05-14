import { ClipboardList, MapPinned, PackageCheck, ShoppingCart } from 'lucide-react'
import { Card } from '../../../shared/components/Card/Card'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import styles from './WarehouseOperationalFlow.module.css'

const steps = [
  {
    description: 'El caso declara los repuestos necesarios y si bloquean la reparacion.',
    icon: <ClipboardList aria-hidden size={18} />,
    title: '1. Caso solicita',
  },
  {
    description: 'Bodega valida stock disponible contra minimo y cantidad requerida.',
    icon: <PackageCheck aria-hidden size={18} />,
    title: '2. Stock responde',
  },
  {
    description: 'La ubicacion indica donde retirar o si la zona esta llena/en mantencion.',
    icon: <MapPinned aria-hidden size={18} />,
    title: '3. Ubicacion guia',
  },
  {
    description: 'Si falta stock, se sigue solicitud u orden de compra hasta recepcion.',
    icon: <ShoppingCart aria-hidden size={18} />,
    title: '4. Compra destraba',
  },
]

export function WarehouseOperationalFlow() {
  return (
    <Card>
      <div className="stack">
        <SectionHeader
          description="Lectura rapida del flujo operacional para entender que falta, donde esta y que accion sigue."
          title="Como se conecta Bodega con Taller"
        />
        <div className={styles.flow}>
          {steps.map((step) => (
            <article className={styles.step} key={step.title}>
              <div className={styles.stepHeader}>
                {step.icon}
                <strong>{step.title}</strong>
              </div>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </Card>
  )
}
