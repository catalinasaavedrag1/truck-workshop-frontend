import { useId } from 'react'
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
  const generatedId = useId()
  const selectId = id || props.name || generatedId
  const descriptionId = errorText || helperText ? `${selectId}-description` : undefined

  return (
    <label className={[styles.field, className].filter(Boolean).join(' ')} htmlFor={selectId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <select
        aria-describedby={descriptionId}
        aria-invalid={errorText ? true : undefined}
        className={styles.select}
        id={selectId}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errorText ? (
        <span className={styles.error} id={descriptionId}>
          {errorText}
        </span>
      ) : helperText ? (
        <span className={styles.helper} id={descriptionId}>
          {helperText}
        </span>
      ) : null}
    </label>
  )
}
