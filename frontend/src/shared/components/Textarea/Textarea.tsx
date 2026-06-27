import { useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import styles from './Textarea.module.css'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  errorText?: string
  helperText?: string
  label?: string
}

export function Textarea({ className = '', errorText, helperText, id, label, ...props }: TextareaProps) {
  const generatedId = useId()
  const textareaId = id || props.name || generatedId
  const descriptionId = errorText || helperText ? `${textareaId}-description` : undefined

  return (
    <label className={[styles.field, className].filter(Boolean).join(' ')} htmlFor={textareaId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <textarea
        aria-describedby={descriptionId}
        aria-invalid={errorText ? true : undefined}
        className={styles.textarea}
        id={textareaId}
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
