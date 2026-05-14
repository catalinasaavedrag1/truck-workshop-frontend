import { Input } from '../../../shared/components/Input/Input'

export function SymptomsForm() {
  return (
    <div className="form-grid">
      <Input label="Sintoma principal" name="symptomPrimary" placeholder="Perdida de potencia" required />
      <Input label="Condicion" name="condition" placeholder="En subida, con carga completa" />
      <Input className="span-2" label="Observaciones" name="notes" placeholder="Detalle tecnico inicial" />
    </div>
  )
}
