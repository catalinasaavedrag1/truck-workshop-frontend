import type { CSSProperties } from 'react'
import styles from './Skeleton.module.css'

interface SkeletonProps {
  /** Ancho CSS (ej: '100%', '120px', '6ch'). Por defecto 100%. */
  width?: string
  /** Alto CSS. Por defecto 0.9rem (alto de una linea de texto). */
  height?: string
  /** Forma redonda, util para avatares o iconos. */
  circle?: boolean
  className?: string
}

/**
 * Bloque "esqueleto" con shimmer para estados de carga. Da sensacion de velocidad
 * al mostrar la estructura del contenido antes de que llegue el dato. Respeta
 * prefers-reduced-motion (sin animacion).
 */
export function Skeleton({ width = '100%', height = '0.9rem', circle = false, className = '' }: SkeletonProps) {
  const style: CSSProperties = {
    width,
    height,
    borderRadius: circle ? '50%' : undefined,
  }

  return <span aria-hidden className={[styles.skeleton, className].filter(Boolean).join(' ')} style={style} />
}
