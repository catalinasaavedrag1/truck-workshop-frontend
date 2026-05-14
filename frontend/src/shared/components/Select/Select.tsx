import type { SelectHTMLAttributes } from 'react'
import styles from './Select.module.css'

interface SelectOption {
  label: string
  value: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
}

export function Select({ label, options, id, className = '', ...props }: SelectProps) {
  const selectId = id || props.name

  return (
    <label className={[styles.field, className].filter(Boolean).join(' ')} htmlFor={selectId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <select className={styles.select} id={selectId} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
