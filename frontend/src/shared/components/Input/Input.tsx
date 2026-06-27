import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  errorText?: string
  label?: string
  helperText?: string
}

export function Input({ label, helperText, errorText, id, className = '', ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id || props.name || generatedId
  const descriptionId = errorText || helperText ? `${inputId}-description` : undefined

  return (
    <label className={[styles.field, className].filter(Boolean).join(' ')} htmlFor={inputId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <input
        aria-describedby={descriptionId}
        aria-invalid={errorText ? true : undefined}
        className={styles.input}
        id={inputId}
        {...props}
      />
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
