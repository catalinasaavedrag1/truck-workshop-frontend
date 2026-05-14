import type { InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  errorText?: string
  label?: string
  helperText?: string
}

export function Input({ label, helperText, errorText, id, className = '', ...props }: InputProps) {
  const inputId = id || props.name

  return (
    <label className={[styles.field, className].filter(Boolean).join(' ')} htmlFor={inputId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <input aria-invalid={errorText ? true : undefined} className={styles.input} id={inputId} {...props} />
      {errorText ? <span className={styles.error}>{errorText}</span> : null}
      {!errorText && helperText ? <span className={styles.helper}>{helperText}</span> : null}
    </label>
  )
}
