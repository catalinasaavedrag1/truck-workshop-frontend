import { CalendarClock, CheckCircle2, ClipboardCheck } from 'lucide-react'
import { Card } from '../../../shared/components/Card/Card'
import { formatDate } from '../../../shared/utils/formatDate'
import styles from './TruckModule.module.css'
import { getTruckServiceRisk } from '../utils/truckMaintenance'

interface TruckHistoryProps {
  lastServiceAt: string
}

export function TruckHistory({ lastServiceAt }: TruckHistoryProps) {
  const risk = getTruckServiceRisk(lastServiceAt)

  return (
    <Card className={styles.detailCard}>
      <div className={styles.detailHeader}>
        <span className={styles.detailIcon}>
          <CalendarClock aria-hidden size={18} />
        </span>
        <div>
          <h2>Historial reciente</h2>
          <p className={styles.detailMeta}>Eventos relevantes para la proxima decision operativa.</p>
        </div>
      </div>
      <div className={styles.timelineList}>
        <div className={styles.timelineItem}>
          <span className={styles.timelineIcon}>
            <CheckCircle2 aria-hidden size={16} />
          </span>
          <div className={styles.timelineCopy}>
            <strong>Mantencion preventiva</strong>
            <p className={styles.detailMeta}>Filtros, fluidos y revision general completada.</p>
          </div>
          <span className={styles.timelineDate}>{formatDate(lastServiceAt)}</span>
        </div>
        <div className={styles.timelineItem}>
          <span className={styles.timelineIcon}>
            <ClipboardCheck aria-hidden size={16} />
          </span>
          <div className={styles.timelineCopy}>
            <strong>Inspeccion de seguridad</strong>
            <p className={styles.detailMeta}>{risk.tone === 'success' ? 'Checklist previo a ruta sugerido.' : risk.helper}</p>
          </div>
          <span className={styles.timelineDate}>{risk.tone === 'success' ? 'Pendiente' : 'Prioritaria'}</span>
        </div>
      </div>
    </Card>
  )
}
