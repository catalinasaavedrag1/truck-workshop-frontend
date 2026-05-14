import type { SelectHTMLAttributes } from 'react'
import type { SelectOption } from '../../types/common.types'
import styles from './Select.module.css'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  errorText?: string
  helperText?: string
  label?: string
  options: SelectOption[]
}

export function Select({ errorText, helperText, label, options, id, className = '', ...props }: SelectProps) {
  const selectId = id || props.name

  return (
    <label className={[styles.field, className].filter(Boolean).join(' ')} htmlFor={selectId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <select aria-invalid={errorText ? true : undefined} className={styles.select} id={selectId} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errorText ? <span className={styles.error}>{errorText}</span> : null}
      {!errorText && helperText ? <span className={styles.helper}>{helperText}</span> : null}
    </label>
  )
}
