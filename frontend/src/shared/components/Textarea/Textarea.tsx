import type { TextareaHTMLAttributes } from 'react'
import styles from './Textarea.module.css'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  errorText?: string
  helperText?: string
  label?: string
}

export function Textarea({ className = '', errorText, helperText, id, label, ...props }: TextareaProps) {
  const textareaId = id || props.name

  return (
    <label className={[styles.field, className].filter(Boolean).join(' ')} htmlFor={textareaId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <textarea
        aria-invalid={errorText ? true : undefined}
        className={styles.textarea}
        id={textareaId}
        {...props}
      />
      {errorText ? <span className={styles.error}>{errorText}</span> : null}
      {!errorText && helperText ? <span className={styles.helper}>{helperText}</span> : null}
    </label>
  )
}
