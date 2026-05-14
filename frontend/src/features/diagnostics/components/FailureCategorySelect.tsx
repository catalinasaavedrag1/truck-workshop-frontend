import { Select } from '../../../shared/components/Select/Select'

const categoryOptions = [
  { label: 'Motor', value: 'engine' },
  { label: 'Frenos', value: 'brakes' },
  { label: 'Electrico', value: 'electric' },
  { label: 'Transmision', value: 'transmission' },
  { label: 'Neumaticos', value: 'tires' },
  { label: 'Otro', value: 'other' },
]

export function FailureCategorySelect() {
  return <Select label="Categoria de falla" name="category" options={categoryOptions} />
}
