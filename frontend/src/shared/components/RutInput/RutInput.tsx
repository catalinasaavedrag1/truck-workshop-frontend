import type { ChangeEvent, ComponentProps } from 'react'
import { Input } from '../Input/Input'
import { formatRut } from '../../utils/rut'

type RutInputProps = Omit<ComponentProps<typeof Input>, 'defaultValue' | 'inputMode' | 'maxLength' | 'onChange' | 'type' | 'value'> & {
  defaultValue?: string | number
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
}

export function RutInput({
  defaultValue = '',
  helperText = 'Se formatea automaticamente como 20.007.759-8.',
  onChange,
  placeholder = '20.007.759-8',
  ...props
}: RutInputProps) {
  const formattedDefaultValue = formatRut(String(defaultValue ?? ''))

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatRut(event.target.value)
    event.target.value = formattedValue
    onChange?.(event)
  }

  return (
    <Input
      {...props}
      defaultValue={formattedDefaultValue}
      helperText={helperText}
      inputMode="text"
      key={formattedDefaultValue}
      maxLength={12}
      onChange={handleChange}
      placeholder={placeholder}
      type="text"
    />
  )
}
