import { CloudOff } from 'lucide-react'
import { useApiStatus } from '../../services/apiStatus'
import styles from './ConnectionBanner.module.css'

/**
 * Aviso global cuando el backend no responde. Hace explicito que la app esta en
 * "modo demo" sirviendo datos mock y que los cambios no se guardaran, para que el
 * usuario no crea que la app esta rota cuando en realidad falta levantar la API.
 */
export function ConnectionBanner() {
  const status = useApiStatus()

  if (status !== 'offline') {
    return null
  }

  return (
    <div className={styles.banner} role="status">
      <CloudOff aria-hidden className={styles.icon} size={16} />
      <span className={styles.text}>
        <strong>Modo demo</strong> · sin conexion con el backend. Se muestran datos de ejemplo y los cambios no se guardan.
      </span>
    </div>
  )
}
