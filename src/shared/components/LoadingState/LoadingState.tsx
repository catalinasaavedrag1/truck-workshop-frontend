import styles from './LoadingState.module.css'

interface LoadingStateProps {
  label?: string
}

export function LoadingState({ label = 'Cargando datos' }: LoadingStateProps) {
  return (
    <div aria-busy="true" className={styles.loading} role="status">
      <span className={styles.spinner} />
      <span>{label}</span>
    </div>
  )
}
