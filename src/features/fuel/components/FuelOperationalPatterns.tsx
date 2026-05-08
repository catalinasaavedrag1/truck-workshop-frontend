import { Badge } from '../../../shared/components/Badge/Badge'
import { Card } from '../../../shared/components/Card/Card'
import { Camera, Gauge, ReceiptText, TriangleAlert } from 'lucide-react'
import styles from './FuelModule.module.css'

export function FuelOperationalPatterns() {
  return (
    <Card>
      <div className={styles.patternGrid}>
        <div className={styles.patternCard}>
          <div className={styles.patternHeader}>
            <div className={styles.patternCopy}>
              <span className={styles.phaseLabel}>Captura</span>
              <strong>Carga verificable</strong>
            </div>
            <span className={styles.patternIcon}>
              <ReceiptText aria-hidden size={17} />
            </span>
          </div>
          <div className={styles.patternList}>
            <span className={styles.patternItem}>
              Litros + precio <Badge tone="info">Costo</Badge>
            </span>
            <span className={styles.patternItem}>
              Boleta + estacion <Badge tone="success">Respaldo</Badge>
            </span>
          </div>
        </div>
        <div className={styles.patternCard}>
          <div className={styles.patternHeader}>
            <div className={styles.patternCopy}>
              <span className={styles.phaseLabel}>Rendimiento</span>
              <strong>Consumo por km/l</strong>
            </div>
            <span className={styles.patternIcon}>
              <Gauge aria-hidden size={17} />
            </span>
          </div>
          <div className={styles.patternList}>
            <span className={styles.patternItem}>
              Sobre promedio <Badge tone="success">Normal</Badge>
            </span>
            <span className={styles.patternItem}>
              Bajo promedio <Badge tone="warning">Revisar</Badge>
            </span>
          </div>
        </div>
        <div className={styles.patternCard}>
          <div className={styles.patternHeader}>
            <div className={styles.patternCopy}>
              <span className={styles.phaseLabel}>Desviacion</span>
              <strong>Accion operacional</strong>
            </div>
            <span className={styles.patternIcon}>
              <TriangleAlert aria-hidden size={17} />
            </span>
          </div>
          <div className={styles.patternList}>
            <span className={styles.patternItem}>
              Caida moderada <Badge tone="warning">Control</Badge>
            </span>
            <span className={styles.patternItem}>
              Caida fuerte <Badge tone="danger">Investigar</Badge>
            </span>
          </div>
        </div>
        <div className={styles.patternCard}>
          <div className={styles.patternHeader}>
            <div className={styles.patternCopy}>
              <span className={styles.phaseLabel}>Evidencia</span>
              <strong>Trazabilidad minima</strong>
            </div>
            <span className={styles.patternIcon}>
              <Camera aria-hidden size={17} />
            </span>
          </div>
          <div className={styles.patternList}>
            <span className={styles.patternItem}>
              Comprobante <Badge tone="info">Documento</Badge>
            </span>
            <span className={styles.patternItem}>
              Odometro <Badge tone="success">Lectura</Badge>
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
