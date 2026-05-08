import { Select } from '../../../shared/components/Select/Select'

const supplierOptions = [
  { label: 'Frenos Andinos Ltda.', value: 'Frenos Andinos Ltda.' },
  { label: 'Transmisiones Sur', value: 'Transmisiones Sur' },
  { label: 'Diesel Norte', value: 'Diesel Norte' },
  { label: 'Repuestos Ruta 5', value: 'Repuestos Ruta 5' },
]

export function SupplierSelect() {
  return <Select label="Proveedor" name="supplierName" options={supplierOptions} />
}
