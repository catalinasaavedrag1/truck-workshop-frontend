import { Upload } from 'lucide-react'
import styles from './TripChecklistModule.module.css'

interface ChecklistEvidenceUploaderProps {
  slots?: string[]
}

export function ChecklistEvidenceUploader({ slots = ['Foto unidad', 'Foto detalle', 'Firma'] }: ChecklistEvidenceUploaderProps) {
  return (
    <div className={styles.evidencePanel}>
      <div className={styles.evidenceHeader}>
        <div>
          <strong>Evidencia</strong>
          <p className={styles.muted}>Fotos y firmas respaldan el cierre operacional del checklist.</p>
        </div>
        <span className={styles.evidenceIcon}>
          <Upload aria-hidden size={17} />
        </span>
      </div>
      <div className={styles.evidenceSlots}>
        {slots.map((slot) => (
          <span className={styles.evidenceSlot} key={slot}>
            {slot}
          </span>
        ))}
      </div>
    </div>
  )
}
