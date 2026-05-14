import type { InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
}

export function Input({ label, helperText, id, className = '', ...props }: InputProps) {
  const inputId = id || props.name

  return (
    <label className={[styles.field, className].filter(Boolean).join(' ')} htmlFor={inputId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <input className={styles.input} id={inputId} {...props} />
      {helperText ? <span className={styles.helper}>{helperText}</span> : null}
    </label>
  )
}
